import mongoose from "mongoose"

const recipeSchema = new mongoose.Schema ({
    type: {type:String, default: "recipe"},
    name: {type:String,required: true},
    diet: {type:[String]},
    instructions: {type:String,required: true},
    ingredients: {type:[String],required: true},
    cookTime: {type: String},
    url: {type: String},
    imageUrl: {type: String},
    author: {type: String,default: "admin"},
    createdAt: {type: Date, default: Date.now}
})


export default mongoose.model("Recipe",recipeSchema);