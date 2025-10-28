import * as cheerio from "cheerio"
import {MongoClient} from "mongodb"
import path from "path"
import dotenv from "dotenv"
import pLimit from "p-limit"  
import { fileURLToPath } from "url";
import { fetchJson,getUsdaFoodDetail,searchUsdaByName } from "./indexScraper.js"

// env setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../server/.env") });

// basic settings
const MONGO_URI = process.env.MONGO_URI!;
const WIKI_API = "https://en.wikipedia.org/w/api.php";

type WikiSeedMeta = {
    title: string;
    fullurl: string;
    thumbnailUrl? : string;
    fallBackImageUrl?: string | undefined;
}

type Seed = {
    name: string;
    foodType: "seed";
    wikiUrl: string;
    imageUrl?: string | undefined;
    fdcId?: number;
    nutrition?: { name: string; value: number; unit: string }[];
    author: string;
    createdAt: Date;
}

type WikiTableSeed = {
    name: string,
    imageUrl?: string | undefined,
}

export async function getSeedTitlesFromWiki(): Promise<WikiTableSeed[]> {
  const url = "https://en.wikipedia.org/wiki/List_of_edible_seeds";
  const res = await fetch(url);
  const html = await res.text();
  const $ = cheerio.load(html);

  const seeds: WikiTableSeed[] = [];
  const content = $("#mw-content-text .mw-parser-output");

  const children = content.children();
  let shouldStop = false;
  
  children.each((_, child) => {
    if (shouldStop) return false;
    
    const $child = $(child);
    
    // old structure
    // if ($child.is("h2")) {
    //   const $headline = $child.find(".mw-headline");
    //   const headlineId = $headline.attr("id");
    //   const headlineText = $headline.text().trim().toLowerCase();
      
    //   if (headlineId === "See_also" || 
    //       headlineText === "see also" || 
    //       headlineText.startsWith("see also")) {
    //     shouldStop = true;
    //     return false; // stop iteration
    //   }
    // }

    // new structure
    if ($child.is("h2") || $child.hasClass("mw-heading")) {

      const $heading = $child.is("h2") ? $child : $child.find("h2");
      const headlineId = $heading.attr("id");
      const headlineText = $heading.text().trim().toLowerCase();
      
      if (headlineId === "See_also" || 
          headlineText === "see also" || 
          headlineText.startsWith("see also")) {
        shouldStop = true;
        return false; // stop iteration
      }
    }
    
    // Process tables
    if ($child.is("table.wikitable")) {
      $child.find("tr").each((_, row) => {
        const $row = $(row);
        if ($row.find("th").length) return;

        const cells = $row.find("td");
        if (!cells.length) return;

        let nameCell: any | null = null;

        cells.each((i, cell) => {
          if (i === 0) return; // skip first column
          const $cell = $(cell);
          const children = $cell.children();

          if (
            children.length === 0 ||
            (children.length === 1 && children.first().is("a"))
          ) {
            nameCell = $cell;
            return false;
          }
        });

        if (!nameCell) return;

        let name = cleanName(nameCell.text());
        if (!name) return;

        const imgSrc = $row.find("img").attr("src");
        const imageUrl = imgSrc
          ? imgSrc.startsWith("http")
            ? imgSrc
            : `https:${imgSrc}`
          : undefined;

        if (!seeds.some((s) => s.name === name)) {
          seeds.push({ name, imageUrl });
        }
      });
    }
    
    // Process direct ul children OR ul elements inside divs (but only direct children of this element)
    let listsToProcess: any[] = [];
    
    if ($child.is("ul")) {
      listsToProcess.push($child);
    } else if ($child.is("div")) {
      // Only get direct child ul elements
      $child.children("ul").each((_, ul) => {
        listsToProcess.push($(ul));
      });
    }
    
    for (const $ul of listsToProcess) {
      $ul.find("> li").each((_: any, li: any) => {
        const $li = $(li);

        // find nested links
        const nestedUls = $li.find("> ul");
        if (nestedUls.length > 0) {
          nestedUls.find("> li > a").each((_, nestedLink: any) => {
            const name = cleanName($(nestedLink).text());
            if (name && !seeds.some((s) => s.name === name)) {
              seeds.push({ name });
            }
          });
          return;
        }

        const link = $li.find("> a").first();
        const text = link.length ? link.text() : $li.text();
        
        const parts = text.split(/\s*[–—-]\s*/);
        
        for (const part of parts) {
          const name = cleanName(part);
          if (name && !seeds.some((s) => s.name === name)) {
            seeds.push({ name });
          }
        }
      });
    }
  });

//   sort
  const uniqueSeeds = Array.from(new Map(seeds.map((s) => [s.name, s])).values())
    .sort((a, b) => a.name.localeCompare(b.name));

  console.log(`✅ Found ${uniqueSeeds.length} total seeds`);
  console.log(uniqueSeeds.slice(0, 25));

  return uniqueSeeds;
}

