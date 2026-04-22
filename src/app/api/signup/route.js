import { db } from "@/utils/mysql";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const [existing] = await db.execute(
      "SELECT email FROM userinfo WHERE email = ?",
      [normalizedEmail]
    );

    if (existing.length > 0) {
      return NextResponse.json(
        { message: "An account with this email already exists" },
        { status: 409 }
      );
    }

    await db.execute(
      "INSERT INTO userinfo (name, email, password) VALUES (?, ?, ?)",
      [name.trim(), normalizedEmail, password]
    );

    return NextResponse.json(
      { message: "User registered successfully!" },
      { status: 201 }
    );
  } catch (err) {
    console.error("Signup error:", err);
    return NextResponse.json(
      { message: "Database error", error: err.message },
      { status: 500 }
    );
  }
}