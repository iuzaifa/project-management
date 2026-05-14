import mongoose, {Schema, schema, Types} from 'mongoose';
import bcript from "bcript"
import jwt from "jsonwebtoken"
import crypto from "crypto";


const userShema = new Schema(
    {
        avatar : {
            type :{
                url : String,
                localPath : String
            },
            default : {
                url : "https://placehold.net/avatar-4.svg",
                localPath : String
            }
        },
        username : {
            type : String,
            require : true,
            unique : true,
            lowercase : true,
            trim : true,
            index : true
        },
        email : {
            type : String,
            require : true,
            unique : true,
            lowercase : true,
            trim : true,
        },
        fullName : {
            type : String,
            trim : true,
        },
        password : {
            type : String,
            required  : [true, "Password is Required"]
        },
        isEmailVerified : {
            type : Boolean,
            default : false
        },
        refreshToken : {
            type : String,
        },
        forgotPasswordToken : {
            type : String
        },
        forgotPasswordExpiry :{
            type : Date,
        },
        emailVerificationToken : {
            type : String
        }, 
        emailVerificationExpiry : {
            type : Date
        }

    }
)

userShema.pre("save", async function (next) {
    if(!this.isModified("password")) return next();
    this.password = await bcript.hash(this.password, 10);
    next();
})

userShema.methods.isPasswordCorrect = async function (password) {
    return await bcript.compare(password, this.password)    
};


userShema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id : this._id,
            email : this.email,
            username : this.username
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn : process.env.ACCESS_TOKEN_EXPIRY
        }
    )
    
}

userShema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id : this._id,
            // email : this.email,
            // username : this.username
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn : process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

userShema.methods.generateTemporaryToken = function () {

    const unHashedToken =  crypto.randomBytes(20).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(unHashedToken).digest("hex");
    const tokenExpiry = Date.now() + ( 20 * 60 * 1000) // 20 mins 

    return {unHashedToken, hashedToken, tokenExpiry}
}
export  const User = mongoose.model("User", userShema);