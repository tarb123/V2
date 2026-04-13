// import mysql from "mysql2/promise";
// import { NextResponse } from "next/server";

// export async function POST(req) {
//   try {
//     const { name, email, password } = await req.json();

//     const db = await mysql.createConnection({
//       host: process.env.DB_HOST,
//       user: process.env.DB_USER,
//       password: process.env.DB_PASS,
//       database: process.env.DB_NAME,
//       port: process.env.DB_PORT || 3306,
//     });

//     await db.execute(
//       "INSERT INTO userinfo (name, email, password) VALUES (?, ?, ?)",
//       [name, email, password]
//     );

//     return NextResponse.json(
//       { message: "User registered successfully!" },
//       { status: 201 }
//     );
//   } catch (err) {
//     console.error("❌ Signup error:", err);
//     return NextResponse.json(
//       { message: "Database error" },
//       { status: 500 }
//     );
//   }
// }