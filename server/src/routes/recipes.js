
import express from "express";
const router = express.Router();
import Recipe from "../models/Recipe.js";

router.post("/", async (req,res) => {
    const {title,instructions,ingredients,author,url,image,cookTime} = req.body;
    const type = "recipe"
    try {
        const newRecipe = new Recipe({type,title,instructions,ingredients,author,url,image,cookTime});
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

// delete route for recipe 

router.delete("/:id", async (req,res) => {
    const {id} = req.params; 
    try{
        const recipeToDelete = await Recipe.findById(id);
        if (!recipeToDelete){
            return res.status(404).json({message: "Recipe not found"})
        }
        const deletedRecipe = await Recipe.deleteOne({_id: recipeToDelete._id})
        res.status(200).json({message: "Deleted recipe successfully",deletedRecipe})
    } catch (err) {
        res.status(500).json({message: "Failed to delete recipe",err})
    }

})

// edit route for recipe

router.put("/:id",async (req,res) => {
    const {id} = req.params;
    const {title,instructions,ingredients,author,cookTime,url,image} = req.body;
    try{
        const recipeToUpdate = await Recipe.findById(id);
        recipeToUpdate.title = title;
        recipeToUpdate.instructions = instructions;
        recipeToUpdate.ingredients = ingredients;
        recipeToUpdate.author = author;
        recipeToUpdate.url = url;
        recipeToUpdate.cookTime = cookTime;
        recipeToUpdate.image = image;
        await recipeToUpdate.save();
        res.status(200).json(recipeToUpdate);
    } catch (err) {
        res.status(500).json({message: "Failed to update recipe",err})
    }
})

export default router;