"use client";

import { useEffect, useMemo, useState } from "react";
import { Student, courseData} from "@/lib/pgp-data";
import Link from "next/link";

type CourseRow = {
  name: string;
  attendance: string;
  mentor: string;
  fromDate: string;
  passedStatus: string;
  faculty: string;
  timings: string;
};

export default function StudentDashboard() {
  const [student, setStudent] = useState<Student | null>(null);
  const [selectedPrograms, setSelectedPrograms] = useState<string[]>([]);
  const [message, setMessage] = useState<string>("");

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
        fromDate:
          detail.fromDate || detail.startDate || detail.date || "Not assigned",
        passedStatus: detail.passedStatus || detail.status || "In Progress",
        faculty:
          detail.faculty ||
          detail.mentor ||
          detail.instructor ||
          detail.trainer ||
          detail.teacher ||
          "Not assigned",
        timings:
          detail.timings || detail.timing || detail.schedule || "Not assigned",
      };
    });
  }, [student]);

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

  if (!student) {
    return (
      <section className="mx-auto mt-8 max-w-5xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-800">
          Registration Required
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          No PGP registration record is linked with this account.
        </p>

        <Link href="/pgp"
          className="mt-5 inline-flex rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Complete Registration
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-6xl bg-white shadow-sm">
      <div className="border-b border-slate-200 px-6 py-5 md:mt-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500"> Student Portal</p>
            <h2 className="mt-1 text-2xl font-semibold text-slate-800"> PGP Dashboard</h2>
          </div>

          <span className="inline-flex w-fit items-center gap-2 rounded-md bg-emerald-50 px-3 py-1.5 text-sm text-emerald-700">
            <span className="h-2 w-2 rounded-full bg-emerald-500"/>Active</span>
        </div>
      </div>

      <div className="space-y-6 px-6 py-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="bg-slate-50 px-5 py-4">
            <p className="text-sm text-slate-500">Enrollment Status</p>
            <p className="mt-1 text-lg font-medium text-slate-800">Registered</p>
          </div>

          <div className="bg-slate-50 px-5 py-4">
            <p className="text-sm text-slate-500">Registered Courses</p>
            <p className="mt-1 text-lg font-medium text-slate-800">{registeredCourses.length}</p>
          </div>
        </div>


  {/* My Courses */}
  <div id="my-courses" className="bg-white">
    
    <div className="mb-3 flex items-center justify-between border-b border-slate-200 pb-3">
      
      <div>
        <h3 className="text-lg font-medium text-slate-800">My Courses</h3>
        <p className="mt-1 text-sm text-slate-500">Current registered courses.</p>
      </div>
      <span className="rounded-md bg-slate-100 px-3 py-1 text-sm text-slate-600">{registeredCourses.length}</span>

    </div>

  <div className="overflow-x-auto">
    <table className="w-full min-w-[760px] text-left text-sm">
      <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
      <tr>
      <th className="px-4 py-3 font-medium">Course</th>
      <th className="px-4 py-3 font-medium">From Date</th>
      <th className="px-4 py-3 font-medium">Passed Status</th>
      <th className="px-4 py-3 font-medium">Faculty</th>
      <th className="px-4 py-3 font-medium">Timings</th>
      </tr>
      </thead>

    <tbody className="divide-y divide-slate-100">
    {registeredCourses.length ? (
      registeredCourses.map((course) => (
      <tr key={course.name} className="hover:bg-slate-50">
        <td className="px-4 py-3 text-slate-800">{course.name}</td>
        <td className="px-4 py-3 text-slate-600">{course.fromDate}</td>
        <td className="px-4 py-3">
        <span className="rounded-md bg-blue-50 px-2 py-1 text-xs text-blue-700">{course.passedStatus}</span>
        </td>
        <td className="px-4 py-3 text-slate-600">{course.faculty}</td>
        <td className="px-4 py-3 text-slate-600">{course.timings}</td>
      </tr>
      ))
      ) : (
      <tr>
        <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-500">No courses selected yet.</td>
      </tr>
      )}

    </tbody>
    
    </table>
          </div>
        </div>
      </div>
    </section>
  );
}