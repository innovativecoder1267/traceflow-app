import Project from "@/app/schema/project.schema";
import { NextRequest, NextResponse } from "next/server";
import { DbConnection } from "@/lib/db.connection";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log("Fetch Project route hit");
  console.log("Cookies:", req.cookies.getAll());

  await DbConnection();

  const { userId } = await getCurrentUser(req);

  const { id } = await params;

  const findproject = await Project.findOne({
    _id: id,
    ownerId: userId,
  });

  if (!findproject) {
    return NextResponse.json(
      {
        status: 404,
        message: "Project not found",
      },
      { status: 404 }
    );
  }

  return NextResponse.json(
    {
      status: 200,
      data: findproject,
    },
    { status: 200 }
  );
}