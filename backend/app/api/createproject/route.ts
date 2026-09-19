import Project from "@/app/schema/project.schema";
import User from "@/app/schema/user.schema";
import { DbConnection } from "@/lib/db.connection";
import { getCurrentUser } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";

export async function POST(req: NextRequest) {
  let step = "starting";

  try {
    step = "connecting to database";
    await DbConnection();

    step = "reading current user";
    const { userId } = await getCurrentUser(req);
    console.log("[CREATE PROJECT] Current user:", userId);

    step = "reading request body";
    const { name } = await req.json();
    console.log("[CREATE PROJECT] Project name:", name);

    if (!userId || !name) {
      throw new Error("Missing user id or project name");
    }

    step = "finding user";
    const finduser = await User.findById(userId);

    if (!finduser || finduser.verified === false) {
      throw new Error("User not found or not verified");
    }

    step = "generating API key";
    const apiKey = "tf_live_" + crypto.randomBytes(32).toString("hex");

    step = "hashing API key";
    const apiKeyHash = crypto
      .createHash("sha256")
      .update(apiKey)
      .digest("hex");

    step = "creating project";
    const newproject = await Project.create({
      ownerId: finduser._id,
      name,
      apiKey: apiKeyHash,
    });

    if (!newproject) {
      throw new Error("Project creation returned no document");
    }

    console.log("[CREATE PROJECT] Project created:", newproject._id);

    return NextResponse.json({
      status: 200,
      apiKey: newproject.apiKey,
    });
  } catch (error) {
    console.error("[CREATE PROJECT] Failed:", {
      step,
      errorName: error instanceof Error ? error.name : "UnknownError",
      errorMessage: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      {
        status: 500,
        message: "Failed to create project",
        step,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
