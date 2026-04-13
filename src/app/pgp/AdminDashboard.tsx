"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { courseData, programs, Student } from "@/lib/pgp-data";

function readActiveStudent(students: Student[]) {
  const activeEmail = localStorage.getItem("pgp_active_student_email");
  if (!students.length) return null;
  if (!activeEmail) return students[students.length - 1] ?? null;
  return students.find((student) => student.email === activeEmail) ?? students[students.length - 1] ?? null;
}

function pickDetail(
  details: Record<string, string> | undefined,
  keys: string[],
  fallback: string,
) {
  if (!details) return fallback;

  for (const key of keys) {
    const match = Object.entries(details).find(([detailKey]) => detailKey.toLowerCase() === key.toLowerCase());
    if (match?.[1]) return match[1];
  }

  return fallback;
}

export default function AdminDashboard() {
  const [students, setStudents] = useState<Student[]>([]);
  const [activeStudent, setActiveStudent] = useState<Student | null>(null);
  const [selectedProgramDetail, setSelectedProgramDetail] = useState<string | null>(null);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("pgp_students") || "[]") as Student[];
    setStudents(saved);
    setActiveStudent(readActiveStudent(saved));
  }, []);

  const offeredPrograms = useMemo(
    () => programs.filter((program) => program.status === "offered"),
    [],
  );

  const enrolledPrograms = activeStudent?.programs ?? [];
  const profileCompletion = Math.round(
    ([activeStudent?.name, activeStudent?.email, activeStudent?.education, activeStudent?.discipline].filter(Boolean).length / 4) * 100,
  );

  const activeStudentName = activeStudent?.name || "No active student";
  const enrollmentStatus = activeStudent
    ? enrolledPrograms.length
      ? "Active"
      : "Incomplete"
    : "Not Started";

  const dashboardAlerts = activeStudent
    ? [
        enrolledPrograms.length
          ? "Your registration is saved. Review course details and upcoming sessions from the dashboard."
          : "Your profile exists, but no program has been selected yet.",
        profileCompletion < 100
          ? "Complete all profile fields to keep your portal record accurate."
          : "Profile completion is 100% and ready for portal services.",
        "Attendance and certificate eligibility can be shown here once that data source is connected.",
      ]
    : [
        "No student has been saved yet. Complete registration to activate this dashboard.",
        "Use a real email during registration so the portal can load the correct student profile.",
        "After saving registration, this screen will show your selected programs and progress cards.",
      ];

  const detailRecord = selectedProgramDetail
    ? (courseData[selectedProgramDetail] as Record<string, string> | undefined)
    : undefined;

  return (
    <section className="mx-auto w-full max-w-6xl overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_20px_60px_-18px_rgba(15,23,42,0.18)]">
      <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 via-white to-blue-50/60 px-8 py-7 md:px-10">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-600">
              Student Overview
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
              PGP Dashboard
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">
              A student-facing dashboard focused on enrollment status, selected courses, profile readiness, and next actions.
            </p>
          </div>
          <div className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-medium text-blue-700">
            Active Student: {activeStudentName}
          </div>
        </div>
      </div>

      <div className="px-8 py-8 md:px-10 md:py-10">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">Enrollment Status</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">{enrollmentStatus}</p>
            <p className="mt-1 text-xs text-slate-500">Shows whether registration is ready for this student.</p>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">Enrolled Programs</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">{enrolledPrograms.length}</p>
            <p className="mt-1 text-xs text-slate-500">Programs selected in the registration form.</p>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">Profile Completion</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">{activeStudent ? `${profileCompletion}%` : "0%"}</p>
            <p className="mt-1 text-xs text-slate-500">Readiness based on name, email, education, and discipline.</p>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">Offered This Intake</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">{offeredPrograms.length}</p>
            <p className="mt-1 text-xs text-slate-500">Current courses that are open for PGP registration.</p>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">Portal Records</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">{students.length}</p>
            <p className="mt-1 text-xs text-slate-500">Saved student registrations currently stored in local data.</p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-6">
            <div className="mb-5">
              <h3 className="text-xl font-semibold tracking-tight text-slate-900">Alerts & Next Steps</h3>
              <p className="mt-1 text-sm text-slate-500">
                Action-oriented guidance is more useful than decorative cards when students land on the dashboard.
              </p>
            </div>

            <div className="space-y-3">
              {dashboardAlerts.map((alert, index) => (
                <div key={index} className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-700">
                  {alert}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-6">
            <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <h3 className="text-xl font-semibold tracking-tight text-slate-900">Quick Actions</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Keep the main student tasks one click away.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Link
                href="/pgp"
                className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm font-semibold text-slate-800 transition hover:border-blue-300 hover:shadow-sm"
              >
                Update Registration
                <p className="mt-1 text-xs font-normal text-slate-500">
                  Edit profile info and program selection.
                </p>
              </Link>

              <Link
                href="/pgp/profile"
                className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm font-semibold text-slate-800 transition hover:border-blue-300 hover:shadow-sm"
              >
                View Profile
                <p className="mt-1 text-xs font-normal text-slate-500">
                  Review personal details used in the portal.
                </p>
              </Link>

              <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-4 text-sm font-semibold text-slate-700">
                Attendance & Schedule
                <p className="mt-1 text-xs font-normal text-slate-500">
                  Add this page next when your attendance data source is ready.
                </p>
              </div>

              <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-4 text-sm font-semibold text-slate-700">
                Certificate Tracking
                <p className="mt-1 text-xs font-normal text-slate-500">
                  Add certificate readiness after assessments and attendance are connected.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-[24px] border border-slate-200 bg-slate-50/70 p-6">
          <div className="mb-5 flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
            <div>
              <h3 className="text-xl font-semibold tracking-tight text-slate-900">My Programs</h3>
              <p className="mt-1 text-sm text-slate-500">
                Each program row should show status and let the student review details without leaving the dashboard.
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left">
                <tr className="border-b border-slate-200">
                  <th className="px-5 py-4 font-semibold text-slate-700">Program</th>
                  <th className="px-5 py-4 font-semibold text-slate-700">Intake Status</th>
                  <th className="px-5 py-4 font-semibold text-slate-700">Summary</th>
                  <th className="px-5 py-4 font-semibold text-slate-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {enrolledPrograms.length > 0 ? (
                  enrolledPrograms.map((programName) => {
                    const catalogProgram = programs.find((item) => item.name === programName);
                    const status = catalogProgram?.status === "offered" ? "Offered" : "Not Offered";
                    const details = courseData[programName] as Record<string, string> | undefined;
                    const mentor = pickDetail(details, ["mentor", "trainer", "instructor", "faculty"], "To be announced");
                    const schedule = pickDetail(details, ["timing", "schedule", "duration"], "See outline");

                    return (
                      <tr key={programName} className="border-b border-slate-200 last:border-b-0 hover:bg-slate-50/70">
                        <td className="px-5 py-4 font-medium text-slate-800">{programName}</td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                              status === "Offered"
                                ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                                : "bg-rose-50 text-rose-700 ring-1 ring-rose-200"
                            }`}
                          >
                            {status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-slate-600">
                          <div>{mentor}</div>
                          <div className="mt-1 text-xs text-slate-500">{schedule}</div>
                        </td>
                        <td className="px-5 py-4">
                          <button
                            type="button"
                            onClick={() => setSelectedProgramDetail(programName)}
                            className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-600 hover:text-white"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="px-5 py-10 text-center text-sm text-slate-500">
                      No enrolled programs found for the active student yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-6">
            <div className="mb-5">
              <h3 className="text-xl font-semibold tracking-tight text-slate-900">Profile Snapshot</h3>
              <p className="mt-1 text-sm text-slate-500">Key portal identity fields for the active student.</p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {[
                ["Full Name", activeStudent?.name || "Not available"],
                ["Email", activeStudent?.email || "Not available"],
                ["Education", activeStudent?.education || "Not available"],
                ["Discipline", activeStudent?.discipline || "Not available"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-6">
            <div className="mb-5">
              <h3 className="text-xl font-semibold tracking-tight text-slate-900">Why This Version Is Better</h3>
              <p className="mt-1 text-sm text-slate-500">This replaces the admin-style overview with a real student experience.</p>
            </div>

            <div className="space-y-3 text-sm text-slate-600">
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                It shows the active student rather than only total system counts.
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                It gives next-step guidance so the student knows what to do after landing.
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                It keeps course details one click away instead of hiding them outside the dashboard.
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedProgramDetail ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-3 backdrop-blur-[2px]">
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-[0_20px_50px_-18px_rgba(15,23,42,0.3)]">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 md:px-5">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-600">
                  Program Detail
                </p>
                <h2 className="mt-1 text-lg font-semibold text-slate-900">{selectedProgramDetail}</h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProgramDetail(null)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-sm text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                aria-label="Close program details"
              >
                ✕
              </button>
            </div>

            <div className="px-4 py-4 md:px-5 md:py-5">
              {detailRecord ? (
                <div className="overflow-hidden rounded-xl border border-slate-200">
                  <table className="w-full text-xs sm:text-sm">
                    <tbody>
                      {Object.entries(detailRecord).map(([key, value], index, rows) => (
                        <tr key={key} className={index !== rows.length - 1 ? "border-b border-slate-200" : ""}>
                          <td className="w-[34%] bg-slate-50 px-3 py-2.5 text-xs font-semibold capitalize text-slate-700 sm:px-4 sm:text-sm">
                            {key}
                          </td>
                          <td className="px-3 py-2.5 text-xs leading-5 text-slate-600 sm:px-4 sm:text-sm">
                            {value}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                  No details are available for this program yet.
                </div>
              )}

              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedProgramDetail(null)}
                  className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-700 sm:text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
