import * as cheerio from "cheerio";
import {MongoClient} from "mongodb"
import dotenv from "dotenv"

dotenv.config();

const MONGO_URI = process.env.MONGO_URI!;
const client = new MongoClient(MONGO_URI);

const delay = (ms: number) => new Promise((res) => setTimeout(res,ms));

const TEST_URL = "https://www.bbcgoodfood.com/recipes/meat-potato-pie"
const MAIN_URL = "https://www.bbcgoodfood.com/recipes/collection/vegetarian-recipes"

async function fetchHtml(url : string) : Promise<string>{
    const res = await fetch(url);
    if (!res.ok) throw new Error(`failed to fetch ${url}`)
    return await res.text();
}

// get safely the author if it exists otherwise admin
function getAuthor(data: any) :string {
    if(!data.author) return "admin";
    if(typeof data.author === "string") return data.author;
    if(typeof data.author === "object" && data.author.name) return data.author.name;
    return "admin";
}


async function getRecipesFromPage(url: string){
    const html = await fetchHtml(url);
    const $ = cheerio.load(html);

    const jsonLdRaw = $('script[type="application/ld+json"]').first().html();
    if(!jsonLdRaw) throw new Error("JSON-LD not found on the page")

    const jsonLd = JSON.parse(jsonLdRaw);

    //  find recipe type on JSON-LD data
    const recipeData = Array.isArray(jsonLd) ? jsonLd.find((item) => item["@type"] === "Recipe") : jsonLd["@type"] === "Recipe" ? jsonLd : null;


    // see why there is diffrent data
    if (!recipeData) {
        console.warn("⚠️ No recipe data found for URL:", url);
        console.log("Raw JSON-LD:\n",jsonLdRaw)
        return null;
    }

    // constructing of the recipe
    const title : string = recipeData.name || "Untitiled"
    const ingredients : string[] = recipeData.recipeIngredient || [];

    let instructions: string;

    // joining the data from instructions to string
    if(Array.isArray(recipeData.recipeInstructions)){
        instructions = recipeData.recipeInstructions.map((step: any) => (typeof step === 'string' ? step : step.text)).join("\n")
    } else if(typeof recipeData.recipeInstructions === "string"){
        instructions = recipeData.recipeInstructions
    } else {
        instructions = "No instructions provided."
    }

    const author = getAuthor(recipeData);

    return {
        title,
        ingredients,
        instructions,
        author,
        createdAt: new Date()
    }
}

async function runScraper(){
    try{
        await client.connect();
        const db = client.db("test");
        const collection = db.collection("recipes")
        const html = await fetchHtml(MAIN_URL)
        const $ = cheerio.load(html)

        // const recipe = await getRecipesFromPage(TEST_URL)


        // selecting the data from the page bbcfoods
        const links = $(".card__content > a").map((_, el) => {
            const $el = $(el);
            return {
            title: $el.find("h2").text().trim(),
            href: $el.attr("href"),
            };
  }).get().filter((item) => item.href && item.href.startsWith("https://www.bbcgoodfood.com/recipes/"))

//   show of the links gathered
        console.log(links.map((link) => link.href))

        // looping over the links and adding item to db
        for(let i = 0;i < Math.min(20,links.length);i++){
            const {title,href} = links[i];
            const FULL_URL = href.startsWith("https://www.bbcgoodfood.com/recipes/") ? href : `https://www.bbcgoodfood.com${href}`

            const rec = await getRecipesFromPage(FULL_URL);

            if(!rec){
                console.log(`Skipping, no recipe data for ${title}`)
                continue;
            }

            const exists = await collection.findOne({title})
            if(exists){
                console.log("Skipping duplicate item in the database of recipes")
                continue;
            }
            // insertion and delay for safety reasons
            console.log(`${rec.title}`)
            await collection.insertOne(rec)
            await delay(1500);
        }
        console.log("success!")
    } catch (err) {
        console.log("Error",err)
    } finally {
        await client.close()
    }
}


runScraper();