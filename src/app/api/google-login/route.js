import { db } from "@/utils/mysql";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, email, googleId } = body;

    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const [rows] = await db.execute(
      "SELECT * FROM userinfo WHERE email = ?",
      [normalizedEmail]
    );

    let userId;
    let userName = name || "Google User";

    if (rows.length > 0) {
      userId = rows[0].id;
      userName = rows[0].name || userName;

      if (!rows[0].google_id && googleId) {
        await db.execute(
          "UPDATE userinfo SET google_id = ? WHERE email = ?",
          [googleId, normalizedEmail]
        );
      }
    } else {
      const [result] = await db.execute(
        "INSERT INTO userinfo (name, email, google_id) VALUES (?, ?, ?)",
        [userName, normalizedEmail, googleId || null]
      );
      userId = result.insertId;
    }

    const token = jwt.sign(
      { id: userId, name: userName, email: normalizedEmail },
      process.env.JWT_SECRET || "default_secret",
      { expiresIn: "1h" }
    );

    return NextResponse.json(
      {
        message: rows.length > 0 ? "Login successful!" : "User registered via Google!",
        token,
        user: {
          id: userId,
          name: userName,
          email: normalizedEmail,
        },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("GOOGLE LOGIN ERROR:", err);
    return NextResponse.json(
      { message: "Database error", error: err.message },
      { status: 500 }
    );
  }
}