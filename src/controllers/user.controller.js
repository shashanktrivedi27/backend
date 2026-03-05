import {asyncHandler} from '../utils/asyncHandler.js'
import {User} from '../models/user.model.js'
import { Apierror } from '../utils/apierror.js'
import {uploadCloudinary} from '../utils/cloudinary.js'
import { ApiResponse } from '../utils/apiResponse.js'

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
        throw new Apierror(404,"All fields are required")
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
    //check from req.file.coverImage is that array if it's is array thgen its length should be greater than 0
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


    //agar sab kuch hp gaya hai to object create kar do jo jaayega sidhe db m 
    const user=await User.create({
        fullname,
        avatar:avatar.url,
        coverImage:coverImage?.url||"",
        email,
        password,
        username:username.toLowerCase()
    })
    
    //or jo createduser hai usla password or refreshoken hide karna hai
    const createdUser=await User.findById(user._id).select(
        "-password -refreshTokens"
    )

    if(!createdUser){
        throw new Apierror(500,"Something went wrong while registering user")
    }



    return res.status(200).json(
        new ApiResponse(200,createdUser,"User registered successfully")
    )
})
export { registerUser}