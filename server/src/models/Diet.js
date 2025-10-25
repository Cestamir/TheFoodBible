import mongoose from "mongoose"

const dietSchema = new mongoose.Schema ({
    goal: {type:String,required: true},
    planName: {type:String, required: true},
    duration: {type: Number,required: true,default: 30},
})


export default mongoose.model("Diet",dietSchema);