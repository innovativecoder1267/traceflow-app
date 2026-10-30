import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function proxy(request: NextRequest) {
  const token = request.cookies.get("dashboardSession")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const secretValue = process.env.DASHBOARD_JWT_SECRET;

  if (!secretValue) {
    console.error("[DASHBOARD PROXY] DASHBOARD_JWT_SECRET is not configured");
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const secret = new TextEncoder().encode(secretValue);
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ["HS256"],
    });

    if (
      payload.purpose !== "dashboard-session" ||
      typeof payload.userId !== "string"
    ) {
      throw new Error("Invalid dashboard session claims");
    }

    return NextResponse.next();
  } catch {
    const response = NextResponse.redirect(
      new URL("/login", request.url)
    );

    response.cookies.set("dashboardSession", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
      expires: new Date(0),
    });

    return response;
  }
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
