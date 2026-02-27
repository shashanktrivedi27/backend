import dotenv from 'dotenv'
import connectdb from './db/index.js'
import { app } from './app.js'

dotenv.config({
    path:'./env'
})
connectdb()
.then(()=>{
    
    app.listen(process.env.PORT||8000,()=>{
        console.log(`Server is running on Port Number ${process.env.PORT}`);
    })
})
.catch((err)=>{
    console.log("MongoDB connection failed :- ",err)
})








/*
import express from 'express'
const app=express()
;(async()=>{
    try{
        await mongoose.connect(`${process.env.MONGODB_URI}/${ DB_NAME}`)
        app.on("error",(error)=>{
            console.log("ERR:-",error)
            throw error
        })
        app.listen(process.env.PORT,()=>{
            console.log(`Process is running on ${process.env.PORT}`)
        })
    }
    catch(error){
        console.log("Error :-",error);
        throw error
    }
})()
    */