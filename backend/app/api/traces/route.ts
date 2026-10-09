import { NextRequest, NextResponse } from "next/server";
import Trace from "@/app/schema/trace.schema";
import { DbConnection } from "@/lib/db.connection";

export async function GET(req: NextRequest) {
  try {
    await DbConnection();

    const projectId = req.nextUrl.searchParams.get("projectId");

 

    const traces = await Trace.findOne({projectId})
      .sort({ startedAt: -1 })
      .lean();
   if (!projectId) {
      return NextResponse.json(
        { message: "Project ID is required" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      {
        traces,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to fetch traces:", error);

    return NextResponse.json(
      { message: "Failed to fetch traces" },
      { status: 500 }
    );
  }
}
