
import {User} from "../models/user.models.js";
import {ApiResponse} from "../utils/api-response.js";
import ApiError from "../utils/api-error.js";
import asyncHandler from "../utils/async-handler.js"
import {sendEmail , emailVerificationMailgenContent} from "../utils/Mail.js"
import jwt from "jsonwebtoken"


const generateAccessAndRefresshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave : false})
        return {accessToken, refreshToken}

    } catch (error) {
        throw new ApiError(500, "Something went  wrong while generating access token")
    }

}

const registerUser = asyncHandler(async (req, res) => {

    const {email, username, password, role} = req.body;

    const exitstedUser = await User.findOne({
        $or : [{username}, {email}]
    })
    if(exitstedUser){
        throw new ApiError(409,  "User with email and Username is already exits", [])
    }

    const user =  await User.create({
        email,
        password,
        username,
        isEmailVerified : false
    })

    const {unHashedToken, hashedToken, tokenExpiry} = user.generateTemporaryToken();

    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpiry = tokenExpiry;

    await user.save({ validateBeforeSave : false})

    await sendEmail ({
        email : user?.email,
        subject : "Please verify  your email !",
        mailgenContent : emailVerificationMailgenContent(
            user.username,
            `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unHashedToken}`
            /**
             * In the future, will we see URLs like this?
             * Local  => http://localhost:8000/api/v1/users/verify-email/12345abc...
             * Server => https://myapp.com/api/v1/users/verify-email/12345abc...
            */
        )
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
    );

    if(!createdUser){
        throw new ApiError(500, "Something went wrong while registering a user!")
    }

    return res.status(201).json(
        new ApiResponse(
            200,
            {user : createdUser},
            "User registered successfully and verification email has been send on your email!"
        )
    )

})


const login = asyncHandler(async (req, res) => {
    const {email, password} = req.body;
    if(!email){
        throw new ApiError(400, "Email is required")
    }
    const user = await User.findOne({email});
    if(!user){
        throw new ApiError(400, "User does mot exits")
    }
    const isPasswordValid = await user.isPasswordCorrect(password)
    if(!isPasswordValid){
        throw new ApiError(400, "Invalid user credentils")
    }

    const {accessToken, refreshToken} = await generateAccessAndRefresshToken (user._id);

    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
    )

    const options = {
        httpOnly : true,
        secure : true
    }

    return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200, 
                {
                    user : loggedInUser,
                    accessToken,
                    refreshToken
                },
                "User loggedIn successfully.!"
            )
        )

    



})


const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set : {
                refreshToken : ""
            },
        },
        {
            new : true
        }
    );
    const options = {
        httpOnly : true,
        secure : true
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse (200, {}, "User Logout successfully")
        )
        
})

const getCurrentUser = asyncHandler ( async ( req, res ) => {
    return res.status(200)
        .json(new ApiResponse (
            200,
            req.user,
            "Current user fetched successfully!"
        ))
})


const verifyEmail = asyncHandler ( async ( req, res ) => {
    const verificationToken = req.params;
    if(!verificationToken) {
        throw new ApiError(400, "Email verification token is missing!");
    }

    const hashedToken = crypto.createHash("sha256").update(verificationToken).digest("hex")

    const user = await User.findById({
        emailVerificationToken : hashedToken,
        emailVerificationExpiry : { $gt : Date.now()}
    })
    if(!user){
        throw new ApiError(400, "Token is invalid or expired")
    }

    user.emailVerificationToken = undefined;
    user.emailVerificationExpiry = undefined;

    user.isEmailVerified = true;
    await user.save({validateBeforeSave : false})

    return res
        .status(200)
        .json(new ApiResponse (
            200,
            {isEmailVerified : true},
            "Email is Verified "
        ))

})

const resendEmailVerification = asyncHandler ( async ( req, res ) => {
    
    try {
        const user =  await User.findById(req.user._id);
        if(!user){
            throw new ApiError(404, "User does not exits")
        }
    
        if(user.isEmailVerified){
            throw new ApiError(409, "Email already verified")
        }
    
        const {unHashedToken, hashedToken, tokenExpiry} = user.generateTemporaryToken();
    
        user.emailVerificationToken = hashedToken;
        user.emailVerificationExpiry = tokenExpiry;
    
        await user.save({ validateBeforeSave : false})
    
        await sendEmail ({
            email : user?.email,
            subject : "Please verify  your email !",
            mailgenContent : emailVerificationMailgenContent(
                user.username,
                `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unHashedToken}`
            )
        })
    
        return res.status(200)
            .json(new ApiResponse(
                200,
                {},
                "Verification email resent successfully"
            ))
    
    } catch (error) {
       console.error("Erorr : ", error)
    }
})

const refreshAccessToken = asyncHandler ( async ( req, res ) => {

    const incommingRefreshToken = req.cookies.refreshAccess || req.body.refreshAccess;
    if(!incommingRefreshToken){
        throw new ApiError(401, "Unauthorized access")
    }

    try {
        const decodedToken = jwt.verify(incommingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findById(decodedToken?._id);
        if(!user){
            throw new ApiError(401, "Invalid refresh token")
        }

        if(incommingRefreshToken !== user?.refreshToken){
            throw new ApiError(401, "Refresh token is expired ")
        }

        const options = {
            httpOnly : true,
            secure : true,
        }
        // refreshToken: newRefreshToken is mean cast in new var
        const {accessToken, refreshToken: newRefreshToken} = await generateAccessAndRefresshToken(user._id);
        
        user.refreshToken = newRefreshToken;
        await user.save()
        return res.status(200)
            .console("accessToken", accessToken, options)
            .console("refreshToken", newRefreshToken, options)
            .json(new ApiResponse(200,{accessToken, refreshToken: newRefreshToken},"Access token refreshed"
        ))

        

    } catch (error) {
        
    }

})


// const getCurrentUser = asyncHandler ( async ( req, res ) => {})
export {registerUser, login, logoutUser, verifyEmail, resendEmailVerification, refreshAccessToken};