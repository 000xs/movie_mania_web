import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import jwt from "jsonwebtoken";
 

const JWT_SECRET = process.env.JWT_SECRET || "change-me";

export async function POST(req) {
  const { email, password } = await req.json();
  if (!email || !password)
    return NextResponse.json({ message: "Missing fields" }, { status: 400 });

  const db = await getDB();
  const exists = await db.collection("users").findOne({ email: email.toLowerCase() });
  if (exists)
    return NextResponse.json({ message: "Email already registered" }, { status: 409 });

  const hashed = await hash(password, 12);
  const { insertedId } = await db.collection("users").insertOne({ email: email.toLowerCase(), password: hashed });

  const token = jwt.sign({ sub: insertedId.toString(), email }, JWT_SECRET, { expiresIn: "7d" });
  const res = NextResponse.json({ message: "User created" }, { status: 201 });
  res.cookies.set("access", token, { httpOnly: true, path: "/", maxAge: 60 * 60 * 24 * 7, sameSite: "lax", secure: process.env.NODE_ENV === "production" });
  return res;
}