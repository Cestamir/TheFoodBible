import { MongoClient } from "mongodb";
import * as cheerio from "cheerio";
import pLimit from "p-limit";
import dotenv from "dotenv";
dotenv.config();
import puppeteer from "puppeteer";

const MONGO_URI = process.env.MONGO_URI!;
const limit = pLimit(5);

// just some base ingredients
const BASE_INGREDIENTS = [
  "beef", "pork", "chicken", "egg", "rice",
  "potato", "apple", "salad", "milk", "salmon",
  "cheese", "pasta", "tomato", "bread", "bell pepper",
  "shrimp", "carrot", "banana", "almond", "steak"
];

type Recipe = {
  type: "recipe";
  diet: string[];
  name: string;
  instructions: string;
  ingredients: string[];
  url: string;
  imageUrl: string;
  cookTime: string;
  author: string;
  createdAt: Date;
};


// 
// async function getAllRecipesByKeyword(keyword: string): Promise<string[]> {
//   const url = `https://www.allrecipes.com/search/results/?search=${encodeURIComponent(keyword)}`;
//   const res = await fetch(url, {
//     headers: { "User-Agent": "Mozilla/5.0 (compatible; recipe-bot/1.0)" },
//   });

//   if (!res.ok) {
//     console.warn(`❌ Failed to fetch search for ${keyword}: ${res.statusText}`);
//     return [];
//   }

//   const html = await res.text();
//   const $ = cheerio.load(html);
//   const links: string[] = [];

//   $("a.card__titleLink").each((_, el) => {
//     const href = $(el).attr("href");
//     if (href && href.includes("/recipe/")) {
//       links.push(href.split("?")[0]!); // clean tracking params
//     }
//   });

//   console.log(`Found ${links.length} for ${keyword}`);
//   return links.slice(0, 10); // limit per keyword to avoid duplicates
// }

// async function scrapeRecipe(url: string) {
//   const res = await fetch(url, {
//     headers: { "User-Agent": "Mozilla/5.0 (compatible; recipe-bot/1.0)" },
//   });
//   const html = await res.text();
//   const $ = cheerio.load(html);

//   const jsonLd = $("script[type='application/ld+json']").first().text();
//   if (!jsonLd) return null;

//   const data = JSON.parse(jsonLd);
//   const recipe = Array.isArray(data) ? data.find(d => d["@type"] === "Recipe") : data;

//   if (!recipe) return null;

//   return {
//     type: "recipe",
//     diet: [],
//     name: recipe.name || "",
//     instructions: Array.isArray(recipe.recipeInstructions)
//       ? recipe.recipeInstructions.map((i: any) => i.text || i).join(" ")
//       : recipe.recipeInstructions || "",
//     ingredients: recipe.recipeIngredient || [],
//     url,
//     imageUrl: recipe.image?.[0] || recipe.image || "",
//     cookTime: recipe.totalTime || "",
//     author: recipe.author?.name || "unknown",
//     createdAt: new Date(),
//   };
// }

// 


// async function fetchHTML(url: string): Promise<string> {
//   const res = await fetch(url, {
//     headers: {
//       "User-Agent":
//         "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
//       "Accept-Language": "en-US,en;q=0.9",
//       "Accept":
//         "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
//       "Referer": "https://www.google.com/",
//       "Connection": "keep-alive",
//     },
//   });
//   if (!res.ok) throw new Error(`Failed fetching ${url}: ${res.statusText}`);
//   return await res.text();
// }


// async function scrapeRecipeLinks(keyword: string): Promise<string[]> {
//   const allrecipesUrl = `https://www.allrecipes.com/search?q=${encodeURIComponent(keyword)}`;
//   const duckduckUrl = `https://duckduckgo.com/html/?q=site:allrecipes.com+${encodeURIComponent(keyword)}+recipe`;

//   // Try AllRecipes first
//   let html = await fetchHTML(allrecipesUrl);
//   let $ = cheerio.load(html);
//   let links: string[] = [];

