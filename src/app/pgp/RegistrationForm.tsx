"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { courseData, programs, Student } from "@/lib/pgp-data";
type FormErrors = {
  name?: string;
  email?: string;
  education?: string;
  discipline?: string;
  programs?: string;
};

const emptyForm: Student = {
  name: "",
  email: "",
  education: "",
  discipline: "",
  programs: [],
};

function isEmailValid(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function buildErrors(form: Student, selectedPrograms: string[]): FormErrors {
  const nextErrors: FormErrors = {};

  if (!form.name.trim()) nextErrors.name = "Full name is required.";
  if (!form.email.trim()) nextErrors.email = "Email address is required.";
  else if (!isEmailValid(form.email)) nextErrors.email = "Enter a valid email address.";
  if (!form.education) nextErrors.education = "Select an education background.";
  if (!form.discipline.trim()) nextErrors.discipline = "Discipline is required.";
  if (!selectedPrograms.length) nextErrors.programs = "Select at least one offered program.";

  return nextErrors;
}

export default function RegistrationForm() {
  const [form, setForm] = useState<Student>(emptyForm);
  const [selectedPrograms, setSelectedPrograms] = useState<string[]>([]);
  const [selectedCourseDetail, setSelectedCourseDetail] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
const router = useRouter();
  const offeredPrograms = useMemo(
    () => programs.filter((program) => program.status === "offered"),
    [],
  );

  const profileComplete = Boolean(
    form.name.trim() && isEmailValid(form.email) && form.education && form.discipline.trim(),
  );


  const selectedCount = selectedPrograms.length;
  const canSave = profileComplete && selectedCount > 0;

  const handleFieldChange = <K extends keyof Student>(key: K, value: Student[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
    setStatusMessage(null);
  };

  const toggleProgram = (programName: string) => {
    setSelectedPrograms((current) =>
      current.includes(programName)
        ? current.filter((value) => value !== programName)
        : [...current, programName],
    );

    setErrors((current) => ({ ...current, programs: undefined }));
    setStatusMessage(null);
  };

const handleSave = () => {
  const nextErrors = buildErrors(form, selectedPrograms);
  setErrors(nextErrors);

  if (Object.keys(nextErrors).length > 0) {
    setStatusMessage({
      type: "error",
      text: "Please correct the highlighted fields before saving registration.",
    });
    return;
  }

  const studentData: Student = {
    ...form,
    name: form.name.trim(),
    email: form.email.trim().toLowerCase(),
    discipline: form.discipline.trim(),
    programs: selectedPrograms,
  };

  const existing = JSON.parse(localStorage.getItem("pgp_students") || "[]") as Student[];
  const index = existing.findIndex((student) => student.email === studentData.email);

  const updatedStudents = [...existing];
  if (index >= 0) updatedStudents[index] = studentData;
  else updatedStudents.push(studentData);

  localStorage.setItem("pgp_students", JSON.stringify(updatedStudents));
  localStorage.setItem("pgp_active_student_email", studentData.email);
  localStorage.setItem("pgp_session_email", studentData.email);

  setForm(emptyForm);
  setSelectedPrograms([]);
  setErrors({});
  setStatusMessage({
    type: "success",
    text: "Registration saved successfully. Redirecting to your dashboard...",
  });

  setTimeout(() => {
    router.push("/pgp/dashboard");
  }, 800);
};

  const detailRecord = selectedCourseDetail
    ? (courseData[selectedCourseDetail] as Record<string, string> | undefined)
    : undefined;

  return (
    <section className="mx-auto w-full max-w-6xl overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_20px_60px_-18px_rgba(15,23,42,0.18)]">
      <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 via-white to-blue-50/60 px-8 py-7 md:px-10">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-600">
              Program Registration
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
              Student Registration
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">
              Complete your profile, review offered PGP courses, and save enrollment with clear validation feedback.
            </p>
          </div>
          <div className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-medium text-emerald-700">
            Admission Intake Open
          </div>
        </div>
      </div>

      <div className="px-8 py-8 md:px-10 md:py-10">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-semibold text-slate-500">Profile Status</p>
            <p className="mt-3 text-2xl font-semibold text-slate-900">
              {profileComplete ? "Complete" : "Incomplete"}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Name, email, education, and discipline are required before program selection.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-semibold text-slate-500">Selected Programs</p>
            <p className="mt-3 text-2xl font-semibold text-slate-900">{selectedCount}</p>
            <p className="mt-1 text-sm text-slate-500">
              Choose one or more offered programs for this intake.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-semibold text-slate-500">Offered This Intake</p>
            <p className="mt-3 text-2xl font-semibold text-slate-900">{offeredPrograms.length}</p>
            <p className="mt-1 text-sm text-slate-500">
              Only offered programs can be selected and saved.
            </p>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label htmlFor="fullName" className="mb-2 block text-sm font-semibold text-slate-700">
              Full Name <span className="text-rose-600">*</span>
            </label>
            <input
              id="fullName"
              value={form.name}
              onChange={(event) => handleFieldChange("name", event.target.value)}
              placeholder="Enter full name"
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? "fullName-error" : undefined}
              className={`h-12 w-full rounded-2xl border bg-white px-4 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:ring-4 ${
                errors.name
                  ? "border-rose-400 focus:border-rose-500 focus:ring-rose-100"
                  : "border-slate-300 focus:border-blue-500 focus:ring-blue-100"
              }`}
            />
            {errors.name ? (
              <p id="fullName-error" className="mt-2 text-sm font-medium text-rose-700">
                {errors.name}
              </p>
            ) : null}
          </div>

          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-semibold text-slate-700">
              Email Address <span className="text-rose-600">*</span>
            </label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={(event) => handleFieldChange("email", event.target.value)}
              placeholder="Enter email address"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "email-error" : "email-help"}
              className={`h-12 w-full rounded-2xl border bg-white px-4 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:ring-4 ${
                errors.email
                  ? "border-rose-400 focus:border-rose-500 focus:ring-rose-100"
                  : "border-slate-300 focus:border-blue-500 focus:ring-blue-100"
              }`}
            />
            <p id="email-help" className="mt-2 text-xs text-slate-500">
              This email is used as the active student identity inside the portal.
            </p>
            {errors.email ? (
              <p id="email-error" className="mt-1 text-sm font-medium text-rose-700">
                {errors.email}
              </p>
            ) : null}
          </div>

          <div className="relative">
            <label htmlFor="education" className="mb-2 block text-sm font-semibold text-slate-700">
              Education Background <span className="text-rose-600">*</span>
            </label>
            <select
              id="education"
              value={form.education}
              onChange={(event) => handleFieldChange("education", event.target.value)}
              aria-invalid={Boolean(errors.education)}
              aria-describedby={errors.education ? "education-error" : undefined}
              className={`h-12 w-full appearance-none rounded-2xl border bg-white px-4 pr-10 text-sm text-slate-900 shadow-sm outline-none transition focus:ring-4 ${
                errors.education
                  ? "border-rose-400 focus:border-rose-500 focus:ring-rose-100"
                  : "border-slate-300 focus:border-blue-500 focus:ring-blue-100"
              }`}
            >
              <option value="">Select education level</option>
              <option value="Bachelors">Bachelors</option>
              <option value="Masters">Masters</option>
              <option value="Intermediate">Intermediate</option>
              <option value="DAE">DAE</option>
            </select>
            <span className="pointer-events-none absolute bottom-3 right-4 flex items-center text-slate-400">
              ▾
            </span>
            {errors.education ? (
              <p id="education-error" className="mt-2 text-sm font-medium text-rose-700">
                {errors.education}
              </p>
            ) : null}
          </div>

          <div>
            <label htmlFor="discipline" className="mb-2 block text-sm font-semibold text-slate-700">
              Discipline <span className="text-rose-600">*</span>
            </label>
            <input
              id="discipline"
              value={form.discipline}
              onChange={(event) => handleFieldChange("discipline", event.target.value)}
              placeholder="Enter discipline"
              aria-invalid={Boolean(errors.discipline)}
              aria-describedby={errors.discipline ? "discipline-error" : undefined}
              className={`h-12 w-full rounded-2xl border bg-white px-4 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:ring-4 ${
                errors.discipline
                  ? "border-rose-400 focus:border-rose-500 focus:ring-rose-100"
                  : "border-slate-300 focus:border-blue-500 focus:ring-blue-100"
              }`}
            />
            {errors.discipline ? (
              <p id="discipline-error" className="mt-2 text-sm font-medium text-rose-700">
                {errors.discipline}
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-12 rounded-[24px] border border-slate-200 bg-slate-50/70 p-6 md:p-7">
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                Available Programs
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Offered programs are selectable. Closed programs stay visible so applicants understand intake availability.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600">
              {profileComplete ? "Profile ready for selection" : "Complete the profile to continue smoothly"}
            </div>
          </div>

          <div className="space-y-3">
            {programs.map((program) => {
              const isOffered = program.status === "offered";
              const isSelected = selectedPrograms.includes(program.name);

              return (
                <div
                  key={program.name}
                  className={`group flex flex-col gap-4 rounded-2xl border px-4 py-4 transition md:flex-row md:items-center md:justify-between ${
                    isOffered
                      ? "border-slate-200 bg-white hover:border-blue-300 hover:shadow-md"
                      : "border-slate-200 bg-slate-100/80"
                  }`}
                >
                  <div className="flex min-w-0 items-start gap-4">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      disabled={!isOffered}
                      onChange={() => toggleProgram(program.name)}
                      className="mt-1 h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-200"
                      aria-label={`Select ${program.name}`}
                    />

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="truncate text-sm font-semibold text-slate-800">
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
                          ? "Open for enrollment. View outline and verify the course before saving."
                          : "Unavailable in the current intake, but still shown for visibility."}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-auto">
                    {isSelected ? (
                      <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-200">
                        Selected
                      </span>
                    ) : null}

                    {isOffered ? (
                      <button
                        type="button"
                        onClick={() => setSelectedCourseDetail(program.name)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-blue-200 bg-blue-50 text-lg text-blue-700 transition hover:bg-blue-600 hover:text-white"
                        aria-label={`View details for ${program.name}`}
                        title="Course Detail & Outline"
                      >
                        →
                      </button>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>

          {errors.programs ? (
            <p className="mt-4 text-sm font-medium text-rose-700">{errors.programs}</p>
          ) : null}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[24px] border border-slate-200 bg-white p-6">
            <h3 className="text-lg font-semibold tracking-tight text-slate-900">
              Enrollment Preview
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Review the student profile and selected programs before saving.
            </p>

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Student</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">
                  {form.name.trim() || "Not entered yet"}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Discipline</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">
                  {form.discipline.trim() || "Not entered yet"}
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                Selected Programs
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {selectedPrograms.length ? (
                  selectedPrograms.map((program) => (
                    <span
                      key={program}
                      className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-200"
                    >
                      {program}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">No program selected yet.</p>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-6">
            <h3 className="text-lg font-semibold tracking-tight text-slate-900">
              Before You Save
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              <li className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                Use a real email. It becomes the active portal identity after save.
              </li>
              <li className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                Read the course outline from the details button before final selection.
              </li>
              <li className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                Closed programs stay visible, but cannot be selected for this intake.
              </li>
            </ul>
          </div>
        </div>

        {statusMessage ? (
          <div
            className={`mt-6 rounded-2xl px-4 py-3 text-sm font-medium ${
              statusMessage.type === "success"
                ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border border-rose-200 bg-rose-50 text-rose-700"
            }`}
          >
            {statusMessage.text}
          </div>
        ) : null}

        <div className="mt-8 flex flex-col items-start justify-between gap-4 border-t border-slate-200 pt-6 sm:flex-row sm:items-center">
          <p className="text-sm text-slate-500">
            Required fields and at least one offered program must be completed before save.
          </p>

          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave}
            className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/15 transition hover:-translate-y-0.5 hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
          >
            Save Registration
          </button>
        </div>
      </div>

      {selectedCourseDetail ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-3 backdrop-blur-[2px]">
          <div
            className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-[0_20px_50px_-18px_rgba(15,23,42,0.3)]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="course-detail-title"
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 md:px-5">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-600">
                  Course Detail & Outline
                </p>
                <h2 id="course-detail-title" className="mt-1 text-lg font-semibold text-slate-900">
                  {selectedCourseDetail}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCourseDetail(null)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-sm text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                aria-label="Close course details"
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
                  No course outline is available for this program yet.
                </div>
              )}

              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedCourseDetail(null)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 sm:text-sm"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCourseDetail(null)}
                  className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-700 sm:text-sm"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
