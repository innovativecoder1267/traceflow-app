import User from "@/app/schema/user.schema";
import { getCurrentUser } from "@/lib/auth";
import { DbConnection } from "@/lib/db.connection";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await getCurrentUser(request);
    await DbConnection();

    const user = await User.findById(userId)
      .select("username email verified subscription createdAt")
      .lean();

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        username: user.username,
        email: user.email,
        verified: Boolean(user.verified),
        subscription: user.subscription === "premium" ? "premium" : "free",
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    const invalidToken =
      error instanceof Error &&
      (error.message === "Unauthorized" ||
        error.name === "JsonWebTokenError" ||
        error.name === "TokenExpiredError");

    if (invalidToken) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    console.error("[ACCOUNT] Failed to fetch account:", error);
    return NextResponse.json(
      { message: "Failed to fetch account" },
      { status: 500 }
    );
  }
}
