import mongoose from "mongoose"
import { Video } from "../models/video.model.js"
import { Subscription } from "../models/subscription.model.js"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {

    const channelId = req.user?._id

    // 1. Total videos
    const totalVideos = await Video.countDocuments({
        owner: channelId
    })

    // 2. Total video views
    const totalViewsResult = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $group: {
                _id: null,
                totalViews: {
                    $sum: "$views"
                }
            }
        }
    ])

    const totalViews = totalViewsResult[0]?.totalViews || 0

    // 3. Total subscribers
    const totalSubscribers = await Subscription.countDocuments({
        channel: channelId
    })

    // 4. Total likes on all videos
    const channelVideos = await Video.find({
        owner: channelId
    }).select("_id")

    const videoIds = channelVideos.map((video) => video._id)

    const totalLikes = await Like.countDocuments({
        video: {
            $in: videoIds
        }
    })

    // 5. Send response
    return res.status(200).json(
        new ApiResponse(
            200,
            {
                totalVideos,
                totalViews,
                totalSubscribers,
                totalLikes
            },
            "Channel stats fetched successfully"
        )
    )
})

const getChannelVideos = asyncHandler(async (req, res) => {

    const channelId = req.user?._id

    // Fetch all channel videos
    const videos = await Video.find({
        owner: channelId
    }).sort({ createdAt: -1 })

    return res.status(200).json(
        new ApiResponse(
            200,
            videos,
            "Channel videos fetched successfully"
        )
    )
})

export {
    getChannelStats,
    getChannelVideos
}