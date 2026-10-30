import { timingSafeEqual } from "node:crypto";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";
import LoginHandoff from "@/app/schema/login-handoff.schema";
import { DbConnection } from "@/lib/db.connection";

function hasValidServerAuthorization(request: NextRequest) {
  const expected = process.env.DASHBOARD_HANDOFF_SECRET;
  const authorization = request.headers.get("authorization");
  if (!expected || !authorization?.startsWith("Bearer ")) return false;

  const supplied = authorization.slice("Bearer ".length);
  if (supplied.length !== expected.length) return false;

  return timingSafeEqual(Buffer.from(supplied), Buffer.from(expected));
}

export async function POST(request: NextRequest) {
  if (!hasValidServerAuthorization(request)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.DASHBOARD_HANDOFF_SECRET) {
    return NextResponse.json({ message: "Handoff authentication is not configured" }, { status: 500 });
  }

  try {
    const { handoffCode } = await request.json();
    if (typeof handoffCode !== "string" || !handoffCode) {
      return NextResponse.json({ message: "Missing handoff code" }, { status: 400 });
    }

    const payload = jwt.verify(
      handoffCode,
      process.env.DASHBOARD_HANDOFF_SECRET,
      { algorithms: ["HS256"] }
    ) as jwt.JwtPayload;

    if (
      payload.purpose !== "dashboard-login" ||
      typeof payload.userId !== "string" ||
      typeof payload.jti !== "string"
    ) {
      return NextResponse.json({ message: "Invalid handoff" }, { status: 401 });
    }

    await DbConnection();

    // Atomically consume the record so the handoff cannot be replayed.
    const consumed = await LoginHandoff.findOneAndDelete({
      jti: payload.jti,
      userId: payload.userId,
      expiresAt: { $gt: new Date() },
    }).lean();

    if (!consumed) {
      return NextResponse.json({ message: "Handoff expired or already used" }, { status: 401 });
    }

    return NextResponse.json({ userId: payload.userId });
  } catch (error) {
    if (
      error instanceof Error &&
      ["TokenExpiredError", "JsonWebTokenError", "NotBeforeError"].includes(error.name)
    ) {
      return NextResponse.json({ message: "Invalid or expired handoff" }, { status: 401 });
    }

    console.error("[HANDOFF] Redemption failed:", error);
    return NextResponse.json({ message: "Unable to redeem handoff" }, { status: 500 });
  }
}
