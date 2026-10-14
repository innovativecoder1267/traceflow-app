import Trace from "@/app/schema/trace.schema";
import { DbConnection } from "@/lib/db.connection";
import Project from "@/app/schema/project.schema";
import { NextRequest } from "next/server";
 export async function POST(req:NextRequest){
    await DbConnection()
     const {trace}=await req.json();
     const apikey=req.headers.get("authorization")
     console.log("Api Key is",apikey)
    if(!trace||!apikey){
        throw new Error("Cant find trace or apikey") 
    }

    const validateapikey=await Project.findOne({apikey},{
        status:"ACTIVE"
    })
    if(!validateapikey){
        throw new Error("Api key not found")
    }
 
   const userId=validateapikey.ownerId
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
