import {asyncHandler} from '../utils/asyncHandler.js'
import {User} from '../models/user.model.js'
import { Apierror } from '../utils/apierror.js'
import {uploadCloudinary} from '../utils/cloudinary.js'
import { ApiResponse } from '../utils/apiResponse.js';
import  jwt  from 'jsonwebtoken';

const generateAccessAndRefreshToken=async(userId)=>     {
    try{
        const user=await User.findById(userId)
        const accessToken=user.generateAccessTokens()
        const refreshToken=user.generateRefreshTokens()

        user.refreshToken=refreshToken
        await user.save({validateBeforeSave:false})

        return {accessToken,refreshToken}
    }
    catch(err){
        console.error("TOKEN GEN ERROR:", err)
        throw new Apierror(500,"someething went wrong while generating the access and refresh token")
    }
}

const registerUser = asyncHandler(async(req, res) => {
    //console.log("REQ.FILES =>", req.files);
    //console.log("REQ.BODY =>", req.body);
    
    // ... rest of code//get user details from frontend
//calidate the information 
//check if any user is exist before register:username,email
//check for image check for avatar
//upload them tocloudinary
//create user object - create entry in db
//remove passwords and refresh tokens field from resonse
//check for user creation 
//return res    
    //here we extract all data from the datapoints of req.body
    const {fullname,email,username,password}=req.body
    //here we use concept of some that is type of a loop

    //here we check either it's empty or not
    if(
        [fullname,email,username,password].some((field)=>field?.trim()==="")
    ){
        throw new Apierror(400,"All fields are required")
    }
    //whether it exist or not   
    const existedUser=await User.findOne({
        $or:[{username},{email}]
    })
    if(existedUser){
        throw new Apierror(409,"User with email or username is already exist")
    }
    const avatarLocalPath = req.files?.avatar?.[0]?.path;

    //const coverImageLocalPath=req.files?.coverImage?.[0]?.path;
    //used for checkung whether it's coverImage or not ....And how it find
    //check from req.file.coverImage is that array if it's is array then its length should be greater than 0
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if(!avatarLocalPath){
        throw new Apierror(400,"Avatar file is required")
    }

    const avatar=await uploadCloudinary(avatarLocalPath)
    const coverImage=await uploadCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new Apierror(400,"Avatar file is required")
    }


    //agar sab kuch ho gaya hai to object create kar do jo jaayega sidhe db m 
    const user=await User.create({
        fullname,
        avatar:avatar.url,
        coverImage:coverImage?.url||"",
        email,
        password,
        username:username.toLowerCase()
    })
    
    //or jo createduser hai uska password or refreshoken hide karna hai
    const createdUser=await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new Apierror(500,"Something went wrong while registering user")
    }



    return res.status(200).json(
        new ApiResponse(200,createdUser,"User registered successfully")
    )
})

const loginUser=asyncHandler(async(req,res)=>{
    //req->body
    //name or email,password
    //check from DATABASE whether hai ya nahi
    //check the password
    //access and refresh token 
    //send cookie 
    const {username,email,password}=req.body
    if(!(username||email)){
        throw new Apierror(400,"username or email is required")
    }
    const user=await User.findOne({
        $or:[{username},{email}]
    })
    if(!user){
        throw new Apierror(404,"User not found")
    }

    const isPasswordValid=await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new Apierror(401,"Password is incorrect")
    }

    const {accessToken, refreshToken}=await generateAccessAndRefreshToken(user._id)

    const loggedInUser=await User.findById(user._id).select("-password -refreshToken")

    const options={
        httpOnly:true,
        secure:true
    }
    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken ,options)
    .json(
        new ApiResponse(
            200,
            {
                user:loggedInUser,accessToken,refreshToken
            },
            "User Logged In successfully"
        )
    )
})

const logoutUser=asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken:undefined  
            }
        },
        {
            new:true
        }
    )

    const options={
        httpOnly:true,
        secure:true
    }

    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(
        new ApiResponse(
            200,
            {

            },
            "User logout successfully"
        )
    )
} )


const refreshAccessToken=asyncHandler(async(req,res)=>{
    const incomingRefreshToken=req.cookies.refreshToken||req.body.refreshToken

    if(!incomingRefreshToken){
        throw new Apierror(401,"Unauthorized request")
    }

    const decodedToken=jwt.verify(
        incomingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET
    )
    const user=await User.findById(decodedToken?._id)
     if(!user){
        throw new Apierror(401,"Invalid refresh token")
    }

    if(incomingRefreshToken!==user?.refreshToken){
        throw new Apierror(401,"Refresh token is expired or used")
    }

    const options={
        httpOnly:true,
        secure:true
    }
    const {accessToken,newrefreshToken}=await generateAccessAndRefreshToken(user?._id)

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",newrefreshToken,options)
    .json(
        200,
        {
            accessToken,refreshToken:newrefreshToken 
        },
        "Access Token refreshed successfully"
    )

})
export { registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken
}