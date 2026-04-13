// import mysql from "mysql2/promise";
// import jwt from "jsonwebtoken";
// import { NextResponse } from "next/server";

// export async function POST(req) {
//   try {
//     const { name, password } = await req.json();

//     const db = await mysql.createConnection({
//       host: process.env.DB_HOST,
//       user: process.env.DB_USER,
//       password: process.env.DB_PASS,
//       database: process.env.DB_NAME,
//       port: process.env.DB_PORT || 3306,
//     });

//     const [rows] = await db.execute("SELECT * FROM userinfo WHERE name = ?", [name]);
//     if (rows.length === 0) {
//       return NextResponse.json({ message: "User not found" }, { status: 404 });
//     }

//     const user = rows[0];
//     if (user.password !== password) {
//       return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
//     }

//     const token = jwt.sign({ id: user.id, name: user.name }, process.env.JWT_SECRET, {
//       expiresIn: "1h",
//     });

//     return NextResponse.json({ message: "Login successful!", token }, { status: 200 });
//   } catch (err) {
//     console.error("❌ Database error:", err);
//     return NextResponse.json({ message: "Database error" }, { status: 500 });
//   }
// }