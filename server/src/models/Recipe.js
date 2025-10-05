import mongoose from "mongoose"

const recipeSchema = new mongoose.Schema ({
    type: {type:String, default: "recipe"},
    title: {type:String,required: true},
    instructions: {type:String,required: true},
    ingredients: {type:[String],required: true},
    cookTime: {type: String},
    url: {type: String},
    image: {type: String},
    author: {type: String},
    createdAt: {type: Date, default: Date.now}
})


export default mongoose.model("Recipe",recipeSchema);