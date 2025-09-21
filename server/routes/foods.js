import express from "express";
const router = express.Router();
import Food from "../models/Food.js";

router.post("/", async (req,res) => {
    const {title,foodType,author} = req.body;

    try {
        const newFood = new Food({title,foodType,author});
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
        res.status(500).json({message: "Error fetching available food"})
    }
});

export default router;