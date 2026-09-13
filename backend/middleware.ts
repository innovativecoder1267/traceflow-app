import { NextRequest, NextResponse } from "next/server";

const allowedOrigins = new Set([
  "https://traceflow-1qwaq4rml-innovativecoder1267s-projects.vercel.app",
  "https://traceflow-rdlnkcxkc-innovativecoder1267s-projects.vercel.app",
]);

export function middleware(request: NextRequest) {
  const origin = request.headers.get("origin");

  if (!origin || !allowedOrigins.has(origin)) {
    return NextResponse.next();
  }

  const corsHeaders = {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Vary": "Origin",
  };

  if (request.method === "OPTIONS") {
    return new NextResponse(null, { status: 204, headers: corsHeaders });
  }

  const response = NextResponse.next();
  Object.entries(corsHeaders).forEach(([key, value]) => response.headers.set(key, value));
  return response;
}

export const config = {
  matcher: "/api/:path*",
};
