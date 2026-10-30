import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  if (request.headers.get("origin") !== request.nextUrl.origin) {
    return NextResponse.json(
      { message: "Invalid request origin" },
      { status: 403 }
    );
  }

  const response = NextResponse.json({
    message: "Dashboard session cleared",
  });

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
