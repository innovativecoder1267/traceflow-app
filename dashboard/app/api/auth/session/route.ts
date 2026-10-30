import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";

const SESSION_TTL_SECONDS = 3 * 24 * 60 * 60;

export async function POST(request: NextRequest) {
  // This endpoint is intended to be called by the dashboard origin only.
  if (request.headers.get("origin") !== request.nextUrl.origin) {
    return NextResponse.json(
      { message: "Invalid request origin" },
      { status: 403 }
    );
  }

  const handoffSecret = process.env.DASHBOARD_HANDOFF_SECRET;
  const dashboardSecret = process.env.DASHBOARD_JWT_SECRET;
  const backendUrl = process.env.BACKEND_URL;

  if (!handoffSecret || !dashboardSecret || !backendUrl) {
    console.error("[DASHBOARD SESSION] Missing server environment configuration");
    return NextResponse.json(
      { message: "Dashboard authentication is not configured" },
      { status: 500 }
    );
  }

  try {
    const { handoffCode } = await request.json();

    if (typeof handoffCode !== "string" || !handoffCode) {
      return NextResponse.json(
        { message: "Missing handoff code" },
        { status: 400 }
      );
    }

    const backendResponse = await fetch(
      new URL("/api/auth/redeem-handoff", backendUrl),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${handoffSecret}`,
        },
        body: JSON.stringify({ handoffCode }),
        cache: "no-store",
      }
    );

    if (!backendResponse.ok) {
      return NextResponse.json(
        { message: "Unable to establish dashboard session" },
        { status: 401 }
      );
    }

    const result = (await backendResponse.json()) as { userId?: unknown };

    if (typeof result.userId !== "string" || !result.userId) {
      return NextResponse.json(
        { message: "Invalid identity response" },
        { status: 502 }
      );
    }

    const secret = new TextEncoder().encode(dashboardSecret);
    const dashboardToken = await new SignJWT({
      userId: result.userId,
      purpose: "dashboard-session",
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("3d")
      .sign(secret);

    const response = NextResponse.json({
      message: "Dashboard session created",
    });

    response.cookies.set("dashboardSession", dashboardToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_TTL_SECONDS,
    });

    return response;
  } catch (error) {
    console.error("[DASHBOARD SESSION] Creation failed:", error);
    return NextResponse.json(
      { message: "Unable to create dashboard session" },
      { status: 500 }
    );
  }
}
