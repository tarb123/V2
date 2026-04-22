import { db } from "@/utils/mysql";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);

export async function POST(req) {
  try {
    const body = await req.json();
    const { credential } = body;

    if (!credential) {
      return NextResponse.json(
        { message: "Google credential is required" },
        { status: 400 }
      );
    }

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload || !payload.email) {
      return NextResponse.json(
        { message: "Unable to get Google user email" },
        { status: 400 }
      );
    }

    const name = payload.name || "Google User";
    const email = String(payload.email).trim().toLowerCase();
    const googleId = payload.sub;

    const [rows] = await db.execute(
      "SELECT * FROM userinfo WHERE email = ?",
      [email]
    );

    let userId;
    let userName = name;

    if (rows.length > 0) {
      userId = rows[0].id;
      userName = rows[0].name || name;

      if (!rows[0].google_id && googleId) {
        await db.execute(
          "UPDATE userinfo SET google_id = ? WHERE email = ?",
          [googleId, email]
        );
      }
    } else {
      const [result] = await db.execute(
        "INSERT INTO userinfo (name, email, google_id) VALUES (?, ?, ?)",
        [name, email, googleId]
      );
      userId = result.insertId;
    }

    const token = jwt.sign(
      { id: userId, name: userName, email },
      process.env.JWT_SECRET || "default_secret",
      { expiresIn: "1h" }
    );

    return NextResponse.json(
      {
        message: rows.length > 0
          ? "Login successful!"
          : "User registered via Google!",
        token,
        user: {
          id: userId,
          name: userName,
          email,
        },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("GOOGLE LOGIN ERROR:", err);
    return NextResponse.json(
      { message: "Google login failed", error: err.message },
      { status: 500 }
    );
  }
}