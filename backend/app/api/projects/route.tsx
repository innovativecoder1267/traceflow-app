import Project from "@/app/schema/project.schema"; 
import { getCurrentUser } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { DbConnection } from "@/lib/db.connection";
export async function GET(req:NextRequest){
    await DbConnection();
    const {userId}=await getCurrentUser(req)
    const findprojects=await Project.find({ownerId:userId})
     if(!findprojects){
   return NextResponse.json({
        status:402,
        message:"User not found"
    })    }
    return NextResponse.json({
        status:200,
        data:findprojects
    })
}