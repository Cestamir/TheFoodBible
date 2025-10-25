import express from "express";
const router = express.Router();
import Diet from "../models/Diet.js";
import { authenticate,authorizeRoles } from "../middleware/auth.js";

router.post("/",authenticate,authorizeRoles("admin"), async (req,res) => {
    const {planName,duration,goal} = req.body;
    try {
        const newDiet = new Diet({planName,duration,goal});
        await newDiet.save();
        res.status(201).json(newDiet)
    } catch (err) {
        res.status(500).json({message: "Error ocurred while creating new diet plan.",error: err})
    }
});

router.get("/", async (req,res) => {
    try{
        const diets = await Diet.find();
        res.status(200).json(diets)
    } catch (err) {
        res.status(500).json({message: "Error fetching diet plans from database.",error: err})
    }
});

// added route protection

router.delete("/:id",authenticate,authorizeRoles("admin"), async (req,res) => {
    const {id} = req.params; 
    try{
        const dietToDelete = await Diet.findById(id);
        if (!dietToDelete){
            return res.status(404).json({message: "Diet plan not found"})
        }
        const deletedDiet = await Food.deleteOne({_id: dietToDelete._id})
        res.status(200).json({message: "Plan deleted successfully",deletedDiet})
    } catch (err) {
        res.status(500).json({message: "Failed to delete diet plan",err})
    }

})

router.put("/:id",authenticate,authorizeRoles("admin"),async (req,res) => {
    const {id} = req.params;
    const {planName,duration,goal} = req.body;
    try{
        const dietToUpdate = await Diet.findByIdAndUpdate(
            id,
            {planName,duration,goal},
            { new: true, runValidators: true } 
        );

        if (!dietToUpdate) {
            return res.status(404).json({ message: "Diet plan not found in db" });
        }
        res.status(200).json(dietToUpdate);
    } catch (err) {
        res.status(500).json({message: "Failed to update diet plan",err})
    }
})

export default router;