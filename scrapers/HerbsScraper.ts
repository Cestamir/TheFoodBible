import {MongoClient} from "mongodb"
import dotenv from "dotenv"
import pLimit from "p-limit"
import * as cheerio from "cheerio";

dotenv.config();

// basic settings
const MONGO_URI = process.env.MONGO_URI!;
const WIKI_API = "https://en.wikipedia.org/w/api.php";
const USDA_SEARCH = "https://api.nal.usda.gov/fdc/v1/foods/search";
const USDA_DETAIL = (fdcId: number) => `https://api.nal.usda.gov/fdc/v1/food/${fdcId}`
const USDA_API_KEY = process.env.USDA_API_KEY!;

type WikiHerbMeta = {
    title: string;
    fullurl: string;
    thumbnailUrl? : string;
}

type Herb = {
    name: string;
    foodType: "herbs and spices";
    wikiUrl: string;
    imageUrl?: string | undefined;
    fdcId?: number;
    nutrition?: { name: string; value: number; unit: string }[];
    author: string;
    createdAt: Date;
}

async function fetchJson<T>(url: string,options?: RequestInit): Promise<T>{
    const res = await fetch(url,options);
    if(!res.ok) throw new Error(`Failed to fetch: ${res.statusText}`)
    return res.json();
}

// async function getHerbTitlesFromWikiPageList(): Promise<string[]>{
//     const url = new URL(WIKI_API);
//     url.searchParams.set("action","parse")
//     url.searchParams.set("page", "List_of_culinary_herbs_and_spices");
//     url.searchParams.set("prop", "links");
//     url.searchParams.set("format", "json");
//     url.searchParams.set("origin", "*");

//     console.log(url)

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

export async function getHerbsTitlesFromWiki(): Promise<string[]> {
  const url = "https://en.wikipedia.org/wiki/List_of_culinary_herbs_and_spices";
  const res = await fetch(url);
  const html = await res.text();
  const $ = cheerio.load(html);

  const herbs: string[] = [];
  const content = $("#mw-content-text .mw-parser-output");
  let reachedStop = false;

  content.children().each((_, el) => {
    if (reachedStop) return;
    const $el = $(el);

    if ($el.is("div.mw-heading") && $el.find("h2#See_also").length > 0) {
        reachedStop = true;
        return;
    }

    if ($el.is("div.div-col")) {
      $el.find("> ul > li").each((_, li) => {
        processLi($(li), herbs,$);
      });
    }
  });

  const uniqueHerbs = Array.from(new Set(herbs))
    .filter((h) => h.length < 60)
    .sort((a, b) => a.localeCompare(b));

  console.log(`✅ Found ${uniqueHerbs.length} total herbs/spices`);
  console.log(uniqueHerbs.slice(0, 25));

  return uniqueHerbs;
}

function processLi($li: cheerio.Cheerio<any>, herbs: string[],$: cheerio.CheerioAPI) {
  const name = extractHerbName($li,$);
  if (name && !herbs.includes(name)) herbs.push(name);

  $li.find("> ul > li").each((_, nestedLi) => {
    processLi($(nestedLi), herbs,$);
  });
}

function extractHerbName($li: cheerio.Cheerio<any>,$: cheerio.CheerioAPI): string {
  // Get all child nodes
  const nodes = $li.contents().toArray();

  for (const n of nodes) {
    if (n.type === "text") {
      const txt = (n.data || "").trim();
      if (!txt) continue;
      // Stop at ",", "/", "(", "—"
      const name = txt.split(/[,/()—]/)[0]!.trim();
      if (name) return name;
    }

    if (n.type === "tag") {
      const tag = n.tagName.toLowerCase();
      if (tag === "i" || tag === "a") {
        const txt = $(n).text().trim();
        if (!txt) continue;
        const name = txt.split(/[,/()—]/)[0]!.trim();
        if (name) return name;
      }
    }
  }

  const full = $li.text().trim();
  return full.split(/[,/()—]/)[0]!.trim();
}



async function getWikiMetadata(titles: string[]): Promise<WikiHerbMeta[]>{
    const chunks = Array.from({length: Math.ceil(titles.length/ 40)}, (_,i) => titles.slice(i * 40,i * 40 + 40));

    const results : WikiHerbMeta[] = [];

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

async function searchUsdaByName(name: string): Promise<any[]>{
    const url = new URL(USDA_SEARCH);
    url.searchParams.set("api_key",USDA_API_KEY)
    url.searchParams.set("query",name)
    url.searchParams.set("pageSize","5");

    const data = await fetchJson<any>(url.toString());
    return data.foods || [];
}

async function getUsdaFoodDetail(fdcId: number): Promise<any>{
    const url = new URL(USDA_DETAIL(fdcId));
    url.searchParams.set("api_key",USDA_API_KEY);
    return await fetchJson<any>(url.toString());
}

async function buildHerb(meta: WikiHerbMeta): Promise<Herb>{
    const record: Herb = {
        name: meta.title,
        foodType: "herbs and spices",
        wikiUrl: meta.fullurl,
        imageUrl: meta.thumbnailUrl,
        author: "admin",
        createdAt: new Date(),
    }

    try{
        const results = await searchUsdaByName(meta.title);
        if (results.length === 0) return record;

        const best = results[0];
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

async function saveToMongo(records: Herb[]){
 const client = new MongoClient(MONGO_URI);
  await client.connect();
  const db = client.db("myFoodDb");
  const coll = db.collection<Herb>("herbs");

  const ops = records.map(rec => ({
    updateOne: {
        filter: {name: rec.name},
        update: {$set: rec},
        upsert: true,
    }
  }))

  if(ops.length){
    await coll.bulkWrite(ops);
    console.log(`Saved ${ops.length} herbs and spices to MongoDB.`);
  }

  await client.close();
}


async function main(){
    console.log("getting herbs and spices from wiki..")
    const titles =  await getHerbsTitlesFromWiki();

    console.log(`Found ${titles.length} Herbs and spices titles.`);
    const wikiMeta = await getWikiMetadata(titles);

    const limit = pLimit(5);
    const records = await Promise.all(
        wikiMeta.map(m => limit(() => buildHerb(m)))
    )

    console.log(`Processed ${records.length} herbs and spices records.`);
    await saveToMongo(records);
}

main().catch((err) => {
    console.error("Error",err);
    process.exit(1);
})