import User from "@/app/schema/user.schema";
import { getCurrentUser } from "@/lib/auth";
import { DbConnection } from "@/lib/db.connection";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await getCurrentUser(request);

    await DbConnection();

    const user = await User.findById(userId).select("subscription").lean();

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const subscription = user.subscription === "premium" ? "premium" : "free";

    return NextResponse.json({ subscription }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";

    if (
      message === "Unauthorized" ||
      error instanceof Error && error.name === "JsonWebTokenError" ||
      error instanceof Error && error.name === "TokenExpiredError"
    ) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    console.error("[SUBSCRIPTION] Failed to fetch subscription status:", error);
    return NextResponse.json(
      { message: "Failed to fetch subscription status" },
      { status: 500 }
    );
  }
}