//   $("a.comp.card__titleLink, a.card__title, a.card__titleLink").each((_, el) => {
//     const href = $(el).attr("href");
//     if (href?.includes("/recipe/")) links.push(href.split("?")[0]!);
//   });

//   // fallback if 0 results
//   if (links.length === 0) {
//     html = await fetchHTML(duckduckUrl);
//     $ = cheerio.load(html);
//     $("a.result__a").each((_, el) => {
//       const href = $(el).attr("href");
//       if (href?.includes("allrecipes.com/recipe/")) links.push(href.split("?")[0]!);
//     });
//   }

//   console.log(`Found ${links.length} links for keyword "${keyword}"`);
//   return Array.from(new Set(links)).slice(0, 10);
// }

// // Step 2: scrape one recipe page
// async function scrapeRecipe(url: string): Promise<Recipe | null> {
//   try {
//     const html = await fetchHTML(url);
//     const $ = cheerio.load(html);

//     // Get JSON-LD script
//     const script = $("script[type='application/ld+json']").first().html();
//     if (!script) {
//       console.warn("No JSON-LD found for", url);
//       return null;
//     }

//     const data = JSON.parse(script);
//     const recipe = Array.isArray(data)
//       ? data.find((d: any) => d["@type"] === "Recipe")
//       : data["@type"] === "Recipe" ? data : null;

//     if (!recipe) {
//       console.warn("No recipe object in JSON-LD for", url);
//       return null;
//     }

//     // Build object
//     const obj: Recipe = {
//       type: "recipe",
//       diet: ["all food"],  // simple generic diet tag
//       name: recipe.name || "",
//       instructions: Array.isArray(recipe.recipeInstructions)
//         ? recipe.recipeInstructions.map((step: any) => typeof step === "string" ? step : step.text).join("\n")
//         : typeof recipe.recipeInstructions === "string"
//           ? recipe.recipeInstructions
//           : "",
//       ingredients: recipe.recipeIngredient || [],
//       url,
//       imageUrl: Array.isArray(recipe.image) ? recipe.image[0] : recipe.image || "",
//       cookTime: recipe.totalTime || "",
//       author: recipe.author?.name || "AllRecipes",
//       createdAt: new Date(),
//     };

//     return obj;
//   } catch(err) {
//     console.warn("Error scraping recipe", url, err);
//     return null;
//   }
// }

// // Step 3: Save to MongoDB
// async function saveRecipes(recipes: Recipe[]) {
//   const client = new MongoClient(MONGO_URI);
//   await client.connect();
//   const db = client.db("myFoodDb");
//   const coll = db.collection<Recipe>("recipes");

//   const ops = recipes.map(r => ({
//     updateOne: {
//       filter: { name: r.name },
//       update: { $set: r },
//       upsert: true
//     }
//   }));

//   if (ops.length) {
//     await coll.bulkWrite(ops);
//     console.log(`Saved/updated ${ops.length} recipes to MongoDB.`);
//   }

//   await client.close();
// }

// // Main runner
// async function main() {
//   console.log("🔍 Starting recipe scraping...");
//   const allLinks = new Set<string>();

//   for (const kw of BASE_INGREDIENTS) {
//     const links = await scrapeRecipeLinks(kw);
//     links.forEach(l => allLinks.add(l));
//     if (allLinks.size >= 300) break;
//   }

//   console.log(`Total unique recipe links collected: ${allLinks.size}`);
//   const linksArray = Array.from(allLinks);

//   const scraped: (Recipe | null)[] = await Promise.all(
//     linksArray.map(url => limit(() => scrapeRecipe(url)))
//   );

//   const valid = scraped.filter(r => r !== null) as Recipe[];
//   console.log(`✅ Scraped ${valid.length} valid recipes before dedupe`);

//   // Deduplicate by name
//   const uniqueRecipes = Array.from(
//     new Map(valid.map(r => [r.name.toLowerCase(), r])).values()
//   );
//   console.log(`🧹 ${uniqueRecipes.length} unique recipes after dedupe`);