// clean name texts func for titles
function cleanName(text?: string): string {
  if (!text) return "";

  const str: string = text;

  let name = str.split("/")[0]!;
  name = name.split(",")[0]!;
  name = name.replace(/\s*\(.*?\)\s*/g, "");
  name = name.trim();

  if (!name || name.length > 60 || !/^[A-Za-z]/.test(name)) return "";

  return name;
}


// async function getSeedTitlesFromWiki(): Promise<WikiTableSeed[]> {
//   const url = "https://en.wikipedia.org/wiki/List_of_edible_seeds";
//   const res = await fetch(url);
//   const html = await res.text();

//   const $ = cheerio.load(html);
//   const seeds: WikiTableSeed[] = [];

//   const content = $("#mw-content-text");
//   let reachedStop = false;

//   // === TABLES ===
//   content.find("table.wikitable").each((_, table) => {
//     if (reachedStop) return;
//     const $table = $(table);

//     $table.find("tr").each((_, row) => {
//       const $row = $(row);
//       if ($row.find("th").length) return;

//       const cells = $row.find("td");
//       if (!cells.length) return;

//       let nameCell: any | null = null;

//       cells.each((i, cell) => {
//         if (i === 0) return; // skip first column
//         const $cell = $(cell);
//         const children = $cell.children();

//         if (
//           children.length === 0 ||
//           (children.length === 1 && children.first().is("a"))
//         ) {
//           nameCell = $cell;
//           return false;
//         }
//       });

//       if (!nameCell) return;

//       let name = nameCell.text().trim();
//       name = name
//         .split(/[–-]/)[0]
//         .split("/")[0]
//         .split(",")[0] // 👈 split by comma, take first
//         .replace(/\s*\(.*?\)\s*/g, "")
//         .trim();

//       if (!name) return;

//       const imgSrc = $row.find("img").attr("src");
//       const imageUrl = imgSrc
//         ? imgSrc.startsWith("http")
//           ? imgSrc
//           : `https:${imgSrc}`
//         : undefined;

//       if (!seeds.some((s) => s.name === name)) {
//         seeds.push({ name, imageUrl });
//       }
//     });
//   });

//   // === LISTS ===
//   content.find("ul").each((_, ul) => {
//     if (reachedStop) return;
//     const $ul = $(ul);

//     const prevHeader = $ul.prevAll("h2, h3").first();
//     if (
//       prevHeader.length &&
//       prevHeader.text().trim().toLowerCase().startsWith("see also")
//     ) {
//       reachedStop = true;
//       return false;
//     }

//     $ul.find("> li").each((_, li) => {
//       const $li = $(li);

//       if ($li.find("ul").length) return;

//       let text = $li.text().replace(/\s*\(.*?\)\s*/g, "").trim();
//       if (!text) return;

//       const parts = text
//         .split(/[,–-]/)
//         .map((t) => t.trim())
//         .filter((t) => t && /^[A-Z]/.test(t) && t.length < 60);

//       for (const name of parts) {
//         if (!seeds.some((s) => s.name === name)) {
//           seeds.push({ name });
//         }
//       }
//     });
//   });

//   const uniqueSeeds = Array.from(new Map(seeds.map((s) => [s.name, s])).values())
//     .sort((a, b) => a.name.localeCompare(b.name));

//   console.log(`✅ Found ${uniqueSeeds.length} total seeds`);
//   console.log(uniqueSeeds.slice(0, 25));

//   return uniqueSeeds;
// }

// all code for wiki api

// async function getSeedTitlesFromWikiPageList(): Promise<string[]>{
//     const url = new URL(WIKI_API);
//     url.searchParams.set("action","parse")
//     url.searchParams.set("page", "List_of_edible_seeds");
//     url.searchParams.set("prop", "links");
//     url.searchParams.set("format", "json");
//     url.searchParams.set("origin", "*");

//     const data = await fetchJson<any>(url.toString());

