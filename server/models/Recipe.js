import mongoose from "mongoose"

const recipeSchema = new mongoose.Schema ({
    title: {type:String,required: true},
    instructions: {type:String,required: true},
    ingredients: {type:[String],required: true},
    author: {type: String},
    createdAt: {type: Date, default: Date.now}

})


export default mongoose.model("Recipe",recipeSchema);