import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import User from "../models/User.js"


const JWT_SECRET = process.env.JWT_SECRET;

export const registerUser = async (req,res) => {
    const {userName,password,userEmail,role} = req.body;

    const existingUser = await User.findOne({userName});
    if(existingUser) return res.status(400).json({message: "User already exists"});

    const hashed = await bcrypt.hash(password,20);
    const user = new User({userName,userEmail,password: hashed,role});
    await user.save()

    res.status(201).json({message: "User registered succesfully!"})

}

export const loginUser = async (req,res) => {
    const {userName,password} = req.body;

    const user = await User.findOne({userName});
    if(!user) return res.status(400).json({message: "Invalid username credentials"});

    const match = await bcrypt.compare(password,user.password);
    if(!match) return res.status(400).json({message: "Invalid password"});

    const token = jwt.sign({id: user._id,role: user.role},JWT_SECRET,{expiresIn: "1h"});
    res.json({token})
}