//     const links = data.parse?.links || [];
//     console.log("Some raw link titles:", links.slice(0, 50).map((l: any) => l.title));

//     const titles = links
//         .map((l: any) => l["*"])
//         .filter((title: string) => {
//         if (!title) return false;
//         if (title.includes(":")) return false;
//         if (title.startsWith("List of")) return false;
//         // if (title.length > 60) return false;
//         return true;
//         });

//     console.log("After filter:", titles.slice(0, 50))

//     return Array.from(new Set(titles))
// }


async function getWikiMetadata(titles: string[]): Promise<WikiSeedMeta[]>{
    const chunks = Array.from({length: Math.ceil(titles.length/ 40)}, (_,i) => titles.slice(i * 40,i * 40 + 40));

    const results : WikiSeedMeta[] = [];

    for (const chunk of chunks){
        const url = new URL(WIKI_API);
        url.searchParams.set("action", "query");
        url.searchParams.set("format", "json");
        url.searchParams.set("origin", "*");
        url.searchParams.set("prop", "pageimages|info");
        url.searchParams.set("piprop", "thumbnail");
        url.searchParams.set("pithumbsize", "500");
        url.searchParams.set("inprop", "url");
        url.searchParams.set("titles", chunk.join("|"));

        const data = await fetchJson<any>(url.toString());
        const pages = data.query?.pages || {};

        for (const pid in pages){
            const p = pages[pid];
            if (p.missing) continue;
            results.push({
                title: p.title,
                fullurl: p.fullurl,
                thumbnailUrl: p.thumbnail?.source
            })
        }
    }
    return results;
}

async function buildSeed(meta: WikiSeedMeta): Promise<Seed>{
    const record: Seed = {
        name: meta.title,
        foodType: "seed",
        wikiUrl: meta.fullurl,
        imageUrl: meta.thumbnailUrl || meta.fallBackImageUrl,
        author: "admin",
        createdAt: new Date(),
    }

    try{
        const results = await searchUsdaByName(meta.title);
        if (results.length === 0) return record;

        const best = results[0];
        console.log(best)
        const detail = await getUsdaFoodDetail(best.fdcId);

        record.fdcId = best.fdcId;
        record.nutrition = [];

        for(const nutrient of detail.foodNutrients || []){
            if(nutrient.amount != null && nutrient.nutrient?.name && nutrient.nutrient.unitName){
                record.nutrition.push({
                    name: nutrient.nutrient.name,
                    value: nutrient.amount,
                    unit: nutrient.nutrient.unitName,
                })
            }
        }
    } catch(err){
        console.warn(`USDA error for ${meta.title}: ${(err as Error).message}`);
    }

    return record;
}

async function saveToMongo(records: Seed[]){
 const client = new MongoClient(MONGO_URI);
  await client.connect();
  const db = client.db("myFoodDb");
  const coll = db.collection<Seed>("foods");

  const ops = records.map(rec => ({
    updateOne: {
        filter: {name: rec.name},
        update: {$set: rec},
        upsert: true,
    }
  }))

  if(ops.length){
    await coll.bulkWrite(ops);
    console.log(`Saved ${ops.length} seeds to MongoDB.`);
  }

  await client.close();
}


export async function runSeedScraper(){
    // console.log("getting foods from wiki..")
    // const linkedTitles =  await getSeedTitlesFromWikiPageList();
    // const tableSeeds = await getSeedTitlesFromWikiTables();
    // console.log(`found ${tableSeeds.length} seeds from tables.`)
    // console.log(`Found ${linkedTitles.length} seed titles.`);

    // const allTitles = Array.from(new Set([
    //     ...tableSeeds.map(s => s.name),
    //     ...linkedTitles
    // ]))

    const allSeeds = await getSeedTitlesFromWiki();
    const titles : string[] = allSeeds.map((s) => s.name)

    const wikiMeta = await getWikiMetadata(titles);

    const wikiMetaWithFallback : WikiSeedMeta[] = wikiMeta.map(meta => {
        const match = allSeeds.find(s => s.name === meta.title)
        return {
            ...meta,
            fallBackImageUrl: match?.imageUrl,
        }
    })

    const limit = pLimit(5);
    const records = await Promise.all(
        wikiMetaWithFallback.map(m => limit(() => buildSeed(m)))
    )

    console.log(`Processed ${records.length} seed records.`);
    await saveToMongo(records);
}

// main().catch((err) => {
//     console.error("Error",err);
//     process.exit(1);
// })