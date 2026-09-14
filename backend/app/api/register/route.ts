import userSchema from "@/app/schema/user.schema";
import { NextResponse } from "next/server";
import { DbConnection } from "@/lib/db.connection";
import { sendOtpEmail } from "@/lib/email";
import bcrypt from "bcrypt"
export async function POST(req:Request){
    await DbConnection();
    const {username,email,password}=await req.json()
    if(!username||!email||!password){
        return NextResponse.json({message:"Cant find username or email or password"})
    }
    const finduser=await userSchema.findOne({email:email})
    if(finduser && finduser.verified){
        return NextResponse.json({message:"User already exists"})
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    const hashpassword=await bcrypt.hash(password,10)
    if(!hashpassword){
        return NextResponse.json({message:"Cant hash the password"})
    }
    const newuser=await userSchema.create({
        username:username,
        email:email,
        password:hashpassword,
        otp:otp,
        otpexpiry:otpExpiresAt
    })
    if(!newuser){
        return NextResponse.json({message:"User not created"})
    }

    try {
        await sendOtpEmail(email, otp);
    } catch (error) {
        console.error("[REGISTER] OTP email failed:", error);
        return NextResponse.json({message:"User created but OTP email could not be sent"}, {status:500})
    }

    return NextResponse.json({message:"User created successfully"})
}