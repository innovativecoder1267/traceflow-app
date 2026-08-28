import Project from "@/app/schema/project.schema";
import User from "@/app/schema/user.schema";
import { DbConnection } from "@/lib/db.connection";
import { getCurrentUser } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";

export async function POST(req:NextRequest){
    await DbConnection()
    const {userId}=await getCurrentUser(req);
    const {name}=await req.json()
     if(!userId||!name){
        throw new Error("Cant find user id or project name")
    }
    const finduser=await User.findById(userId)
    if(!finduser||finduser.verified==false){
        throw new Error("Cant find user")
    }
   const apiKey ="tf_live_" + crypto.randomBytes(32).toString("hex"); 
   
   const apiKeyHash = crypto
  .createHash("sha256")
  .update(apiKey)
  .digest("hex");
   
   const newproject=await Project.create({
        ownerId:finduser._id,
        name:name,
        apiKey:apiKeyHash
    })
    if(!newproject){
        throw new Error("Cant create the project")
    }
return NextResponse.json({
  status: 200,
  apiKey: newproject.apiKey,
});
}