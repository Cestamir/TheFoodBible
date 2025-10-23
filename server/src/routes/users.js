import express from "express";
const router = express.Router();
import User from "../models/User.js";
import { authenticate,authorizeRoles } from "../middleware/auth.js";
import bcrypt from "bcrypt"

// unused method already in auth
router.post("/",authenticate,authorizeRoles("admin"), async (req,res) => {
    const {userName,userEmail,password,role} = req.body;
    try {
        const newUser = new User({userName,userEmail,password,role});
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

export default router;