import mysql from "mysql2/promise";
import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

export async function POST(req) {
  let db;

  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      );
    }

    const EMAIL_USER = process.env.EMAIL_USER;
    const EMAIL_PASS = process.env.EMAIL_PASS;
    const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

    if (!EMAIL_USER || !EMAIL_PASS) {
      return NextResponse.json(
        { message: "Email configuration is missing" },
        { status: 500 }
      );
    }

    db = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      port: Number(process.env.DB_PORT) || 3306,
    });

    const [rows] = await db.execute(
      "SELECT email FROM userinfo WHERE email = ?",
      [email]
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000);

    const resetLink = `${BASE_URL}/ResetPassword?email=${encodeURIComponent(email)}`;

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
    });

    await transporter.verify();

    await transporter.sendMail({
      from: `"Support" <${EMAIL_USER}>`,
      to: email,
      subject: "Password Reset Code",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6;">
          <h2>Password Reset Code</h2>
          <p>Hello,</p>
          <p>Your password reset code is:</p>
          <h1 style="letter-spacing: 4px; color: #dc2626;">${code}</h1>
          <p>This code expires in 10 minutes.</p>

          <p style="margin-top: 20px;">
            You can also click the button below to open the reset password page:
          </p>

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

          <p style="margin-top: 20px; font-size: 14px; color: #555;">
            If the button does not work, copy and open this link:
          </p>
          <p style="font-size: 14px;">
            <a href="${resetLink}">${resetLink}</a>
          </p>
        </div>
      `,
    });

    await db.execute(
      "UPDATE userinfo SET reset_code = ?, reset_code_expiry = ? WHERE email = ?",
      [code, expiry, email]
    );

    return NextResponse.json(
      { message: "Code sent successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.error("SEND CODE ERROR:", err);
    return NextResponse.json(
      {
        message: "Failed to send code",
        error: err.message,
      },
      { status: 500 }
    );
  } finally {
    if (db) await db.end();
  }
}