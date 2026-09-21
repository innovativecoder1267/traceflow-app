import userSchema from "@/app/schema/user.schema";
import { NextResponse } from "next/server";
import { DbConnection } from "@/lib/db.connection";
import sendmail from "@/lib/email";
import bcrypt from "bcrypt"

export async function POST(req:Request){
    let step = "starting registration";

    try {
        step = "connecting to database";
        await DbConnection();

        step = "reading request body";
        const {username,email,password}=await req.json()
        if(!username||!email||!password){
            return NextResponse.json({message:"Cant find username or email or password"})
        }

        step = "checking existing user";
        const finduser=await userSchema.findOne({email:email})
        if(finduser && finduser.verified){
            return NextResponse.json({message:"User already exists"})
        }
        if(finduser && !finduser.verified){
        const hashpassword=await bcrypt.hash(password,10)
        if(!hashpassword){
            return NextResponse.json({message:"Cant hash the password"})
        }
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
            finduser.username=username
            finduser.password=hashpassword
            finduser.otp=otp
            finduser.otpexpiry=otpExpiresAt
            
            await sendmail(email, otp);

        }

        step = "generating OTP";
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

        step = "hashing password";
        const hashpassword=await bcrypt.hash(password,10)
        if(!hashpassword){
            return NextResponse.json({message:"Cant hash the password"})
        }

        step = "creating user";
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

        step = "sending OTP email";
        await sendmail(email, otp);

        return NextResponse.json({message:"User created successfully"})
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorName = error instanceof Error ? error.name : "UnknownError";

        console.error("[REGISTER] Registration failed", {
            step,
            errorName,
            errorMessage,
            error
        });

        return NextResponse.json({
            message: "Registration failed",
            step,
            error: errorMessage,
            errorName
        }, {status:500})
    }
}
