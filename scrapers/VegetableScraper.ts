import {MongoClient} from "mongodb"
import dotenv from "dotenv"
import pLimit from "p-limit"
import * as cheerio from 'cheerio'

dotenv.config();

// basic settings
const MONGO_URI = process.env.MONGO_URI!;
const WIKI_API = "https://en.wikipedia.org/w/api.php";
const USDA_SEARCH = "https://api.nal.usda.gov/fdc/v1/foods/search";
const USDA_DETAIL = (fdcId: number) => `https://api.nal.usda.gov/fdc/v1/food/${fdcId}`
const USDA_API_KEY = process.env.USDA_API_KEY!;

type WikiVegetableMeta = {
    title: string;
    fullurl: string;
    thumbnailUrl? : string;
}

type Vegetable = {
    name: string;
    foodType: "vegetable";
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

async function getVegetableTitlesFromWikiPageList(): Promise<string[]>{
    // const url = new URL(WIKI_API);
    // url.searchParams.set("action","parse")
    // url.searchParams.set("page", "List_of_vegetables");
    // url.searchParams.set("prop", "links");
    // url.searchParams.set("format", "json");
    // url.searchParams.set("origin", "*");

    // const data = await fetchJson<any>(url.toString());

    // const links = data.parse?.links || [];
    // console.log("Some raw link titles:", links.slice(0, 50).map((l: any) => l.title));

    // const titles = links
    //     .map((l: any) => l["*"])
    //     .filter((title: string) => {
    //     if (!title) return false;
    //     if (title.includes(":")) return false;
    //     if (title.startsWith("List of")) return false;
    //     // if (title.length > 60) return false;
    //     return true;
    //     });

    // console.log("After filter:", titles.slice(0, 50))

    // return Array.from(new Set(titles))

    const res = await fetch("https://en.wikipedia.org/wiki/List_of_vegetables");
      const html = await res.text();
      const $ = cheerio.load(html);
      const vegetables: string[] = [];
    
      const content = $('#mw-content-text');
      let reachedStop = false;
    
      content.find('*').each((_, el) => {
        const $el = $(el);
    
        if (
          $el.hasClass('mw-heading') &&
          $el.text().trim().toLowerCase().startsWith('see also')
        ) {
          reachedStop = true;
          return false; 
        }
    
        if (!reachedStop && $el.is('table')) {
          $el.find('tr').each((_, tr) => {
            $(tr)
              .find('td a[href^="/wiki/"]')
                .each((_, a) => {
                const $a = $(a);
                const text = $a.text() ?? "";
                const href = $a.attr("href") ?? "";

                const rawName = text
                    .split("/")[0]!
                    .replace(/\s*\(.*?\)\s*/g, "")
                    .trim();

                if (
                    rawName &&
                    href &&
                    !href.includes(":") &&
                    !rawName.includes("List of") &&
                    /^[A-Z]/.test(rawName)
                ) {
                    vegetables.push(rawName);
                }
                });
          });
        }
      });
    
      const uniqueVegetables = Array.from(new Set(vegetables))
        .filter((f) => f.length < 40)
        .sort();
    
      console.log(`✅ Total vegetables found: ${uniqueVegetables.length}`);
      console.log(uniqueVegetables.slice(0, 30));
    
      return uniqueVegetables;
}


async function getWikiMetadata(titles: string[]): Promise<WikiVegetableMeta[]>{
    const chunks = Array.from({length: Math.ceil(titles.length/ 40)}, (_,i) => titles.slice(i * 40,i * 40 + 40));

    const results : WikiVegetableMeta[] = [];

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

async function buildVegetable(meta: WikiVegetableMeta): Promise<Vegetable>{
    const record: Vegetable = {
        name: meta.title,
        foodType: "vegetable",
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

async function saveToMongo(records: Vegetable[]){
 const client = new MongoClient(MONGO_URI);
  await client.connect();
  const db = client.db("myFoodDb");
  const coll = db.collection<Vegetable>("vegetables");

  const ops = records.map(rec => ({
    updateOne: {
        filter: {name: rec.name},
        update: {$set: rec},
        upsert: true,
    }
  }))

  if(ops.length){
    await coll.bulkWrite(ops);
    console.log(`Saved ${ops.length} vegetables to MongoDB.`);
  }

  await client.close();
}


async function main(){
    console.log("getting food from wiki..")
    const titles =  await getVegetableTitlesFromWikiPageList();

    console.log(`Found ${titles.length} vegetable titles.`);
    const wikiMeta = await getWikiMetadata(titles);

    const limit = pLimit(5);
    const records = await Promise.all(
        wikiMeta.map(m => limit(() => buildVegetable(m)))
    )

    console.log(`Processed ${records.length} vegetable records.`);
    await saveToMongo(records);
}

main().catch((err) => {
    console.error("Error",err);
    process.exit(1);
})