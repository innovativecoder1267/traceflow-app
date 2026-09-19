import { NextRequest, NextResponse } from "next/server";
import Trace from "@/app/schema/trace.schema";
import { DbConnection } from "@/lib/db.connection";

export async function GET(req: NextRequest) {
  let step = "starting";

  try {
    step = "connecting to database";
    await DbConnection();

    step = "reading projectId";
    const projectId = req.nextUrl.searchParams.get("projectId");
    console.log("[TRACES] projectId:", projectId);

    if (!projectId) {
      return NextResponse.json(
        { message: "Project ID is required", step },
        { status: 400 }
      );
    }

    step = "fetching traces";
    const traces = await Trace.find({ projectId })
      .sort({ startedAt: -1 })
      .lean();

    console.log("[TRACES] Traces fetched:", traces.length);

    return NextResponse.json(
      { traces },
      { status: 200 }
    );
  } catch (error) {
    console.error("[TRACES] Failed:", {
      step,
      errorName: error instanceof Error ? error.name : "UnknownError",
      errorMessage: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

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
