import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  response.headers.set(
    "Access-Control-Allow-Origin",
    "http://localhost:3000"
  );

  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );

  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );

  if (request.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 204,
      headers: response.headers,
    }); 
  }
  console.log("Headers are ",response.headers)

  return response;
}

export const config = {
  matcher: ["/api/:path*"],
};