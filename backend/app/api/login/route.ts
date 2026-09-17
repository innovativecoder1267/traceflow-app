import userSchema from "@/app/schema/user.schema";
import { DbConnection } from "@/lib/db.connection";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  try {
    console.log("[LOGIN] Request received");
    await DbConnection();
    console.log("[LOGIN] Database connected");

    const { email, password } = await req.json();
    console.log("[LOGIN] Credentials received for:", email);

    if (!email || !password) {
      console.log("[LOGIN] Missing email or password");
      return NextResponse.json({ error: "Cant find email or password" }, { status: 400 });
    }

    const finduser = await userSchema.findOne({ email });
    console.log("[LOGIN] User found:", !!finduser);

    if (!finduser) {
      return NextResponse.json({ error: "Cant find user" }, { status: 401 });
    }

    if (!finduser.verified) {
      console.log("[LOGIN] User email is not verified");
      return NextResponse.json(
        { error: "Please verify your email first" },
        { status: 403 }
      );
    }

    const ispasswordcorrect = await bcrypt.compare(password, finduser.password);
    console.log("[LOGIN] Password matched:", ispasswordcorrect);

    if (!ispasswordcorrect) {
      return NextResponse.json({ error: "Password doesnt matched" }, { status: 401 });
    }

    const token = jwt.sign(
      { userId: finduser._id },
      process.env.JWT_SECRET!,
      { expiresIn: "3d" }
    );
    console.log("[LOGIN] Token created:", !!token);

    const response = NextResponse.json({ message: "Login successful" });
    response.cookies.set("accessToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    console.log("[LOGIN] Login successful");
    return response;
  } catch (error) {
    console.error("[LOGIN] 500 ERROR:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
