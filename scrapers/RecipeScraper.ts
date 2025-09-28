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

    // see why there is different data
    if (!recipeData) {
        console.warn("⚠️ No recipe data found for URL:", url);
        console.log("Raw JSON-LD:\n",jsonLdRaw)
        return null;
    }

    // find cooktime and image on JSON-LD data

    const image : string = recipeData.image ? Array.isArray(recipeData.image) ? recipeData.image[0] : recipeData.image : "";
    const cookTime : string = recipeData.cookTime || recipeData.totalTime || "";


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
        cookTime,
        url,
        image,
        author,
        createdAt: new Date()
    }
}

async function runScraper(){
    try{
        await client.connect();
        const db = client.db("test");
        const collection = db.collection("recipes")


        const maxPages = 3;

        // count of sucessfull items saved
        let countOfItems : number = 0;

        for(let i = 1; i <= maxPages; i++){

            const PAGE_URL = `${MAIN_URL}?page=${i}`
            const html = await fetchHtml(PAGE_URL)
            const $ = cheerio.load(html)
            // const recipe = await getRecipesFromPage(TEST_URL)

            // selecting the data from the page provided page
            const links = $(".card__content > a").map((_, el) => {
            const $el = $(el);
            const title = $el.find("h2").text().trim();
            const href = $el.attr("href")
            return {
                title,
                href: href?.startsWith("http") ? href : `https://www.bbcgoodfood.com${href}`
            };
            }).get().filter((item) => item.href && item.href.startsWith("https://www.bbcgoodfood.com/recipes/"))

            //   show the links gathered from html 
            console.log(links.map((link) => link.href))
            

            // looping over the links and adding item to db
            for(let {title,href} of links ){
                const FULL_URL = href?.startsWith("https://www.bbcgoodfood.com/recipes/") ? href : `https://www.bbcgoodfood.com${href}`

                const rec = await getRecipesFromPage(FULL_URL);

                if(!rec){
                    console.log(`Skipping, no recipe data for ${title}`)
                    continue;
                }

                const exists = await collection.findOne({url: href})
                if(exists){
                    console.log("Skipping duplicate recipe in the database..",rec.url)
                    continue;
                }

                rec.url = href;

                // insertion and delay for safety reasons
                console.log(`${rec.title}`)
                await collection.insertOne(rec)
                countOfItems += 1;
                await delay(1000);
            }


        }
        console.log(`succesfully scraped ${countOfItems} recipes. ✅`)
        countOfItems = 0;
    } catch (err) {
        console.log("Error",err)
    } finally {
        
        await client.close()

    }
}


runScraper();