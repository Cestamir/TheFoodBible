import mongoose from "mongoose"

const foodSchema = new mongoose.Schema ({
    type: {type:String, default: "food"},
    name: {type:String,required: true},
    foodType: {type: String,required: true},
    wikiUrl: {type: String},
    fcdId: {type: Number},
    nutrition: {type: [Object]},
    imageUrl: {type: String},
    author: {type: String,default: "admin"},
    createdAt: {type: Date, default: Date.now}
})


export default mongoose.model("Food",foodSchema);