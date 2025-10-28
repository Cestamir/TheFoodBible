import {MongoClient} from "mongodb"
import dotenv from "dotenv"
import pLimit from "p-limit"

export const foodCategories = {
  fish: {
    url: "https://en.wikipedia.org/wiki/List_of_fish",
    items: [
      "shrimp", "eel", "salmon", "tuna", "trout",
      "cod", "herring", "sardine", "anchovy", "mackerel",
      "halibut", "bass", "crab", "lobster", "oyster",
      "clams", "squid"
    ]
  },
  meat: {
    url: "https://en.wikipedia.org/wiki/List_of_meats",
    items: [
      "beef", "pork", "chicken", "lamb", "turkey",
      "duck", "goose", "rabbit", "venison", "bison",
      "veal", "ham", "bacon", "sausage", "mutton",
      "pheasant", "quail"
    ]
  },
  dairy: {
    url: "https://en.wikipedia.org/wiki/List_of_dairy_products",
    items: [
      "milk", "cheese", "butter", "yogurt", "cream",
      "ice cream", "cottage cheese", "ghee", "kefir", "sour cream",
      "mozzarella", "cheddar", "parmesan", "brie", "ricotta",
      "feta", "goat cheese"
    ]
  },
  egg: {
    url: "https://en.wikipedia.org/wiki/List_of_eggs",
    items: [
      "brown egg", "white egg", "duck egg", "quail egg", "goose egg",
      "fertilized egg", "cooked egg", "poached egg", "scrambled egg", "omelette",
      "boiled egg", "soft-boiled egg", "hard-boiled egg", "pickled egg", "eggnog",
      "century egg", "salted egg"
    ]
  },
  drink: {
    url: "https://en.wikipedia.org/wiki/List_of_drinks",
    items: [
      "water", "juice", "wine", "beer", "coffee",
      "tea", "soda", "milkshake", "smoothie", "cocktail",
      "whiskey", "vodka", "rum", "gin", "lemonade",
      "kombucha", "hot chocolate"
    ]
  },
  snacks: {
    url: "https://en.wikipedia.org/wiki/List_of_snack_foods",
    items: [
      "chips", "candy", "ice cream", "popcorn", "pretzels",
      "nuts", "chocolate", "cookies", "cake", "donuts",
      "brownies", "granola bars", "trail mix", "fruit snacks", "pudding",
      "marshmallows", "gummies"
    ]
  }
};

dotenv.config();

// basic settings
const MONGO_URI = process.env.MONGO_URI!;
const WIKI_API = "https://en.wikipedia.org/w/api.php";
const USDA_SEARCH = "https://api.nal.usda.gov/fdc/v1/foods/search";
const USDA_DETAIL = (fdcId: number) => `https://api.nal.usda.gov/fdc/v1/food/${fdcId}`
const USDA_API_KEY = process.env.USDA_API_KEY!;

type WikiMeta = {
    title: string;
    fullurl: string;
    thumbnailUrl? : string | undefined;
}

type foodItem = {
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

type WikiFoodItem = {
  title: string;
  foodType: string;
  wikiUrl: string;
};

function getFoodItemsFromCategories(): WikiFoodItem[] {
  const results: WikiFoodItem[] = [];

  for (const [foodType, { url, items }] of Object.entries(foodCategories)) {
    for (const title of items) {
      results.push({
        title,
        foodType,
        wikiUrl: url,
      });
    }
  }

  return results;
}


async function getWikiMetadata(titles: string[]): Promise<WikiMeta[]>{
    const chunks = Array.from({length: Math.ceil(titles.length/ 40)}, (_,i) => titles.slice(i * 40,i * 40 + 40));

    const results : WikiMeta[] = [];

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

async function buildFood(meta: WikiMeta,foodType: string): Promise<foodItem>{
    const record: foodItem = {
        name: meta.title,
        foodType: foodType,
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

async function saveToMongo(records: foodItem[]){
 const client = new MongoClient(MONGO_URI);
  await client.connect();
  const db = client.db("myFoodDb");
  const coll = db.collection<foodItem>("foods");

  const ops = records.map(rec => ({
    updateOne: {
        filter: {name: rec.name},
        update: {$set: rec},
        upsert: true,
    }
  }))

  if(ops.length){
    await coll.bulkWrite(ops);
    console.log(`Saved ${ops.length} items to MongoDB.`);
  }

  await client.close();
}


async function main() {
  console.log("Getting items from categories...");

  const items = getFoodItemsFromCategories();

  console.log(`Found ${items.length} items.`);

  const limit = pLimit(5);

  const records = await Promise.all(
    items.map(item =>
      limit(() =>
        buildFood(
          {
            title: item.title,
            fullurl: item.wikiUrl,
            thumbnailUrl: undefined, 
          },
          item.foodType
        )
      )
    )
  );

  console.log(`Processed ${records.length} records.`);
  await saveToMongo(records);
}
main().catch((err) => {
    console.error("Error",err);
    process.exit(1);
})