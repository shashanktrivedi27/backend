import mongoose, { isValidObjectId } from "mongoose"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {

    const { videoId } = req.params

    // 1. Validate videoId
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }

    // 2. Check if already liked
    const existingLike = await Like.findOne({
        video: videoId,
        likedBy: req.user?._id
    })

    // 3. Unlike if already liked
    if (existingLike) {

        await existingLike.deleteOne()

        return res.status(200).json(
            new ApiResponse(
                200,
                null,
                "Video unliked successfully"
            )
        )
    }

    // 4. Create new like
    const like = await Like.create({
        video: videoId,
        likedBy: req.user?._id
    })

    return res.status(201).json(
        new ApiResponse(
            201,
            like,
            "Video liked successfully"
        )
    )
})

const toggleCommentLike = asyncHandler(async (req, res) => {

    const { commentId } = req.params

    // 1. Validate commentId
    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID")
    }

    // 2. Check existing like
    const existingLike = await Like.findOne({
        comment: commentId,
        likedBy: req.user?._id
    })

    // 3. Unlike
    if (existingLike) {

        await existingLike.deleteOne()

        return res.status(200).json(
            new ApiResponse(
                200,
                null,
                "Comment unliked successfully"
            )
        )
    }

    // 4. Create like
    const like = await Like.create({
        comment: commentId,
        likedBy: req.user?._id
    })

    return res.status(201).json(
        new ApiResponse(
            201,
            like,
            "Comment liked successfully"
        )
    )
})

const toggleTweetLike = asyncHandler(async (req, res) => {

    const { tweetId } = req.params

    // 1. Validate tweetId
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID")
    }

    // 2. Check existing like
    const existingLike = await Like.findOne({
        tweet: tweetId,
        likedBy: req.user?._id
    })

    // 3. Unlike
    if (existingLike) {

        await existingLike.deleteOne()

        return res.status(200).json(
            new ApiResponse(
                200,
                null,
                "Tweet unliked successfully"
            )
        )
    }

    // 4. Create like
    const like = await Like.create({
        tweet: tweetId,
        likedBy: req.user?._id
    })

    return res.status(201).json(
        new ApiResponse(
            201,
            like,
            "Tweet liked successfully"
        )
    )
})

const getLikedVideos = asyncHandler(async (req, res) => {

    // 1. Fetch liked videos
    const likedVideos = await Like.find({
        likedBy: req.user?._id,
        video: { $exists: true }
    }).populate("video")

    // 2. Extract video data
    const videos = likedVideos.map((like) => like.video)

    // 3. Send response
    return res.status(200).json(
        new ApiResponse(
            200,
            videos,
            "Liked videos fetched successfully"
        )
    )
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}