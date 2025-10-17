import express from "express";
const router = express.Router();
import Food from "../models/Food.js";
import { authenticate,authorizeRoles } from "../middleware/auth.js";

router.post("/",authenticate,authorizeRoles("admin"), async (req,res) => {
    const {title,foodType,author,url} = req.body;
    const type = "food";
    try {
        const newFood = new Food({type,title,foodType,author,url});
        await newFood.save();
        res.status(201).json(newFood)
    } catch (err) {
        res.status(500).json({message: "Error ocurred while creating new food",error: err})
    }
});

router.get("/", async (req,res) => {
    try{
        const foods = await Food.find();
        res.status(200).json(foods)
    } catch (err) {
        res.status(500).json({message: "Error fetching food from database.",error: err})
    }
});

// added route protection

router.delete("/:id",authenticate,authorizeRoles("admin"), async (req,res) => {
    const {id} = req.params; 
    try{
        const foodToDelete = await Food.findById(id);
        if (!foodToDelete){
            return res.status(404).json({message: "Food not found"})
        }
        const deletedFood = await Food.deleteOne({_id: foodToDelete._id})
        res.status(200).json({message: "Deleted food successfully",deletedFood})
    } catch (err) {
        res.status(500).json({message: "Failed to delete food",err})
    }

})

router.put("/:id",authenticate,authorizeRoles("admin"),async (req,res) => {
    const {id} = req.params;
    const {title,foodType,author,url} = req.body;
    try{
        const foodToUpdate = await Food.findById(id);
        foodToUpdate.title = title;
        foodToUpdate.foodType = foodType;
        foodToUpdate.author = author;
        foodToUpdate.url = url;
        await foodToUpdate.save();
        res.status(200).json(foodToUpdate);
    } catch (err) {
        res.status(500).json({message: "Failed to update food",err})
    }
})

export default router;