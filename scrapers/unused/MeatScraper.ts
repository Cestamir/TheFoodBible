import {MongoClient} from "mongodb"
import dotenv from "dotenv"
import pLimit from "p-limit"
import * as cheerio from "cheerio";

// fetching to many lists ? need further testing..

dotenv.config();

function sleep(ms: number){
    return new Promise(resolve => setTimeout(resolve,ms))
}

let usdaRequests: number = 0;

// basic settings
const MONGO_URI = process.env.MONGO_URI!;
const WIKI_API = "https://en.wikipedia.org/w/api.php";
const USDA_SEARCH = "https://api.nal.usda.gov/fdc/v1/foods/search";
const USDA_DETAIL = (fdcId: number) => `https://api.nal.usda.gov/fdc/v1/food/${fdcId}`
const USDA_API_KEY = process.env.USDA_API_KEY!;

type WikiMeatFoodMeta = {
    title: string;
    fullurl: string;
    thumbnailUrl? : string;
}

type MeatFood = {
    name: string;
    foodType: string;
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

async function getMeatFoodTitlesFromWikiPageList(): Promise<string[]>{
    const url = new URL(WIKI_API);
    url.searchParams.set("action","parse")
    url.searchParams.set("page", "List_of_meat_dishes");
    url.searchParams.set("prop", "links");
    url.searchParams.set("format", "json");
    url.searchParams.set("origin", "*");

    const data = await fetchJson<any>(url.toString());

    const links = data.parse?.links || [];
    console.log("Some raw link titles:", links.slice(0, 50).map((l: any) => l.title));

    const titles = links
        .map((l: any) => l["*"])
        .filter((title: string) => {
        if (!title) return false;
        if (title.includes(":")) return false;
        if (title.startsWith("List of")) return false;
        // if (title.length > 60) return false;
        return true;
        });

    console.log("After filter:", titles.slice(0, 50))

    return Array.from(new Set(titles))
}


async function getWikiMetadata(titles: string[]): Promise<WikiMeatFoodMeta[]>{
    const chunks = Array.from({length: Math.ceil(titles.length/ 40)}, (_,i) => titles.slice(i * 40,i * 40 + 40));

    const results : WikiMeatFoodMeta[] = [];

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

async function throttleUsda(){
    if(usdaRequests === 1000){
            console.log("1000 request from USDA reached, wait for 1 hour")
            await sleep(3600000);
            usdaRequests = 0;
    }
}

async function buildMeatFood(meta: WikiMeatFoodMeta,foodType : string): Promise<MeatFood>{
    if(usdaRequests === 1000){
            console.log("1000 request from USDA reached, wait for 1 hour")
            await sleep(3600000);
            usdaRequests = 0;
    }
    const record: MeatFood = {
        name: meta.title,
        foodType,
        wikiUrl: meta.fullurl,
        imageUrl: meta.thumbnailUrl,
        author: "admin",
        createdAt: new Date(),
    }

    try{
        await throttleUsda();
        const results = await searchUsdaByName(meta.title);
        if (results.length === 0) return record;

        usdaRequests++

        await throttleUsda();
        const best = results[0];
        const detail = await getUsdaFoodDetail(best.fdcId);

        usdaRequests++

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

async function saveToMongo(records: MeatFood[]){
 const client = new MongoClient(MONGO_URI);
  await client.connect();
  const db = client.db("myFoodDb");
  const coll = db.collection<MeatFood>("meats");

  const ops = records.map(rec => ({
    updateOne: {
        filter: {name: rec.name},
        update: {$set: rec},
        upsert: true,
    }
  }))

  if(ops.length){
    await coll.bulkWrite(ops);
    console.log(`Saved ${ops.length} foods to MongoDB.`);
  }

  await client.close();
}


export async function meatScraper(){

    const categoryLinks = await getMeatCategoryLinks();
    console.log(`found ${categoryLinks.length} cat links.`)
    if(!categoryLinks.length) return;
    const limit = pLimit(5);
    let allRecords : MeatFood[] = [];

    for (const cat of categoryLinks){
        const itemLinks : {title: string;url: string}[] = await getItemsFromCategoryPage(cat.url);
        console.log(`${cat.title} has ${itemLinks.length} item links.`)

        
        const catTitles = itemLinks.map((item : any) => item.title)
        const catWikiMeta = await getWikiMetadata(catTitles);

        const records = await Promise.all(
            catWikiMeta.map(m => limit(() => buildMeatFood(m,cat.title))).filter(r => r)
        )

        allRecords = [...allRecords,...records];
    }

    console.log("getting foods from wiki..")
    const titles =  await getMeatFoodTitlesFromWikiPageList();

    console.log(`Found ${titles.length} meat food titles.`);
    const wikiMeta = await getWikiMetadata(titles);

    const recordsFromMainPage = await Promise.all(
        wikiMeta.map(m => limit(() => buildMeatFood(m,"meat")))
    )

    allRecords = [...allRecords,...recordsFromMainPage];

    console.log(`Processed ${allRecords.length} food records.`);
    await saveToMongo(allRecords);
}

async function getMeatCategoryLinks(): Promise<{title: string; url: string; foodType: string}[]> {
  const pageUrl = "https://en.wikipedia.org/wiki/List_of_meat_dishes";
  const res = await fetch(pageUrl);
  const html = await res.text();
  const $ = cheerio.load(html);

  $("div.mw-heading").each((i, el) => {
  const h3 = $(el).find("h3").first();
  const text = h3.text().trim();
  console.log(`Header container #${i}: class="${$(el).attr("class")}", text="${text}"`);
});

  const accepted: { [key: string]: string } = {
    "Beef": "red meat",
    "Pork": "red meat",
    "Poultry": "poultry",
    "Fish": "seafood",
    "Goat": "red meat",
    "Lamb and mutton": "red meat",
    // Ensure these keys match exactly what appears on the page
  };

  const results: { title: string; url: string; foodType: string }[] = [];

  for (const key of Object.keys(accepted)) {
    const header = $(`div.mw-heading.mw-heading3`).filter((_, el) => {
     return $(el).find("h3").first().text().trim() === key;
    });
    if (!header.length) {
      console.warn(`Header not found for category key: ${key}`);
      continue;
    }

    let next = header.next();
    while (next.length && next[0] && !/^h[2-4]$/i.test(next[0].tagName)) {
    const hatnote = next.is(".hatnote") ? next : next.find(".hatnote").first();
    const link = hatnote.find("a[href*='/wiki/List_of_']").first();
    if (link.length) {
        const href = link.attr("href");
        if (href) {
        results.push({
            title: key,
            url: `https://en.wikipedia.org${href}`,
            foodType : accepted[key]!,
        });
        break;
        }
    }
    next = next.next();
    }
    }
    return results;
}

async function getItemsFromCategoryPage(categoryUrl: string) : Promise<{title: string,url: string}[]>{
    const res = await fetch(categoryUrl);
    const html = await res.text();
    const $ = cheerio.load(html);
    const items : {title: string, url: string}[] = []

    $("ul li a[href^='/wiki/']").each((_,el) => {
        const href = $(el).attr("href");
        const title = $(el).attr("title");

        if(href && title && !title.includes(":") && title.length < 50 &&
      /^[A-Z]/.test(title) && !title.includes("[") &&
      !title.includes("Wikipedia") && href.startsWith("/wiki/")){
            items.push({
                title,
                url : `https://en.wikipedia.org${href}`
            });
        }
    })

    const unique = new Map<string, {title:string;url:string}>();
    for(const item of items){
        if(!unique.has(item.title)){
            unique.set(item.title,item);
        }
    }

    return Array.from(unique.values());

    // return Array.from(new Set(items.map((i) => JSON.stringify(i)))).map(string => JSON.parse(string) as {title: string;url: string});
}

// main().catch((err) => {
//     console.error("Error",err);
//     process.exit(1);
// })