//   // Limit to 300
//   const toSave = uniqueRecipes.slice(0, 300);

// //   await saveRecipes(toSave);
//   console.log("🎉 Done.");
// }

// main().catch(err => {
//   console.error("Fatal error:", err);
//   process.exit(1);
// });







// VERSION 2/////////////////////////////
// 
// 
// 
// 
// 
// //////////////////////////////////////

async function fetchHTML(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
    },
  });
  if (!res.ok) throw new Error(`Failed fetching ${url}: ${res.statusText}`);
  return await res.text();
}


async function scrapeRecipeLinks(keyword: string) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(`https://www.allrecipes.com/search?q=${keyword}`, { waitUntil: "networkidle2" });

  const links = await page.$$eval("a.comp.card--recipe", els =>
    els.map(el => el.getAttribute("href")).filter(Boolean)
  );

  await browser.close();
  console.log(`${keyword}: found ${links.length} links`);
  return links;
}

// async function scrapeRecipeLinks(keyword: string): Promise<string[]> {
//   const url = `https://www.allrecipes.com/search?q=${encodeURIComponent(keyword)}`;
//   try {
//     const html = await fetchHTML(url);
//     const $ = cheerio.load(html);
//     const links = new Set<string>();

//     $("a.comp.card--recipe").each((_, el) => {
//       const href = $(el).attr("href");
//       if (href && href.includes("/recipe/")) {
//         links.add(href.split("?")[0]!);
//       }
//     });

//     console.log(`Found ${links.size} links for keyword "${keyword}"`);
//     return Array.from(links);
//   } catch (err) {
//     console.error(`Error getting links for "${keyword}":`, err);
//     return [];
//   }
// }

async function scrapeRecipe(url: string): Promise<Recipe | null> {
  try {
    const html = await fetchHTML(url);
    const $ = cheerio.load(html);

    const name = $("h1").first().text().trim();
    if (!name) return null;

    const ingredients: string[] = [];
    $("span.ingredients-item-name").each((_, el) => {
      const text = $(el).text().trim();
      if (text) ingredients.push(text);
    });

    const instructions = $("ul.instructions-section li p")
      .map((_, el) => $(el).text().trim())
      .get()
      .join(" ");

    const imageUrl = $("div.image-container img").attr("src") || "";
    const cookTime = $("div.recipe-meta-item:contains('total:') span").text().trim() || "";
    const author = $("a.author-name, span.author-name").text().trim() || "Unknown";

    return {
      type: "recipe",
      diet: ["all food"],
      name,
      instructions,
      ingredients,
      url,
      imageUrl,
      cookTime,
      author,
      createdAt: new Date(),
    };
  } catch (err) {
    console.warn(`Failed scraping ${url}: ${(err as Error).message}`);
    return null;
  }
}

async function main() {
  console.log("🔍 Starting recipe scraping...");
  const allLinks = new Set<string>();

  for (const keyword of BASE_INGREDIENTS) {
    const links = await scrapeRecipeLinks(keyword);
    links.forEach((l) => allLinks.add(l!));
  }

  console.log(`Total unique recipe links collected: ${allLinks.size}`);

  const limit = pLimit(5);
  const recipes = (
    await Promise.all(
      Array.from(allLinks).slice(0, 300).map((url) => limit(() => scrapeRecipe(url)))
    )
  ).filter((r): r is Recipe => r !== null);

  // ✅ Deduplicate by name
  const uniqueRecipes = Array.from(
    new Map(recipes.map((r) => [r.name.toLowerCase(), r])).values()
  );

  console.log(`✅ Scraped ${recipes.length} valid recipes before dedupe`);
  console.log(`🧹 ${uniqueRecipes.length} unique recipes after dedupe`);

  // Example: print the first 3
  console.log(uniqueRecipes.slice(0, 3));
}

main().catch((err) => {
  console.error("Error in main:", err);
});