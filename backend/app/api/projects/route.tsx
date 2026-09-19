import Project from "@/app/schema/project.schema";
import { getCurrentUser } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { DbConnection } from "@/lib/db.connection";

export async function GET(req: NextRequest) {
  let step = "starting";

  try {
    step = "connecting to database";
    await DbConnection();

    step = "reading current user";
    const { userId } = await getCurrentUser(req);

    console.log("[PROJECTS] Current user:", userId);

    step = "fetching projects";
    const findprojects = await Project.find({ ownerId: userId });

    console.log("[PROJECTS] Projects fetched:", findprojects.length);

    return NextResponse.json({
      status: 200,
      data: findprojects,
    });
  } catch (error) {
    console.error("[PROJECTS] Failed:", {
      step,
      errorName: error instanceof Error ? error.name : "UnknownError",
      errorMessage: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      {
        status: 500,
        message: "Failed to fetch projects",
        step,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
