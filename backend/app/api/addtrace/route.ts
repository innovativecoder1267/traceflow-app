
import Trace from "@/app/schema/trace.schema";
import { DbConnection } from "@/lib/db.connection";
import Project from "@/app/schema/project.schema";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await DbConnection();

    const { trace } = await req.json();
    const authorization = req.headers.get("authorization");

    if (!authorization) {
      return NextResponse.json(
        { message: "Authorization header missing" },
        { status: 401 }
      );
    }

    const [scheme, apikey] = authorization.split(" ");

    if (scheme !== "Bearer" || !apikey) {
      return NextResponse.json(
        { message: "Invalid authorization format" },
        { status: 401 }
      );
    }

    if (!trace || !Array.isArray(trace.spans)) {
      return NextResponse.json(
        { message: "Trace and spans array are required" },
        { status: 400 }
      );
    }

    const project = await Project.findOne({
      apiKey: apikey,
      status: "ACTIVE",
    });

    if (!project) {
      return NextResponse.json(
        { message: "Invalid API key or inactive project" },
        { status: 401 }
      );
    }

    const newTrace = await Trace.create({
      id: trace.id,
      projectId: project._id,
      userId: project.ownerId,

      method: trace.method,
      path: trace.path,
      statusCode: trace.statusCode,

      startedAt: trace.startedAt
        ? new Date(trace.startedAt)
        : undefined,

      endedAt: trace.endedAt
        ? new Date(trace.endedAt)
        : undefined,

      duration: trace.duration,

      spans: trace.spans.map((span: any) => ({
        name: span.name,
        startedAt: span.startedAt
          ? new Date(span.startedAt)
          : undefined,
        endedAt: span.endedAt
          ? new Date(span.endedAt)
          : undefined,
        duration: span.duration,
        status: span.status,
        metadata: span.metadata ?? {},
      })),
    });

    return NextResponse.json(
      {
        message: "Trace added successfully",
        traceobj: newTrace,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Add trace error:", error);

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
