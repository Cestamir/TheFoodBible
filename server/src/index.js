// imports + basic setup
import dotenv from "dotenv"
// crucial part for .env
dotenv.config({path: '../.env'})

// debug tools for .env

// import { fileURLToPath } from 'url';
// import { dirname, join } from 'path';
// import { existsSync, readFileSync } from 'fs';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// console.log('📂 Current file:', __filename);
// console.log('📂 Current directory:', __dirname);
// console.log('📂 Process CWD (where you ran npm):', process.cwd());

import cors from "cors"
import mongoose from "mongoose"
import express from "express"
const app = express();

const PORT = process.env.PORT || 5050;
const MONGO_URI = process.env.MONGO_URI;

app.use(cors());
app.use(express.json());

// test

console.log('All env vars:', process.env.JWT_SECRET);

// mongodb setup

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// routes + route imports
import foodRoutes from "./routes/foods.js"
import recipeRoutes from "./routes/recipes.js"
import authRoutes from "./routes/auth.js"
app.use("/api/recipes",recipeRoutes);
app.use("/api/foods",foodRoutes);
app.use("/api/auth",authRoutes);

// testing the database

// try{
// const recipe = await Recipe.create({
//     title: "Roasted potatoes",
//     instructions: " 1 step: Rinse potatoes, 2 step: Boil water to 100 degres, 3 step: insert potatoes, add 1 teaspoon of oil and cook for 5 minutes, 4 step: pour the water away and serve the potatoes",
//     ingredients: ["salt","potatoes","oil"],
//     author: "admin",
// })

// const newData = await Recipe.findById("68ceb4ab283683a12c6bb0d7").exec()
// console.log(newData)

// const food = await Food.create({
//     title: "tomato",
//     foodType: "vegetable",
//     author: "admin"
// })

// const dbStatus = await Recipe.deleteMany({title: "Roasted potatoes"})
// console.log(dbStatus)

// } catch (err){
//     console.log(err)
// }



// node server 1 tres
app.get("/api/test", (req,res) => {
    res.send({message: "Node server is running.."})
});

app.get("/", (req,res) => {
    res.send("Server is running !");
})

app.listen(PORT, () => {
    console.log(`server is listening on http://localhost:${PORT}`)
});