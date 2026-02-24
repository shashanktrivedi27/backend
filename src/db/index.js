import mongoose from "mongoose";
import {DB_NAME} from '../constants.js'

const connectdb=async()=>{
    try{
        const connectionInstance=await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`\n MongoDB is connected !! DB HOST: ${connectionInstance.connection.host}`)
    }
    catch(error){
        console.log("Error :- ",error)
        process.exit(1)
    }
}
export default connectdb