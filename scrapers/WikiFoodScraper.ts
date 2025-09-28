import * as cheerio from "cheerio"
import {MongoClient} from "mongodb"
import dotenv from "dotenv"

const foods: {
    title: string;
    foodType: string;
    url: string;
    author: string;
    createdAt: Date;
}[] = [];

dotenv.config();

// basic settings
const MONGO_URI = process.env.MONGO_URI!;
const client = new MongoClient(MONGO_URI);
const BASE_URL = "https://en.wikipedia.org"

const delay = (ms: number) => new Promise((res) => setTimeout(res,ms));

async function fetchHtml(url : string): Promise<string> {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch ${url}`)
    return await res.text();
}

// get food from wiki

async function getFoodTypeFromPage(foodUrl : string): Promise<string>{
    try{
        const html = await fetchHtml(foodUrl);
        const $ = cheerio.load(html);

        let foodType = "";

        $(".infobox tbody tr").each((_,el) => {
            const label = $(el).find("th").text().trim().toLowerCase();
            const value = $(el).find("td").text().trim();

            if(label.includes("course") || label.includes("type") || label.includes("cuisine") ){
                foodType = value;
                return false;
            }
        })
        return foodType || "Unknown"
    } catch (err) {
        console.log(`Error fetching food ${foodUrl}`)
        return "Unknown"
    }
}

async function scrapeFoods(){
    const listUrl = `${BASE_URL}/wiki/List_of_foods`;
    const html = await fetchHtml(listUrl);
    const $ = cheerio.load(html);

    const links = $("#mw-content-text ul > li > a").map((_,el) => ({
        title: $(el).text().trim(),
        href: $(el).attr("href")
    })).get().filter((item) => item.href && item.href.startsWith("/wiki"))

    const db = client.db("test");
    const collection = db.collection("foods")

    console.log(`Scraping ${links.length} foods..`)
    let i = 0;
    for (let {title,href} of links){
        if (i < 100){
        const FULL_URL = `${BASE_URL}${href}`;
        const foodType = await getFoodTypeFromPage(FULL_URL);

        const exists = await collection.findOne({title})
        if(exists){
            console.log(`skipping duplicate value ${title}`)
            continue;
        }
        i += 1;
        let url = href;


        const doc = {
            title,
            foodType,
            url,
            author: "admin",
            createdAt: new Date(),
        }

        console.log(`${title} - ${foodType}`)

        await collection.insertOne(doc);
        await delay(1000)
        } else {
            break;
        }
        
    }

    await client.close();
    console.log("DONE!")
}

scrapeFoods().catch((err) => {console.log(err);client.close()})