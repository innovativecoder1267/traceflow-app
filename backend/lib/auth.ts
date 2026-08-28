// lib/auth.ts
import jwt from "jsonwebtoken"
import { NextRequest } from "next/server";
export async function getCurrentUser(request: NextRequest) {
  const token = request.cookies.get("accessToken")?.value;
  console.log("Token from cookies:", token); // Log the token for debugging
  if (!token) {
    throw new Error("Unauthorized");
  }

  const payload = jwt.verify(token, process.env.JWT_SECRET!) as {
    userId: string;
  };

  return payload;
}