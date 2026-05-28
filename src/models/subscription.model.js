import mongoose, { Schema } from "mongoose";
const subscriptionSchema=new Schema({
    subsciber:{
        type:Schema.Types.ObjectId,//that are subscribing
        ref:"User"
    },
    channel:{
        type:Schema.Types.ObjectId,//onw to whom 'subsciber' is subscibing
        ref:"User"
    }
},{timestamps:true})
export const Subscription=mongoose.model("Subscription",subscriptionSchema)