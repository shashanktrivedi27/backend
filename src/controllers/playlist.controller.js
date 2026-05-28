import mongoose, { isValidObjectId } from "mongoose"
import { Playlist } from "../models/playlist.model.js"
import { Apierror } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const createPlaylist = asyncHandler(async (req, res) => {

    const { name, description } = req.body

    // 1. Validate fields
    if (!name || name.trim() === "") {
        throw new ApiError(400, "Playlist name is required")
    }

    // 2. Create playlist
    const playlist = await Playlist.create({
        name,
        description,
        owner: req.user?._id
    })

    // 3. Send response
    return res.status(201).json(
        new ApiResponse(
            201,
            playlist,
            "Playlist created successfully"
        )
    )
})

const getUserPlaylists = asyncHandler(async (req, res) => {

    const { userId } = req.params

    // 1. Validate userId
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user ID")
    }

    // 2. Fetch playlists
    const playlists = await Playlist.find({
        owner: userId
    })

    // 3. Send response
    return res.status(200).json(
        new ApiResponse(
            200,
            playlists,
            "User playlists fetched successfully"
        )
    )
})

const getPlaylistById = asyncHandler(async (req, res) => {

    const { playlistId } = req.params

    // 1. Validate playlistId
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID")
    }

    // 2. Fetch playlist
    const playlist = await Playlist.findById(playlistId)
        .populate("videos")
        .populate("owner", "username avatar")

    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }

    // 3. Send response
    return res.status(200).json(
        new ApiResponse(
            200,
            playlist,
            "Playlist fetched successfully"
        )
    )
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {

    const { playlistId, videoId } = req.params

    // 1. Validate IDs
    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid ID")
    }

    // 2. Find playlist
    const playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }

    // 3. Ownership check
    if (playlist.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "You are not allowed to modify this playlist")
    }

    // 4. Prevent duplicate videos
    const alreadyExists = playlist.videos.includes(videoId)

    if (alreadyExists) {
        throw new ApiError(400, "Video already exists in playlist")
    }

    // 5. Add video
    playlist.videos.push(videoId)

    await playlist.save({ validateBeforeSave: false })

    // 6. Send response
    return res.status(200).json(
        new ApiResponse(
            200,
            playlist,
            "Video added to playlist successfully"
        )
    )
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {

    const { playlistId, videoId } = req.params

    // 1. Validate IDs
    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid ID")
    }

    // 2. Find playlist
    const playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }

    // 3. Ownership check
    if (playlist.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "You are not allowed to modify this playlist")
    }

    // 4. Remove video
    playlist.videos.pull(videoId)

    await playlist.save({ validateBeforeSave: false })

    // 5. Send response
    return res.status(200).json(
        new ApiResponse(
            200,
            playlist,
            "Video removed from playlist successfully"
        )
    )
})

const deletePlaylist = asyncHandler(async (req, res) => {

    const { playlistId } = req.params

    // 1. Validate playlistId
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID")
    }

    // 2. Find playlist
    const playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }

    // 3. Ownership check
    if (playlist.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "You are not allowed to delete this playlist")
    }

    // 4. Delete playlist
    await playlist.deleteOne()

    // 5. Send response
    return res.status(200).json(
        new ApiResponse(
            200,
            null,
            "Playlist deleted successfully"
        )
    )
})

const updatePlaylist = asyncHandler(async (req, res) => {

    const { playlistId } = req.params
    const { name, description } = req.body

    // 1. Validate playlistId
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID")
    }

    // 2. Find playlist
    const playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }

    // 3. Ownership check
    if (playlist.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "You are not allowed to update this playlist")
    }

    // 4. Update fields
    if (name) {
        playlist.name = name
    }

    if (description) {
        playlist.description = description
    }

    await playlist.save({ validateBeforeSave: false })

    // 5. Send response
    return res.status(200).json(
        new ApiResponse(
            200,
            playlist,
            "Playlist updated successfully"
        )
    )
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}