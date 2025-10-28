import {MongoClient} from "mongodb"
import dotenv from "dotenv"
import pLimit from "p-limit"
import path from "path";
import { fileURLToPath } from "url";
// env setup

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../server/.env") });

const uri = process.env.MONGO_URI!;
const DB_NAME = "myFoodDb";
const COLLECTION_NAME = "recipes";

const keywords = [
  "chicken",
  "beef",
  "pork",
  "egg",
  "rice",
  "potato",
  "apple",
  "salad",
  "milk",
  "salmon",
  "cheese",
  "pasta",
  "tomato",
  "bread",
  "bell pepper",
  "shrimp",
  "carrot",
  "banana",
  "almond",
  "steak",
  "pear",
  "peanut",
  "lamb",
  "mutton",
  "duck",
  "tuna",
  "crab",
  "wine",
  "vodka"
];

interface MealDBRecipe {
  strMeal: string;
  strInstructions: string;
  strMealThumb: string;
  strSource?: string;
  [key: string]: any;
}

interface Recipe {
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
}

// async function fetchRecipes(keyword: string): Promise<MealDBRecipe[]> {
//   const res = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${keyword}`);
//   const data = await res.json();
//   return data.meals || [];
// }

// function mapToRecipe(meal: MealDBRecipe): Recipe {
//   const ingredients: string[] = [];

//   for (let i = 1; i <= 20; i++) {
//     const name = meal[`strIngredient${i}`];
//     if (name && name.trim() !== "") ingredients.push(name.trim());
//   }

//   return {
//     type: "recipe",
//     diet: ["all food"],
//     name: meal.strMeal,
//     instructions: meal.strInstructions || "",
//     ingredients,
//     url: meal.strSource || `https://www.themealdb.com/meal/${meal.idMeal}`,
//     imageUrl: meal.strMealThumb || "",
//     cookTime: "30 minutes",
//     author: "admin",
//     createdAt: new Date()
//   };
// }

// async function main() {
//   const client = new MongoClient(uri);
//   await client.connect();
//   const db = client.db(DB_NAME);
//   const collection = db.collection<Recipe>(COLLECTION_NAME);

//   const allRecipes: Recipe[] = [];

//   for (const keyword of keywords) {
//     console.log(`🔍 Fetching recipes for "${keyword}"...`);
//     try {
//       const meals = await fetchRecipes(keyword);
//       const recipes = meals.map(mapToRecipe);
//       allRecipes.push(...recipes);
//     } catch (err) {
//       console.error(`Error fetching "${keyword}":`, err);
//     }
//   }

//   // Deduplicate by name
//   const uniqueRecipes = Array.from(new Map(allRecipes.map(r => [r.name.toLowerCase(), r])).values());

//   console.log(`🧹 ${uniqueRecipes.length} unique recipes ready to insert`);

//   if (uniqueRecipes.length > 0) {
//     // await collection.insertMany(uniqueRecipes);
//     console.log(`✅ Inserted ${uniqueRecipes.length} recipes into MongoDB`);
//   }

//   await client.close();
//   console.log("🎉 Done!");
// }

// main().catch(console.error);


async function fetchRecipes(keyword: string): Promise<MealDBRecipe[]> {
  const res = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(keyword)}`);
  if (!res.ok) throw new Error(`Failed to fetch for keyword: ${keyword}`);
  const data = await res.json();
  return data.meals || [];
}

function mapToRecipe(meal: MealDBRecipe): Recipe {
  const ingredients: string[] = [];
  for (let i = 1; i <= 20; i++) {
    const ing = meal[`strIngredient${i}`];
    if (ing && ing.trim()) ingredients.push(ing.trim());
  }

  return {
    type: "recipe",
    diet: ["all food"],
    name: meal.strMeal,
    instructions: meal.strInstructions || "",
    ingredients,
    url: meal.strSource || `https://www.themealdb.com/meal/${meal.idMeal}`,
    imageUrl: meal.strMealThumb || "",
    cookTime: "30 minutes",
    author: "admin",
    createdAt: new Date(),
  };
}

export async function runAllRecipeScraper() {
  console.log("🔍 Fetching all recipes from TheMealDB...");
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(DB_NAME);
  const collection = db.collection<Recipe>(COLLECTION_NAME);

  const alphabet = "abcdefghijklmnopqrstuvwxyz".split("");
  const limit = pLimit(5);
  const allRecipes: Recipe[] = [];

  await Promise.all(
    alphabet.map(letter =>
      limit(async () => {
        const meals = await fetchRecipes(letter);
        allRecipes.push(...meals.map(mapToRecipe));
        console.log(`✅ ${meals.length} recipes from letter "${letter}"`);
      })
    )
  );

  // Deduplicate
  const normalize = (name: string) =>
    name.trim().toLowerCase().replace(/\s+/g, " ");

  const uniqueRecipes = Array.from(
    new Map(allRecipes.map(r => [normalize(r.name), r])).values()
  );

  console.log(`🧹 ${uniqueRecipes.length} unique recipes ready to save`);

  if (uniqueRecipes.length > 0) {
    await collection.bulkWrite(
      uniqueRecipes.map(recipe => ({
        updateOne: {
          filter: { name: recipe.name },
          update: { $set: recipe },
          upsert: true,
        },
      }))
    );
    console.log(`✅ Saved ${uniqueRecipes.length} recipes to MongoDB`);
  }

  await client.close();
  console.log("🎉 Done!");
}

// main().catch(err => {
//   console.error("❌ Error:", err);
//   process.exit(1);
// });