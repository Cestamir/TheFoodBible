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

async function buildMeatFood(meta: WikiMeatFoodMeta,foodType : string): Promise<MeatFood>{
    const record: MeatFood = {
        name: meta.title,
        foodType,
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

async function saveToMongo(records: MeatFood[]){
 const client = new MongoClient(MONGO_URI);
  await client.connect();
  const db = client.db("myFoodDb");
  const coll = db.collection<MeatFood>("foods");

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


async function main(){

    const categoryLinks = await getMeatCategoryLinks();
    console.log(`found ${categoryLinks.length} cat links.`)
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

main().catch((err) => {
    console.error("Error",err);
    process.exit(1);
})




async function getMeatCategoryLinks(): Promise<{title: string;url: string;foodType: string}[]>{
    const pageUrl = "https://en.wikipedia.org/wiki/List_of_meat_dishes";
    const res = await fetch(pageUrl);
    const html = await res.text();
    const $ = cheerio.load(html);

    const accepted: { [key: string]: string } = {
    "Beef": "red meat",
    "Pork": "red meat",
    "Poultry": "poultry",
    "Fish": "seafood",
    "Goat": "red meat",
    "Lamb and mutton": "red meat",
    //  mappings for food types
  };

    const results : {title: string;url: string;foodType: string}[] =[];
    let inSection = false;

    Object.keys(accepted).forEach(key => {
        
        const header = $(`span.mw-headline:contains("${key}")`).closest("h2, h3");
        if (header.length) {
        const foodType = accepted[key];

        let next = header.next();
        
        while (next.length && next[0] && !/h2|h3/.test(next[0].name || "")) {
            const link = next.find(`a[href*="List_of_${key.toLowerCase().replace(/ & /g, "_and_")}_dishes"]`).first();
            if (link.length) {
            const href = link.attr("href");
            if (href) {
                results.push({
                title: key,
                url: `https://en.wikipedia.org${href}`,
                foodType: accepted[key]!,
                });
            }
            break;
            }
            next = next.next();
        }
        }
    });

    // $("h2,h3").each((_,el) => {
    //     const text = $(el).text().replace("[edit]","").trim();
    //     if(/Meat dishes/i.test(text)){
    //         inSection = true;
    //         return;
    //     }
    //     if(inSection && /^See also$/i.test(text)){
    //         inSection = false;
    //         return;
    //     }

    //     if(inSection && accepted[text]){
    //         let next = $(el).next();
    //         while(next.length && next[0]?.name != "h2"){
    //             const link = next.find("a[href^='/wiki/List_of_']").first();
    //             if(link.length){
    //                 const href = link.attr("href");
    //                 if (href) {
    //                     results.push({
    //                         title: text,
    //                         url: `https://en.wikipedia.org${href}`,
    //                         foodType: accepted[text],
    //                     })
    //                     break;
    //                 }
    //             }
    //             next = next.next();
    //         }
    //     }
    // })
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

        if(href && title && !title.includes(":") && href.startsWith("/wiki/")){
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
