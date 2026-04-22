import { db } from "@/utils/mysql";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { email, code, password } = await req.json();

    if (!email || !code || !password) {
      return NextResponse.json(
        { message: "Email, code, and password are required" },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const [rows] = await db.execute(
      "SELECT reset_code_expiry FROM userinfo WHERE email = ? AND reset_code = ?",
      [normalizedEmail, code]
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { message: "Invalid email or code" },
        { status: 400 }
      );
    }

    if (new Date(rows[0].reset_code_expiry) < new Date()) {
      return NextResponse.json(
        { message: "Reset code expired" },
        { status: 400 }
      );
    }

    await db.execute(
      "UPDATE userinfo SET password = ?, reset_code = NULL, reset_code_expiry = NULL WHERE email = ?",
      [password, normalizedEmail]
    );

    return NextResponse.json(
      { message: "Password reset successfully!" },
      { status: 200 }
    );
  } catch (err) {
    console.error("VERIFY CODE ERROR:", err);
    return NextResponse.json(
      { message: "Failed to update password", error: err.message },
      { status: 500 }
    );
  }
}