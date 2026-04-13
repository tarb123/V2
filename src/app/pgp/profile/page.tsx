"use client";

import { useEffect, useState } from "react";
import PortalShell from "../PortalShell";
import { Student } from "@/lib/pgp-data";

function readActiveStudent(): Student | null {
  const saved = JSON.parse(localStorage.getItem("pgp_students") || "[]") as Student[];
  const activeEmail = localStorage.getItem("pgp_active_student_email");

  if (!saved.length) return null;
  if (!activeEmail) return saved[saved.length - 1] ?? null;

  return saved.find((student) => student.email === activeEmail) ?? saved[saved.length - 1] ?? null;
}

export default function ProfilePage() {
  const [student, setStudent] = useState<Student | null>(null);

  useEffect(() => {
    setStudent(readActiveStudent());
  }, []);

  const completion = Math.round(
    ([student?.name, student?.email, student?.education, student?.discipline].filter(Boolean).length / 4) * 100,
  );

  return (
    <PortalShell title="User Profile">
      <section className="mx-auto w-full max-w-6xl overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_20px_60px_-18px_rgba(15,23,42,0.18)]">
        <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 via-white to-blue-50/60 px-8 py-7 md:px-10">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            Profile Overview
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Personal details loaded from the active registration record stored in the portal.
          </p>
        </div>

        <div className="px-8 py-8 md:px-10 md:py-10">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-semibold text-slate-500">Profile Completion</p>
              <p className="mt-3 text-2xl font-semibold text-slate-900">
                {student ? `${completion}%` : "0%"}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Based on required student identity fields.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-semibold text-slate-500">Enrolled Programs</p>
              <p className="mt-3 text-2xl font-semibold text-slate-900">
                {student?.programs.length ?? 0}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Programs currently linked with this student profile.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-semibold text-slate-500">Portal Identity</p>
              <p className="mt-3 text-base font-semibold text-slate-900">
                {student?.email || "No active student selected"}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                The portal uses the saved registration email as identity.
              </p>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-6">
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                Student Details
              </h2>

              <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                {[
                  ["Full Name", student?.name || "Not available"],
                  ["Email Address", student?.email || "Not available"],
                  ["Education Background", student?.education || "Not available"],
                  ["Discipline", student?.discipline || "Not available"],
                ].map(([label, value]) => (
                  <div key={label}>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      {label}
                    </label>
                    <div className="flex min-h-[3rem] w-full items-center rounded-2xl border border-slate-300 bg-white px-4 text-sm text-slate-900">
                      {value}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-6">
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                Selected Programs
              </h2>

              <div className="mt-4 flex flex-wrap gap-2">
                {student?.programs.length ? (
                  student.programs.map((program) => (
                    <span
                      key={program}
                      className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-200"
                    >
                      {program}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">
                    No programs saved yet. Complete registration to populate this section.
                  </p>
                )}
              </div>

              <div className="mt-6 rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-600">
                Until edit mode is added, profile updates can be made from the registration page and then reflected here.
              </div>
            </div>
          </div>
        </div>
      </section>
    </PortalShell>
  );
}