"use client";
import { useState } from "react";
import Link from "next/link";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

const handleSendCode = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setLoading(true);

  try {
    const response = await fetch("/api/send-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (response.ok) {
      toast.success(data.message || "Confirmation code sent to your email.");
    } else {
      toast.error(data.message || "User not found.");
    }
  } catch (error) {
    console.error("Forgot password error:", error);
    toast.error("Something went wrong. Please try again later.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen 
    bg-slate-100 md:mt-2 -mt-44
    flex items-center justify-center">      
    <form
     onSubmit={handleSendCode}
     className="w-full max-w-md p-6 space-y-3">
        
      <div className="text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-blue-600">
            Forgot Password
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Enter your email to receive a confirmation code
          </h1>
        </div>

        <div>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Enter your email"
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-200 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Sending..." : "Send Confirmation Code"}
        </button>
  {/* Divider line */}
  <div className="flex items-center justify-center my-2">
    <hr className="w-1/4 border-gray" />
    <span className="px-2 text-xs font-sans serif font-semibold text-gray">OR</span>
    <hr className="w-1/4 border-gray" />
  </div>

        <div className="text-center">
          <Link
            href="/login"
            className="block text-sm font-semibold text-red-600 transition hover:text-red-700"
          >
            Back to Login
          </Link>
        </div>

        <ToastContainer />
      </form>
    </div>
  );
}
export default ForgotPassword;