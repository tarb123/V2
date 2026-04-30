"use client";

import { useEffect, useState } from "react";
import PortalShell from "../PortalShell";
import { Student, programs } from "@/lib/pgp-data";

export default function OnlineRegisterPage() {
  const [student, setStudent] = useState<Student | null>(null);
  const [selectedPrograms, setSelectedPrograms] = useState<string[]>([]);
  const [message, setMessage] = useState("");

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
    setSelectedPrograms(currentStudent?.programs || []);
  }, []);

  const toggleProgram = (programName: string) => {
    setMessage("");

    setSelectedPrograms((current) =>
      current.includes(programName)
        ? current.filter((item) => item !== programName)
        : [...current, programName]
    );
  };

  const handleSavePrograms = () => {
    if (!student) return;

    if (!selectedPrograms.length) {
      setMessage("Please select at least one course.");
      return;
    }

    const students = JSON.parse(
      localStorage.getItem("pgp_students") || "[]"
    ) as Student[];

    const updatedStudent: Student = {
      ...student,
      programs: selectedPrograms,
    };

    const updatedStudents = students.map((item) =>
      item.email?.toLowerCase() === student.email?.toLowerCase()
        ? updatedStudent
        : item
    );

    localStorage.setItem("pgp_students", JSON.stringify(updatedStudents));
    localStorage.setItem("pgp_active_student_email", updatedStudent.email);
    localStorage.setItem("pgp_session_email", updatedStudent.email);

    setStudent(updatedStudent);
    setMessage("Courses saved successfully.");
  };

  return (
    <PortalShell title="Online Register">
<section className="bg-white p-5 md:p-6 md:mt-8">        
    <div className="mb-3 flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <h3 className="text-lg font-medium text-slate-800">
              Online Register
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Select available courses and save registration.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSavePrograms}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Save
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {programs.map((program) => {
            const isOffered = program.status === "offered";
            const isSelected = selectedPrograms.includes(program.name);

            return (
              <button
                key={program.name}
                type="button"
                disabled={!isOffered}
                onClick={() => toggleProgram(program.name)}
                className={`flex w-full items-center gap-3 px-2 py-3 text-left transition ${
                  isOffered
                    ? "hover:bg-slate-50"
                    : "cursor-not-allowed opacity-50"
                }`}
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded text-xs ${
                    isSelected
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {isSelected ? "✓" : "＋"}
                </span>

                <span className="min-w-0 flex-1 truncate text-sm text-slate-700">
                  {program.name}
                </span>

                <span
                  className={`text-xs ${
                    isOffered ? "text-emerald-600" : "text-rose-500"
                  }`}
                >
                  {isOffered ? "Open" : "Closed"}
                </span>
              </button>
            );
          })}
        </div>

        {message ? (
          <p
            className={`mt-3 rounded-md px-3 py-2 text-sm ${
              message.includes("successfully")
                ? "bg-emerald-50 text-emerald-700"
                : "bg-rose-50 text-rose-700"
            }`}
          >
            {message}
          </p>
        ) : null}
      </section>
    </PortalShell>
  );
}