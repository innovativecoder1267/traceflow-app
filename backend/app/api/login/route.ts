import userSchema from "@/app/schema/user.schema";
import { DbConnection } from "@/lib/db.connection";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
export  async function POST(req:Request){
    await DbConnection();
    const {email,password}=await req.json()
    if(!email||!password){
        throw NextResponse.json("Cant find email or password")
    }
    const finduser=await userSchema.findOne({email:email})
    if(!finduser){
        throw NextResponse.json("Cant find user")
    }
     
    const ispasswordcorrect=await bcrypt.compare(password,finduser.password)
    if(!ispasswordcorrect){
        throw NextResponse.json("Password doesnt matched")
    }
    const token= jwt.sign(
        {
            userId:finduser._id
        },
        process.env.JWT_SECRET!,
        {
            expiresIn:"3d"
        }
    )
    if(!token){
        throw NextResponse.json("Cant Create the token for the user ")
    }
const response = NextResponse.json({
  message: "Login successful",
});   
    response.cookies.set("accessToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
});

return response;
}