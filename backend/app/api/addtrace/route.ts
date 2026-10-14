import Trace from "@/app/schema/trace.schema";
import { DbConnection } from "@/lib/db.connection";
import Project from "@/app/schema/project.schema";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await DbConnection();

    // 1. Get trace from request body
    const { trace } = await req.json();

    // 2. Get Authorization header
    const authorization = req.headers.get("authorization");

    if (!authorization) {
      return NextResponse.json(
        { message: "Authorization header missing" },
        { status: 401 }
      );
    }

    // 3. Extract Bearer token
    const [scheme, apikey] = authorization.split(" ");

    if (scheme !== "Bearer" || !apikey) {
      return NextResponse.json(
        { message: "Invalid authorization format" },
        { status: 401 }
      );
    }
    console.log("Api key is",apikey)

    // 4. Validate trace
    if (!trace) {
      return NextResponse.json(
        { message: "Trace is required" },
        { status: 400 }
      );
    }
 
    const validateapikey = await Project.findOne({
      apiKey: apikey,
      status: "ACTIVE",
    });


    if (!validateapikey) {
      return NextResponse.json(
        { message: "Invalid API key or inactive project" },
        { status: 401 }
      );
    }

    // 6. Get project owner
    const userId = validateapikey.ownerId;

    // 7. Create trace
    const newtrace = await Trace.create({
      ...trace,
      userId,
    });
    if(!newtrace){
       return NextResponse.json(
        { message: "Trace isnt getting created" },
        { status: 402 }
      );
    }
    // 8. Return response
    return NextResponse.json(
      {
        message: "Trace added successfully",
        traceId: .newtrace,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Add trace error:", error);

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
