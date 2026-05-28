import mongoose, { isValidObjectId } from "mongoose"
import { User } from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const toggleSubscription = asyncHandler(async (req, res) => {

    const { channelId } = req.params

    // 1. Validate channelId
    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID")
    }

    // 2. Prevent self subscription
    if (channelId === req.user?._id.toString()) {
        throw new ApiError(400, "You cannot subscribe to your own channel")
    }

    // 3. Check if channel exists
    const channel = await User.findById(channelId)

    if (!channel) {
        throw new ApiError(404, "Channel not found")
    }

    // 4. Check existing subscription
    const existingSubscription = await Subscription.findOne({
        channel: channelId,
        subscriber: req.user?._id
    })

    // 5. Unsubscribe
    if (existingSubscription) {

        await existingSubscription.deleteOne()

        return res.status(200).json(
            new ApiResponse(
                200,
                null,
                "Channel unsubscribed successfully"
            )
        )
    }

    // 6. Subscribe
    const subscription = await Subscription.create({
        channel: channelId,
        subscriber: req.user?._id
    })

    // 7. Send response
    return res.status(201).json(
        new ApiResponse(
            201,
            subscription,
            "Channel subscribed successfully"
        )
    )
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {

    const { channelId } = req.params

    // 1. Validate channelId
    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID")
    }

    // 2. Fetch subscribers
    const subscribers = await Subscription.find({
        channel: channelId
    }).populate("subscriber", "username avatar fullname")

    // 3. Send response
    return res.status(200).json(
        new ApiResponse(
            200,
            subscribers,
            "Channel subscribers fetched successfully"
        )
    )
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {

    const { subscriberId } = req.params

    // 1. Validate subscriberId
    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Invalid subscriber ID")
    }

    // 2. Fetch subscribed channels
    const subscribedChannels = await Subscription.find({
        subscriber: subscriberId
    }).populate("channel", "username avatar fullname")

    // 3. Send response
    return res.status(200).json(
        new ApiResponse(
            200,
            subscribedChannels,
            "Subscribed channels fetched successfully"
        )
    )
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}