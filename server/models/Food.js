import mongoose from "mongoose"

const foodSchema = new mongoose.Schema ({
    title: {type:String,required: true},
    foodType: {type: String,require: true},
    url: {type: String},
    author: {type: String},
    createdAt: {type: Date, default: Date.now}
})


export default mongoose.model("Food",foodSchema);