import userSchema from "@/app/schema/user.schema";
import LoginHandoff from "@/app/schema/login-handoff.schema";
import { DbConnection } from "@/lib/db.connection";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { randomUUID } from "node:crypto";

export async function POST(req: Request) {
  try {
    await DbConnection();

    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Cant find email or password" }, { status: 400 });
    }

    const finduser = await userSchema.findOne({ email });
    if (!finduser) {
      return NextResponse.json({ error: "Cant find user" }, { status: 401 });
    }

    if (!finduser.verified) {
      return NextResponse.json(
        { error: "Please verify your email first" },
        { status: 403 }
      );
    }

    const ispasswordcorrect = await bcrypt.compare(password, finduser.password);
    if (!ispasswordcorrect) {
      return NextResponse.json({ error: "Password doesnt matched" }, { status: 401 });
    }

    // Existing backend JWT: same payload, secret, expiry and cookie behaviour.
    const token = jwt.sign(
      { userId: finduser._id },
      process.env.JWT_SECRET!,
      { expiresIn: "3d" }
    );

    const handoffSecret = process.env.DASHBOARD_HANDOFF_SECRET;
    if (!handoffSecret) {
      console.error("[LOGIN] DASHBOARD_HANDOFF_SECRET is not configured");
      return NextResponse.json(
        { error: "Dashboard login is temporarily unavailable" },
        { status: 500 }
      );
    }

    const jti = randomUUID();
    const handoffExpiresAt = new Date(Date.now() + 60 * 1000);
    const handoffCode = jwt.sign(
      {
        userId: finduser._id.toString(),
        purpose: "dashboard-login",
        jti,
      },
      handoffSecret,
      { expiresIn: "60s", algorithm: "HS256" }
    );

    await LoginHandoff.create({
      jti,
      userId: finduser._id.toString(),
      expiresAt: handoffExpiresAt,
    });

    const response = NextResponse.json({
      message: "Login successful",
      handoffCode,
    });

    response.cookies.set("accessToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("[LOGIN] Login failed:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
