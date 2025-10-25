import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    userEmail: {type: String,required:true,unique:true},
    userName: {type:String,required:true,unique:true},
    password: {type:String,required:true},
    role: {type:String,enum: ["admin","user","viewer"],default: "user"},
    foodItems: {type: [Object],default: []},
})

export default mongoose.model("User",userSchema);