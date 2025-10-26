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

type WikiFruitMeta = {
    title: string;
    fullurl: string;
    thumbnailUrl? : string;
}

type Fruit = {
    name: string;
    foodType: "fruit";
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

async function getFruitTitlesFromWikiPageList(): Promise<string[]> {
  const res = await fetch("https://en.wikipedia.org/wiki/List_of_culinary_fruits");
  const html = await res.text();
  const $ = cheerio.load(html);
  const fruits: string[] = [];

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
            const name = $(a).text().trim();
            const href = $(a).attr('href');

            if (
              name &&
              href &&
              !href.includes(':') &&
              !name.includes('List of') &&
              /^[A-Z]/.test(name)
            ) {
              fruits.push(name);
            }
          });
      });
    }
  });

  const uniqueFruits = Array.from(new Set(fruits))
    .filter((f) => f.length < 40)
    .sort();

  console.log(`✅ Total fruits found: ${uniqueFruits.length}`);
  console.log(uniqueFruits.slice(0, 30));

  return uniqueFruits;
}


async function getWikiMetadata(titles: string[]): Promise<WikiFruitMeta[]>{
    const chunks = Array.from({length: Math.ceil(titles.length/ 40)}, (_,i) => titles.slice(i * 40,i * 40 + 40));

    const results : WikiFruitMeta[] = [];

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

async function buildFruit(meta: WikiFruitMeta): Promise<Fruit>{
    const record: Fruit = {
        name: meta.title,
        foodType: "fruit",
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

async function saveToMongo(records: Fruit[]){
 const client = new MongoClient(MONGO_URI);
  await client.connect();
  const db = client.db("myFoodDb");
  const coll = db.collection<Fruit>("foods");

  const ops = records.map(rec => ({
    updateOne: {
        filter: {name: rec.name},
        update: {$set: rec},
        upsert: true,
    }
  }))

  if(ops.length){
    await coll.bulkWrite(ops);
    console.log(`Saved ${ops.length} fruits to MongoDB.`);
  }

  await client.close();
}


async function main(){
    console.log("getting foods from wiki..")
    const titles =  await getFruitTitlesFromWikiPageList();

    console.log(`Found ${titles.length} fruit titles.`);
    const wikiMeta = await getWikiMetadata(titles);

    const limit = pLimit(5);
    const records = await Promise.all(
        wikiMeta.map(m => limit(() => buildFruit(m)))
    )

    console.log(`Processed ${records.length} fruit records.`);
    await saveToMongo(records);
}

main().catch((err) => {
    console.error("Error",err);
    process.exit(1);
})

// // urls to scrape fruit,vegetables,nuts and seeds,meats,herbs and spices

// const urls = ["https://en.wikipedia.org/wiki/List_of_culinary_fruits","https://en.wikipedia.org/wiki/List_of_vegetables","https://en.wikipedia.org/wiki/List_of_edible_seeds","https://en.wikipedia.org/wiki/List_of_meat_dishes","https://en.wikipedia.org/wiki/List_of_culinary_herbs_and_spices"];

// async function fetchHtml(url : string) : Promise<string>{
//     const res = await fetch(url);
//     if (!res.ok) throw new Error(`failed to fetch ${url}`)
//     return await res.text();
// }

// async function scrapeFruits(){
//     if(!urls[0]) return;
//     const html = await fetchHtml(urls[0])
//     const $ = cheerio.load(html);

//     const fruits = [];
//     let foodType = "fruit";

//     $("")
// }
