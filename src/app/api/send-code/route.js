import { db } from "@/utils/mysql";
import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const EMAIL_USER = process.env.EMAIL_USER;
    const EMAIL_PASS = process.env.EMAIL_PASS;
    const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

    if (!EMAIL_USER || !EMAIL_PASS) {
      return NextResponse.json(
        { message: "Email configuration is missing" },
        { status: 500 }
      );
    }

    const [rows] = await db.execute(
      "SELECT email FROM userinfo WHERE email = ?",
      [normalizedEmail]
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000);

    const resetLink = `${BASE_URL}/ResetPassword?email=${encodeURIComponent(
      normalizedEmail
    )}`;

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Support" <${EMAIL_USER}>`,
      to: normalizedEmail,
      subject: "Password Reset Code",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6;">
          <h2>Password Reset Code</h2>
          <p>Hello,</p>
          <p>Your password reset code is:</p>
          <h1 style="letter-spacing: 4px; color: #dc2626;">${code}</h1>
          <p>This code expires in 10 minutes.</p>
          <p style="margin-top: 20px;">Open reset page:</p>
          <a
            href="${resetLink}"
            style="
              display: inline-block;
              padding: 12px 20px;
              background-color: #dc2626;
              color: #ffffff;
              text-decoration: none;
              border-radius: 8px;
              font-weight: bold;
              margin-top: 10px;
            "
          >
            Open Reset Password Page
          </a>
        </div>
      `,
    });

    await db.execute(
      "UPDATE userinfo SET reset_code = ?, reset_code_expiry = ? WHERE email = ?",
      [code, expiry, normalizedEmail]
    );

    return NextResponse.json(
      { message: "Code sent successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.error("SEND CODE ERROR:", err);
    return NextResponse.json(
      { message: "Failed to send code", error: err.message },
      { status: 500 }
    );
  }
}