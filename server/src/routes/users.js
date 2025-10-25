import express from "express";
const router = express.Router();
import User from "../models/User.js";
import { authenticate,authorizeRoles } from "../middleware/auth.js";
import bcrypt from "bcrypt"
import Food from "../models/Food.js";

// ADMIN ROUTES

router.post("/",authenticate,authorizeRoles("admin"), async (req,res) => {
    const {userName,userEmail,password,role,foodItems} = req.body;
    try {
        const newUser = new User({userName,userEmail,password,role,foodItems});
        await newUser.save();
        res.status(201).json(newFood)
    } catch (err) {
        res.status(500).json({message: "Error ocurred while creating new user",error: err})
    }
});

router.get("/",authenticate,authorizeRoles("admin"), async (req,res) => {
    try{
        const users = await User.find();
        res.status(200).json(users)
    } catch (err) {
        res.status(500).json({message: "Error fetching users from database.",error: err})
    }
});


router.delete("/:id",authenticate,authorizeRoles("admin"), async (req,res) => {
    const {id} = req.params; 
    try{
        const userToDelete = await User.findById(id);
        if (!userToDelete){
            return res.status(404).json({message: "User not found"})
        }
        const deletedUser = await User.deleteOne({_id: userToDelete._id})
        res.status(200).json({message: "Deleted user successfully",deletedUser})
    } catch (err) {
        res.status(500).json({message: "Failed to delete user",err})
    }

})

router.put("/:id",authenticate,authorizeRoles("admin"),async (req,res) => {
    const {id} = req.params;
    const updates = req.body;
    try{
        // encrypt password if provided
        if(updates.password){
            updates.password = await bcrypt.hash(updates.password,10);
        }
        const userToUpdate = await User.findByIdAndUpdate(id,updates,{ new: true, runValidators: true });
        if(!userToUpdate){
            return res.status(404).json({message: "user not found"});
        }
        res.status(200).json(userToUpdate);
    } catch (err) {
        res.status(500).json({message: "Failed to update user",err})
    }
})

// USER ROUTES

router.get("/me",authenticate,async (req,res) => {
    try {
        
        const user = await User.findById(req.user.id).select("-password")
        if(!user){
            return res.status(404).json({message: "User not found."})
        }
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({message: "Error fetching user profile", error: err.message});
    }
})

router.get("/me/foods",authenticate,async (req,res) => {
    try {
        
        const user = await User.findById(req.user.id).select("foodItems");
        if(!user){
            return res.status(404).json({message: "User not found."})
        }
        res.status(200).json(user.foodItems || []);

    } catch (err) {
        res.status(500).json({message: "Error fetching user food items", error: err.message});
    }
})

router.post("/me/foods",authenticate, async (req,res) => {
    const {foodId} = req.body;  
    try {
        const food = await Food.findById(foodId);
        if(!food){
           return res.status(404).json({message: "Food not found."})
        }

        const user = await User.findById(req.user.id);
        if(!user){
           return res.status(404).json({message: "User not found."})
        }

        const alreadyExistsInCollection = user.foodItems.some(item => item._id.toString() === foodId);
        if(alreadyExistsInCollection){
           return res.status(400).json({message: "Food already exists in user collection."})
        }

        user.foodItems.push(food);
        await user.save()

        res.status(200).json({message: "Food added to collection",food: food})
        
    } catch (error) {
        res.status(500).json({message: "Error adding food to collection."})
    }
})

router.delete("/me/foods/:foodId",authenticate, async (req,res) => {
    const {foodId} = req.params;
    try {
        const user = await User.findById(req.user.id);
        if(!user){
           return res.status(404).json({message: "User not found."})
        }

        const initialLength = user.foodItems.length;
        user.foodItems = user.foodItems.filter((item) => item._id.toString() !== foodId);
        if(initialLength === user.foodItems.length){
           return res.status(404).json({message: "Food not found in user collection."})
        }

        await user.save();

        res.status(200).json({message: "Food added to user collection."});
        
    } catch (error) {
        res.status(500).json({message: "Error deleting food from user collection.",error})
    }
})


export default router;