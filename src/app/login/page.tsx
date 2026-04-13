"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import GoogleLoginButton from "../components/GoogleLoginButton";
import { CredentialResponse } from "@react-oauth/google";

type AuthResponse = {
  token: string;
  message?: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
};

type StudentRecord = {
  name: string;
  email: string;
  education: string;
  discipline: string;
  programs: string[];
};

const Login: React.FC = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setMessage("");
  };

  const routeUserAfterLogin = (email: string) => {
  const normalizedEmail = email.trim().toLowerCase();

  localStorage.setItem("pgp_session_email", normalizedEmail);
  localStorage.setItem("pgp_active_student_email", normalizedEmail);

  const savedStudents = JSON.parse(
    localStorage.getItem("pgp_students") || "[]"
  ) as {
    name: string;
    email: string;
    education: string;
    discipline: string;
    programs: string[];
  }[];

  const isRegisteredInPGP = savedStudents.some(
    (student) => student.email?.toLowerCase() === normalizedEmail
  );

  if (isRegisteredInPGP) {
    router.push("/pgp/dashboard");
  } else {
    router.push("/pgp");
  }
};

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      const payload = {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      };

      const response = await axios.post<AuthResponse>("/api/login", payload);

      if (response.data.token) {
        localStorage.setItem("authToken", response.data.token);
        setMessage("Login successful!");
        routeUserAfterLogin(payload.email);
      } else {
        setMessage(response.data.message || "Login failed");
      }
    } catch (error: any) {
      setMessage(
        error?.response?.data?.message ||
          error?.message ||
          "Login failed"
      );
    }
  };

  const handleGoogleSuccess = async (
    credentialResponse: CredentialResponse
  ) => {
    if (!credentialResponse.credential) {
      setMessage("Google Login failed: No credential received.");
      return;
    }

    try {
      const response = await axios.post<{ token?: string; email?: string }>(
        "/api/google-login",
        { token: credentialResponse.credential }
      );

      if (response.data.token) {
        localStorage.setItem("authToken", response.data.token);

        if (response.data.email) {
          routeUserAfterLogin(response.data.email);
        } else {
          router.push("/pgp");
        }
      } else {
        setMessage("Google Login failed");
      }
    } catch {
      setMessage("Google Login failed");
    }
  };

return (
    <div className="min-h-screen 
    bg-slate-100 md:mt-16 -mt-36
    flex items-center justify-center">
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md p-6  space-y-3"
    >
          
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-600">
          Sign In
        </p>
        <h1 className=" text-3xl font-semibold tracking-tight text-slate-900">
          Welcome Back
        </h1>
      </div>

      <div className="space-y-2">
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
            placeholder="Enter your password"
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
          />
        </div>
      </div>

      <div className="flex items-center justify-end">
        <Link
          href="/Forgot-Password"
          className="sm:text-xs font-medium text-red-600 hover:text-red-700 transition"
        >
          Forgot Password?
        </Link>
      </div>

      <div className="space-y-1">
        <button
          type="submit"
          className="w-full rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-200"
        >
          Login
        </button>

        {message && (
          <p className="text-center text-sm font-medium text-red-600">
            {message}
          </p>
        )}
      </div>

  {/* Divider line */}
  <div className="flex items-center justify-center my-2">
    <hr className="w-1/4 border-gray" />
    <span className="px-2 text-xs font-sans serif font-semibold text-gray">OR</span>
    <hr className="w-1/4 border-gray" />
  </div>

      <div className="space-y-3 text-center">
        <GoogleLoginButton onSuccess={handleGoogleSuccess}  onFailure={() => setMessage("Google authentication failed")}/>
        <p className="text-sm text-gray-500"> Don&apos;t have an account?</p>
        <Link href="/signup"
          className="inline-block text-sm font-semibold text-red-600 hover:text-red-700 transition"
        >
          Create Account
        </Link>
      </div>
      
    </form>
  </div>
);
};

export default Login;