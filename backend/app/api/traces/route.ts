import { NextRequest, NextResponse } from "next/server";
import Trace from "@/app/schema/trace.schema";
import { DbConnection } from "@/lib/db.connection";

export async function GET(req: NextRequest) {
  let step = "starting";

  try {
    console.log("[TRACES] ===== GET /api/traces started =====");

    step = "connecting to database";
    console.log("[TRACES] Step 1: connecting to database");
    await DbConnection();
    console.log("[TRACES] Step 1: database connection successful");

    step = "reading projectId";
    console.log("[TRACES] Step 2: reading projectId");
    const projectId = req.nextUrl.searchParams.get("projectId");
    console.log("[TRACES] projectId:", projectId);

    if (!projectId) {
      console.error("[TRACES] Missing projectId in request");
      return NextResponse.json(
        { message: "Project ID is required", step },
        { status: 400 }
      );
    }

    step = "fetching traces";
    console.log("[TRACES] Step 3: fetching traces for project:", projectId);
    const traces = await Trace.find({ projectId :_id })
      .sort({ startedAt: -1 })
      .lean();

    console.log("[TRACES] Step 3: traces fetched successfully:", traces.length);
    console.log("[TRACES] ===== GET /api/traces completed =====");

    return NextResponse.json(
      { traces },
      { status: 200 }
    );
  } catch (error) {
    console.error("[TRACES] ===== GET /api/traces FAILED =====");
    console.error("[TRACES] Failed step:", step);
    console.error("[TRACES] Error name:", error instanceof Error ? error.name : "UnknownError");
    console.error("[TRACES] Error message:", error instanceof Error ? error.message : String(error));
    console.error("[TRACES] Error stack:", error instanceof Error ? error.stack : "No stack available");
    console.error("[TRACES] Project ID:", req.nextUrl.searchParams.get("projectId"));
    console.error("[TRACES] Full error:", error);

    return NextResponse.json(
      {
        message: "Failed to fetch traces",
        step,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
