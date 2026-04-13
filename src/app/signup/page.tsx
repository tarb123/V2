"use client";
import React, { useState, ChangeEvent, FormEvent } from "react";
import { CredentialResponse } from "@react-oauth/google";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import GoogleLoginButton from "../components/GoogleLoginButton";
const Signup: React.FC = () => {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  type AuthResponse = {
    token: string;
    message?: string;
  };
  
//   const handleSubmit = async (e: FormEvent) => {
//     e.preventDefault();
//     try {
// const response = await axios.post<AuthResponse>("/api/signup", formData);

//       if (response.data.token) {
//         localStorage.setItem("authToken", response.data.token);
//         setMessage("Signup successful!");
//         router.push("/FinancialOffer");
//       } else {
//         setMessage(response.data.message || "Signup failed");
//       }
//     } 
    
// catch (error: unknown) {
//   if (error instanceof Error) {
//     setMessage(error.message);
//   } else {
//     setMessage("Signup failed");
//   }
// }

//   };
const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();

  try {
    const response = await axios.post("/api/signup", {
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
    });

    setMessage("Signup successful!");
    router.push("/pgp");
  } catch (error: any) {
    setMessage(
      error?.response?.data?.message ||
        error?.message ||
        "Signup failed"
    );
  }
};
  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      setMessage("Google Signup failed: No credential received.");
      return;
    }

    try {
      const response = await axios.post<{ token?: string }>(
        // "http://192.168.100.138:5000/google-auth", // 192.168.0.228
        "http://192.168.18.62:5000/google-auth",

        { token: credentialResponse.credential }
      );

      if (response.data.token) {
        localStorage.setItem("authToken", response.data.token);
        setMessage("Google Signup successful! Redirecting...");
        // router.push("/dashboard");
      }
    } 
    
    catch {
      setMessage("Google Signup failed");
    }
  };
  
return (
    <div className="min-h-screen 
    bg-slate-100 md:mt-16 -mt-36
    flex items-center justify-center">    
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md p-6 sm:p-8 space-y-6"
    >
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-600">
          Sign Up
        </p>
        <h1 className="-mb-4 text-3xl 
        font-semibold tracking-tight text-slate-900">
          Welcome Here
        </h1>
      </div>

      <div className="space-y-2">
        <div>
          <input
            id="name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Enter your full name"
            className="
            w-full
            rounded-xl border border-gray-300 bg-white 
            px-4 py-2 text-sm 
            text-gray-900 outline-none transition focus:border-red-500 
            focus:ring-2 focus:ring-red-100"
          />
        </div>

        <div>
          <input
            id="email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="Enter your email"
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
          />
        </div>

        <div>

          <input
            id="password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            placeholder="Create a password"
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
          />
        </div>
      </div>

      {message && (
        <p className="text-center text-sm font-medium text-red-600">
          {message}
        </p>
      )}

      <div className="space-y-1">
        <button
          type="submit"
          className="w-full rounded-xl bg-red-600 px-4 py-3 -mb-6 text-sm font-semibold text-white shadow-md transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-200"
        >
          Register Now
        </button>
      </div>

  {/* Divider line */}
  <div className="flex items-center justify-center my-2">
    <hr className="w-1/4 border-gray" />
    <span className="px-2 text-xs font-sans serif font-semibold text-gray">OR</span>
    <hr className="w-1/4 border-gray" />
  </div>

      <div className="space-y-1 text-center">
        <GoogleLoginButton
          onSuccess={handleGoogleSuccess}
          onFailure={() => setMessage("Google authentication failed")}
        />

        <p className="text-sm text-gray-500">
          Already have an account?
        </p>

        <Link
          href="/login"
          className="inline-block text-sm font-semibold text-red-600 hover:text-red-700 transition"
        >
          Login
        </Link>
      </div>
    </form>
  </div>
);
};
export default Signup;