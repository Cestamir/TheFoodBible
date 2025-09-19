
import express from "express";
const router = express.Router();
import Recipe from "../models/Recipe.js";

router.post("/", async (req,res) => {
    const {title,instructions,ingredients,author} = req.body;

    try {
        const newRecipe = new Recipe({title,instructions,ingredients,author});
        await newRecipe.save();
        res.status(201).json(newRecipe)
    } catch (err) {
        res.status(500).json({message: "Error ocurred while creating new recipe",error: err})
    }
});

router.get("/", async (req,res) => {
    try{
        const recipes = await Recipe.find();
        res.status(200).json(recipes)
    } catch (err) {
        res.status(500).json({message: "Error fetching recipes"})
    }
});

export default router;