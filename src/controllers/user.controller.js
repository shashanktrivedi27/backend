import {asyncHandler} from '../utils/asyncHandler.js'
import {User} from '../models/user.model.js'
import { Apierror } from '../utils/apierror.js'
import {uploadCloudinary} from '../utils/cloudinary.js'
import { ApiResponse } from '../utils/apiResponse.js'
const registerUser=asyncHandler(async(req,res)=>{
//get user details from frontend
//calidate the information 
//check if any user is exist before register:username,email
//check for image check for avatar
//upload them tocloudinary
//create user object - create entry in db
//remove passwords and refresh tokens field from resonse
//check for user creation 
//return res    
    const {fullName,email,username,password}=req.body
    //here we use concept of some that is type of a loop
    if(
        [fullName,email,username,password].some((field)=>field?.trim()==="")
    ){
        throw new Apierror(404,"All fields are required")
    }

    const existedUser=User.findOne({
        $or:[{username},{email}]
    })
    if(existedUser){
        throw new Apierror(409,"User with email or username is already exist")
    }
    const avatarLocalPath=req.files?.avatar[0]?.path;

    const coverImageLocalPath=req.files?.coverImage[0]?.path;

    if(!avatarLocalPath){
        throw new Apierror(400,"Avatar file is required")
    }

    const avatar=await uploadCloudinary(avatarLocalPath)
    const coverImage=await uploadCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new Apierror(400,"Avatar file is required")
    }

    const user=User.create({
        fullName,
        avatar:avatar.url,
        coverImage:coverImage.url|"",
        email,
        password,
        username:username.toLowerCase()
    })
    

    const createdUser=await User.findById(user._id).select(
        "-password -refreshTokens"
    )

    if(!createdUser){
        throw new Apierror(500,"Something went wrong while registering user")
    }



    return res.status(200).json(
        new ApiResponse(200,createdUser,"User registered succeafully")
    )
})
export { registerUser}