import projectSchema from "@/app/schema/project.schema";
import { NextResponse } from "next/server";
import { DbConnection } from "@/lib/db.connection";
export async function POST(req:Request) {
    await DbConnection();
    const {apiKey}=await req.json()

    if(!apiKey){
        return NextResponse.json("Api key not found")
    }

    const verifyUserApiKey=await projectSchema.findOne({apiKey:apiKey})
    if(!verifyUserApiKey){
        return NextResponse.json("Api key of user not found  ")
    }
    //if api key found then send the response to the user its authenticated 
    //update verify api key state 
    verifyUserApiKey.status="ACTIVE"
    await verifyUserApiKey.save();
    console.log("Api key authenticated successfully",verifyUserApiKey)
    return NextResponse.json({message:"Api key authenticated successfully ",verifyUserApiKey})
}