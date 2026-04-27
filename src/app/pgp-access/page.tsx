"use client";
import Link from "next/link";

export default function PGPAccessPage() {
  return (
    <section className="min-h-screen bg-slate-100 px-4 py-28 sm:mt-10 ">
      <div className="mx-auto max-w-3xl rounded-[28px] border border-slate-200 bg-white p-8 shadow-[0_20px_60px_-18px_rgba(15,23,42,0.18)] md:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-600">
          Professional Grooming Program
        </p>

        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">
          Welcome to the PGP Portal
        </h1>

        <p className="mt-2 text-xs leading-6 text-slate-600">
          Please login if you already have an account, or create a new account first.
         </p>
        <p className="-mt-1 text-xs leading-6 text-slate-600">          
          After authentication, you will continue to registration and then enter your dashboard.
        </p> 

        <div className="mt-4 grid gap-3 sm:grid-cols-2 px-6 py-5">
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-2xl bg-slate-900 py-3 text-sm font-semibold text-white transition hover:bg-blue-600"
          >
            Login
          </Link>

          <Link
            href="/signup"
            className="inline-flex items-center justify-center rounded-2xl border border-slate-300 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
          >
            Signup
          </Link>
        </div>
      </div>
    </section>
  );
}