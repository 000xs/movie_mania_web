import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

export async function GET(req) {
  const token = req.cookies.get("access")?.value;
  if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const payload = verifyToken(token);
    return NextResponse.json({ user: payload });
  } catch {
    return NextResponse.json({ message: "Token invalid" }, { status: 401 });
  }
}