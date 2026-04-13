"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';import Link from "next/link";
 
export default function VerifyCode() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleVerifyAndReset = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); // Start loading state

    try {
      const response = await fetch("/api/verify-code", {
        method: "POST", headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ email, code, password: newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        // Show success message on successful password reset
        toast.success(data.message || "Password reset successful!");
        // Redirect after success
        setTimeout(() => {
          router.push("/Main"); // Here i just for testing give route to Khudi Page but when where it have to routing.
        }, 2000); // Redirect after 2 seconds
      } 
      else {
        toast.error(data.message || "Invalid code or email."); // Show error message in case of failure
      }
    } 
catch (error) {
  console.error("Reset password error:", error);
  toast.error("Something went wrong. Please try again later.");
}
finally {
      setLoading(false); // Stop loading state
    }
  };

  return (
    <div className="min-h-screen 
    bg-slate-100 md:mt-16 -mt-44
    flex items-center justify-center">  
    <form onSubmit={handleVerifyAndReset} 
      className="w-full max-w-md p-6  space-y-3" >

      <div className="text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-blue-600">
            Reset Password
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Enter your 6 Digits Code to Reset Password
          </h1>
        </div>

    <div className="relative w-full">
      <input type="email"  placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} 
      required 
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
      />
     </div>  

    <div className="relative w-full">
      <input type="text" placeholder="Your code" value={code} onChange={(e) => setCode(e.target.value)} 
      required 
      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
      />
     </div> 

    <div className="relative w-full">
      <input 
      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"

        type="password" placeholder="New password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required
      />
     </div>

<div className="text-center">
  {/* Reset Password Button */}
  <button
          className="w-full rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-200 disabled:cursor-not-allowed disabled:opacity-70"
    type="submit"
    disabled={loading}
  >
    {loading ? "Resetting..." : "Reset Password"}
  </button>

  {/* Spacer */}
  <h6 className="mt-4"></h6>

  {/* Back to Home Link */}
  <Link href="/#Home" className="block text-sm font-sans serif text-Red hover:text-Blue font-bold">
    Back to Home
  </Link>

  {/* Divider line */}
  <div className="flex items-center justify-center my-2">
    <hr className="w-1/4 border-gray" />
    <span className="px-2 text-xs font-sans serif font-semibold text-gray">OR</span>
    <hr className="w-1/4 border-gray" />
  </div>

  {/* Login Link */}
  <Link href="/Forgot-Password" className="block text-sm font-sans serif text-Red hover:text-Blue font-bold">
    Forgot Password
  </Link>
</div>

    <ToastContainer />
     </form>    
    </div>
 
    );}