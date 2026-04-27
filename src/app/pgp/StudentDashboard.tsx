"use client";

import { useEffect, useMemo, useState } from "react";
import { Student, courseData, programs } from "@/lib/pgp-data";
import Link from "next/link";

type CourseRow = {
  name: string;
  attendance: string;
  mentor: string;
};

export default function StudentDashboard() {
  const [student, setStudent] = useState<Student | null>(null);

  useEffect(() => {
    const sessionEmail =
      localStorage.getItem("pgp_session_email") ||
      localStorage.getItem("pgp_active_student_email");

    const students = JSON.parse(
      localStorage.getItem("pgp_students") || "[]"
    ) as Student[];

    if (!sessionEmail) return;

    const currentStudent =
      students.find(
        (item) => item.email?.toLowerCase() === sessionEmail.toLowerCase()
      ) || null;

    setStudent(currentStudent);
  }, []);

  const registeredCourses: CourseRow[] = useMemo(() => {
    if (!student?.programs?.length) return [];

    return student.programs.map((program) => {
      const detail =
        (courseData?.[program] as Record<string, string> | undefined) || {};

      return {
        name: program,
        attendance: detail.attendance || "0%",
        mentor:
          detail.mentor ||
          detail.instructor ||
          detail.trainer ||
          detail.teacher ||
          "Mentor not assigned",
      };
    });
  }, [student]);

  if (!student) {
    return (
      <section className="mx-auto mt-10 w-full max-w-6xl rounded-[28px] border border-slate-200/80 bg-white p-8 shadow-[0_20px_60px_-18px_rgba(15,23,42,0.18)]">
        <h2 className="text-2xl font-semibold text-slate-900">
          Registration Required
        </h2>
        <p className="mt-3 text-sm text-slate-600">
          We found your login session, but no PGP registration record is linked
          to this email yet.
        </p>
        <div className="mt-6">
          <Link
            href="/pgp"
            className="inline-flex rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-600"
          >
            Complete Registration
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-6xl overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_20px_60px_-18px_rgba(15,23,42,0.18)]">
      <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 via-white to-blue-50/60 px-8 py-7 md:px-10">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-600">
              Student Overview
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
              PGP Dashboard
            </h2>
          </div>

          <div className="inline-flex items-center rounded-full border border-emerald-500 bg-emerald-100 px-4 py-2 text-xs font-bold text-emerald-800">
            Status: Active
          </div>
        </div>
      </div>

      <div className="px-8 py-8 md:px-10 md:py-10">
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center rounded-full border border-emerald-300 bg-gradient-to-r from-emerald-50 to-green-100 px-3 py-1 shadow-sm transition hover:scale-[1.02]">
            <span className="h-8 w-8 bg-transparent text-lg">✅</span>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
              Enrollment Status
            </p>
            <p className="ml-2 text-sm font-bold text-slate-900">
              Registered
            </p>
          </div>

          <div className="inline-flex items-center rounded-full border border-blue-300 bg-gradient-to-r from-blue-50 to-indigo-100 px-3 py-1 shadow-sm transition hover:scale-[1.02]">
            <span className="h-8 w-8 bg-transparent text-lg">📚</span>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-700">
              Registered Courses
            </p>
            <p className="ml-2 text-sm font-bold text-slate-900">
              {registeredCourses.length}
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-[24px] border border-slate-200 bg-slate-50/70 p-6 md:p-7">
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h3 className="text-xl font-semibold tracking-tight text-slate-900">
                Available Programs
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Offered and closed programs are shown here on the dashboard.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600">
              Total Programs: {programs.length}
            </div>
          </div>

          <div className="space-y-3">
            {programs.map((program) => {
              const isOffered = program.status === "offered";

              return (
                <div
                  key={program.name}
                  className={`flex flex-col gap-3 rounded-2xl border px-4 py-4 transition md:flex-row md:items-center md:justify-between ${
                    isOffered
                      ? "border-slate-200 bg-white hover:border-blue-300 hover:shadow-md"
                      : "border-slate-200 bg-slate-100/80"
                  }`}
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-slate-800">
                        {program.name}
                      </span>
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                          isOffered
                            ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                            : "bg-rose-50 text-rose-700 ring-1 ring-rose-200"
                        }`}
                      >
                        {isOffered ? "Offered" : "Not Offered"}
                      </span>
                    </div>

                    <p className="mt-1 text-xs text-slate-500">
                      {isOffered
                        ? "Open for enrollment in the current intake."
                        : "Unavailable in the current intake, but still visible."}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <h3 className="text-xl font-semibold tracking-tight text-slate-900">
            My Courses
          </h3>

          <div className="mt-4 space-y-3">
            {registeredCourses.length ? (
              registeredCourses.map((course) => (
                <div key={course.name} className="px-3 py-3">
                  <div className="grid grid-cols-[1.35fr_0.45fr_1fr] items-center gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-slate-900 md:text-sm">
                        {course.name}
                      </p>
                    </div>

                    <div className="min-w-0 text-center">
                      <p className="truncate text-xs font-bold text-blue-500 md:text-sm">
                        {course.attendance}
                      </p>
                    </div>

                    <div className="min-w-0 text-right">
                      <p className="truncate text-xs font-medium text-slate-700 md:text-sm">
                        {course.mentor}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-sm text-slate-500">
                No registered courses found.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
