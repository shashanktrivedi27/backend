import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
const app=express()
app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))
app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

//routes

// --- IMPORT ROUTES ---
import userRouter from './routes/user.route.js'
import videoRouter from './routes/video.route.js'
import commentRouter from './routes/comment.route.js'
import likeRouter from './routes/likes.route.js'
import playlistRouter from './routes/playlist.route.js'
import subscriptionRouter from './routes/subscription.route.js'
import dashboardRouter from './routes/dashboard.route.js'

// --- ROUTE DECLARATIONS ---
app.use("/api/v1/users", userRouter)
app.use("/api/v1/videos", videoRouter)
app.use("/api/v1/comments", commentRouter)
app.use("/api/v1/likes", likeRouter)
app.use("/api/v1/playlists", playlistRouter)
app.use("/api/v1/subscriptions", subscriptionRouter)
app.use("/api/v1/dashboard", dashboardRouter)



export {app}