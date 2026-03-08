import mongoose, { Schema } from "mongoose";
const subscriptionSchema=new Schema({
    subsciber:{
        typeof:Schema.Types.ObjectId,//that are subscribing
        ref:"User"
    },
    channel:{
        typeof:Schema.Types.ObjectId,//onw to whom 'subsciber' is subscibing
        ref:"User"
    }
},{timestamps:true})
export const subscription=mongoose.model("Subscription",subscriptionSchema)