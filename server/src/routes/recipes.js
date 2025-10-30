import express from "express";
const router = express.Router();
import Recipe from "../models/Recipe.js";
import { authenticate,authorizeRoles } from "../middleware/auth.js";

router.post("/",authenticate,authorizeRoles("admin"), async (req,res) => {
    const {name,diet,instructions,ingredients,author,url,imageUrl,cookTime} = req.body;
    const type = "recipe"
    try {
        const newRecipe = new Recipe({type,name,instructions,ingredients,author,url,imageUrl,diet,cookTime});
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
        res.status(500).json({message: "Error fetching recipes from database."})
    }
});

router.delete("/:id",authenticate,authorizeRoles("admin"), async (req,res) => {
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

router.put("/:id",authenticate,authorizeRoles("admin"),async (req,res) => {
    const {id} = req.params;
    const {name,diet,instructions,ingredients,author,url,imageUrl,cookTime} = req.body;
    try{
        const recipeToUpdate = await Recipe.findByIdAndUpdate(
            id,
            {name,diet,instructions,ingredients,author,url,imageUrl,cookTime},
            {new: true,runValidators:true}
        );

        if(!recipeToUpdate){
            return res.status(404).json({ message: "Recipe not found in db" });
        }
        res.status(200).json(recipeToUpdate);
    } catch (err) {
        res.status(500).json({message: "Failed to update recipe",err})
    }
})

export default router;