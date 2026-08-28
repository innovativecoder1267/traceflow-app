import { NextRequest, NextResponse } from "next/server";
import Trace from "@/app/schema/trace.schema";
import { DbConnection } from "@/lib/db.connection";

export async function GET(req: NextRequest) {
  try {
    await DbConnection();

    const projectId = req.nextUrl.searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json(
        { message: "Project ID is required" },
        { status: 400 }
      );
    }

    const traces = await Trace.find({ projectId })
      .sort({ startedAt: -1 })
      .lean();

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