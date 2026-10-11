import Trace from "@/app/schema/trace.schema";
import { DbConnection } from "@/lib/db.connection";
import Project from "@/app/schema/project.schema";
import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
export async function POST(req:NextRequest){
    await DbConnection()
   const {userId}=await getCurrentUser(req)
    const {trace}=await req.json()
    if(!trace){
        throw new Error("Cant find trace") 
    }
 const project = await Project.findOne({ _id:trace.projectId });

    if (!project) {
    throw new Error("Project not found");
   }
     const newtrace = await Trace.create({
    ...trace,
    userId,
  });
    if(!newtrace){
        throw new Error("Cant create the trace")
    }
    return new Response(JSON.stringify({
        status:200,
        message:"Trace added successfully"
    }))
}
