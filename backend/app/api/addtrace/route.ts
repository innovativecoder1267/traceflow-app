import Trace from "@/app/schema/trace.schema";
import { DbConnection } from "@/lib/db.connection";
export async function POST(req:Request){
    await DbConnection()
    await Trace.syncIndexes();
    const {trace}=await req.json();
    if(!trace){
        throw new Error("Cant find trace") 
    }
    console.log("Trace is",trace)
    const newtrace=await Trace.create(trace)
    if(!newtrace){
        throw new Error("Cant create the trace")
    }
    return new Response(JSON.stringify({
        status:200,
        message:"Trace added successfully"
    }))
}