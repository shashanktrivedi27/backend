import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {Apierror, ApiError} from "../utils/apierror.js"
import {ApiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadCloudinary, uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
    const matchStage={};
    if(query){
        matchStage.title={$regex:query,$options:"i"}
    }
    if(userId){
        if(!isValidObjectId(userId)){
            throw new Apierror(400,"invalid user")
        }
        matchStage.owner=new mongoose.Types.ObjectId(userId);
    }
    const sortStage={
        [sortBy]:sortType==="asc"?1:-1
    }
    const aggregate=Video.aggregate([
        {
            $match:matchStage
        },
        {
            $sort:sortStage
        }
    ])
    const options={
        page:parseInt(page),
        limit:parseInt(limit)
    }
    const videos=await Video.aggregatePaginate(aggregate,options);
    return res.status(200).json(
        new ApiResponse(200,videos,"video fetched successfully")
    )
});



const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    if(!title||!description){
        throw new Apierror(400,"Title and description are required")
    }
    const videoPath=req.files?.videoFile?.[0]?.path;
    const thumbnailPath=req.files?.thumbnail?.[0]?.path;
     if(!videoPath||!thumbnailPath){
        throw new Apierror(400,"VideoFile and Thumbnail are required")
     }

     const videoUpload=await uploadOnCloudinary(videoPath)
     const thumbnailUpload=await uploadOnCloudinary(thumbnailPath)
    // TODO: get video, upload to cloudinary, create video

    if(!videoUpload||!thumbnailUpload){
        throw new Apierror(400,"Failed to upload files")
    }

    const video=await Video.create({
        title,
        description,
        videoFile:videoUpload.url,
        thumbnail:thumbnailUpload.url,
        owner:req.user?._id//from verifyJWT
    })
    return res.status(201).json(
        new ApiResponse(201, video, "Video published successfully")
    );

})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    if(!isValidObjectId(videoId)){
        throw new Apierror(400,"invalid video Id")
    }
    const video=await Video.findById(videoId);
    if(!video){
        throw new Apierror(404,"video not found")
    }
    return res.status(200).json(
        new ApiResponse(200,video,"video fetched successfully")
    )
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail
    const {title,description}=req.body;
    if(!isValidObjectId(videoId)){
        throw new Apierror(400,"VideoId is invalid")
    }
    const video=await Video.findById(videoId);
    if(!video){
        throw new Apierror(404,"video is not found")
    }

    if(video.owner.tostring()!==req.user?._id.tostring()){
        throw new Apierror(403,"you are not able to make changes")
    }
    if(title){
        video.title=title;
    }
    if(description){
        video.description=description;
    }
    const thumbnailLocalPath=req.files?.path;
    if(thumbnailLocalPath){
        const thumbnailUpload=await uploadCloudinary(thumbnailLocalPath);
        if(!thumbnailUpload){
            throw new Apierror(500,"failed to upload thumbnail");
        }
        video.thumbnail=thumbnailUpload.url
    }
    await video.save({validateBeforeSave:false});
    return res.status(200).json(
        new ApiResponse(200,video,"video uploaded successfully")
    )

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
    if(!isValidObjectId(videoId)){
        throw new Apierror(400,"videoid is invalid")
    }
    const video=await Video.findById(videoId);
    if(!video){
        throw new Apierror(404,"video not found")
    }
    if(video.owner.toString()!==req.user?._id.tostring()){
        throw new Apierror(403,"you are not able to delete the video")
    }
    await video.deleteOne()
    return res.status(201).json(
        new ApiResponse(201,video,"video deleted successfully")
    )
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if(!isValidObjectId(videoId)){
        throw new Apierror(400,"videoid is invalid")
    }
    const video=await Video.findById(videoId);
    if(!video){
        throw new Apierror(404,"video is not found")
    }
    if(video.owner.toString()!==req.user?._id.tostring()){
        throw new Apierror(403,"you are not able to toggle")
    }
    video.isPublished=!video.isPublished;
    await video.save({validatebeforeSave:false});
    return res.status(200).json(
        new ApiResponse(200,video,`video is now ${video.isPublished?"published":"unpublished"}`)
    )
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}