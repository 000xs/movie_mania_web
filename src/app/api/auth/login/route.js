import { NextResponse } from "next/server";
import { compare } from "bcryptjs";
import jwt from "jsonwebtoken";
import { getNativeDB } from "@/lib/db";

const JWT_SECRET = process.env.JWT_SECRET || "change-me";

export async function POST(req) {
  const { email, password } = await req.json();
  const db = await getNativeDB();
  const user = await db.collection("users").findOne({ email: email.toLowerCase() });

  if (!user || !(await compare(password, user.password)))
    return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });

  const token = jwt.sign({ sub: user._id.toString(), email: user.email }, JWT_SECRET, { expiresIn: "7d" });

  const res = NextResponse.json({ message: "Logged in" });
  res.cookies.set("access", token, { httpOnly: true, path: "/", maxAge: 60 * 60 * 24 * 7, sameSite: "lax", secure: process.env.NODE_ENV === "production" });
  return res;
}