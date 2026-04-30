"use client";

import { useEffect, useMemo, useState } from "react";
import PortalShell from "../PortalShell";
import { Student, courseData } from "@/lib/pgp-data";

type CourseRow = {
  name: string;
  fromDate: string;
  passedStatus: string;
  faculty: string;
  timings: string;
};

export default function MyCoursesPage() {
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
        fromDate:
          detail.fromDate || detail.startDate || detail.date || "01 May 2026",
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

  return (
    <PortalShell title="My Courses">
<section className="bg-white p-5 md:p-6 md:mt-8">
        <div id="my-courses" className="bg-white">
          <div className="mb-3 flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-lg font-medium text-slate-800">
                My Courses
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Current registered courses.
              </p>
            </div>

            <span className="rounded-md bg-slate-100 px-3 py-1 text-sm text-slate-600">
              {registeredCourses.length}
            </span>
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
                      <td className="px-4 py-3 text-slate-800">
                        {course.name}
                      </td>

                      <td className="px-4 py-3 text-slate-600">
                        {course.fromDate}
                      </td>

                      <td className="px-4 py-3">
                        <span className="rounded-md bg-blue-50 px-2 py-1 text-xs text-blue-700">
                          {course.passedStatus}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-slate-600">
                        {course.faculty}
                      </td>

                      <td className="px-4 py-3 text-slate-600">
                        {course.timings}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-8 text-center text-sm text-slate-500"
                    >
                      No courses selected yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </PortalShell>
  );
}