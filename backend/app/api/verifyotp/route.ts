import User from "@/app/schema/user.schema";
import { NextResponse } from "next/server";

export async function POST(req:Request){
    const {email,otp}=await req.json()
    if(!email||!otp){
        return NextResponse.json({message:"Cant find email or otp"})
    }
    const finduser=await User.findOne({email:email})
    if(!finduser){
        return NextResponse.json({message:"Cant find user"})
    }
    if(!finduser.otpexpiry||finduser.otpexpiry < new Date()){
        return NextResponse.json({message:"OTP expired"})
    }

    if(finduser && finduser.verified){
        return NextResponse.json({message:"User already verified"})
    }
    if(finduser.otp!==otp){
        return NextResponse.json({message:"Invalid OTP"})
    }
    finduser.verified=true
    await finduser.save()
    return NextResponse.json({message:"User verified successfully"})
}