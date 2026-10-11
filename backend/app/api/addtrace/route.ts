import Trace from "@/app/schema/trace.schema";
import { DbConnection } from "@/lib/db.connection";
import Project from "@/app/schema/project.schema";
import { NextRequest } from "next/server";
export async function POST(req:NextRequest){
    await DbConnection()

    const {trace}=await req.json()
    if(!trace){
        throw new Error("Cant find trace") 
    }
 const project = await Project.findOne({ ownerId:trace.userId });

    if (!project) {
    throw new Error("Project not found");
   }
    const newtrace=await Trace.create(trace)
    if(!newtrace){
        throw new Error("Cant create the trace")
    }
    return new Response(JSON.stringify({
        status:200,
        message:"Trace added successfully"
    }))
}
