"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Student } from "@/lib/pgp-data";

type FormErrors = {
  name?: string;
  email?: string;
  education?: string;
  discipline?: string;
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

function buildErrors(form: Student): FormErrors {
  const nextErrors: FormErrors = {};

  if (!form.name.trim()) nextErrors.name = "Full name is required.";
  if (!form.email.trim()) nextErrors.email = "Email address is required.";
  else if (!isEmailValid(form.email)) {
    nextErrors.email = "Enter a valid email address.";
  }
  if (!form.education) {
    nextErrors.education = "Select an education background.";
  }
  if (!form.discipline.trim()) {
    nextErrors.discipline = "Discipline is required.";
  }

  return nextErrors;
}

function inputClasses(hasError: boolean) {
  return [
    "mt-2 w-full rounded-xl border px-4 py-3 text-sm text-slate-900 outline-none transition",
    "placeholder:text-slate-400 focus:ring-4",
    hasError
      ? "border-rose-300 bg-rose-50 focus:border-rose-500 focus:ring-rose-100"
      : "border-slate-300 bg-white focus:border-blue-500 focus:ring-blue-100",
  ].join(" ");
}

export default function RegistrationForm() {
  const [form, setForm] = useState<Student>(emptyForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const router = useRouter();

  const profileComplete = Boolean(
    form.name.trim() &&
      isEmailValid(form.email) &&
      form.education &&
      form.discipline.trim()
  );

  const canSave = profileComplete;

  const handleFieldChange = <K extends keyof Student>(
    key: K,
    value: Student[K]
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({
      ...current,
      [key as keyof FormErrors]: undefined,
    }));
    setStatusMessage(null);
  };

  const handleSave = () => {
    const nextErrors = buildErrors(form);
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
      programs: [],
    };

    const existing = JSON.parse(
      localStorage.getItem("pgp_students") || "[]"
    ) as Student[];
    const index = existing.findIndex(
      (student) => student.email === studentData.email
    );

    const updatedStudents = [...existing];
    if (index >= 0) {
      updatedStudents[index] = studentData;
    } else {
      updatedStudents.push(studentData);
    }

    localStorage.setItem("pgp_students", JSON.stringify(updatedStudents));
    localStorage.setItem("pgp_active_student_email", studentData.email);
    localStorage.setItem("pgp_session_email", studentData.email);

    setForm(emptyForm);
    setErrors({});
    setStatusMessage({
      type: "success",
      text: "Registration saved successfully. Redirecting to your dashboard...",
    });

    setTimeout(() => {
      router.push("/pgp/dashboard");
    }, 800);
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <section className="mx-auto mt-20 max-w-xl rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-6 sm:px-8">
          <p className="text-sm font-medium text-blue-600">PGP Registration</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">
            Student Registration
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Fill in the required details and save your registration to continue
            to the dashboard.
          </p>
        </div>

        <div className="space-y-8 px-6 py-6 sm:px-8">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-500">
                Profile Status
              </p>
              <p className="mt-2 text-xl font-semibold text-slate-900">
                {profileComplete ? "Complete" : "Incomplete"}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-500">
                Registration
              </p>
              <p className="mt-2 text-xl font-semibold text-slate-900">
                {profileComplete ? "Ready to Save" : "Pending"}
              </p>
            </div>
          </div>

          <form
            className="space-y-6"
            onSubmit={(event) => event.preventDefault()}
            noValidate
          >
  <div className="grid gap-5 sm:grid-cols-2">
    <div>
      <label htmlFor="fullName" className="text-sm font-medium text-slate-700">Full Name <span className="text-rose-600">*</span></label>
        <input id="fullName" value={form.name} onChange={(event) =>
          handleFieldChange("name", event.target.value)
          } placeholder="Enter full name" aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? "fullName-error" : undefined} className={inputClasses(Boolean(errors.name))}
        />
        {errors.name ? (
          <p id="fullName-error" className="mt-2 text-sm text-rose-600">{errors.name}</p>
        ) : null}
    </div>

    <div>
      <label htmlFor="email" className="text-sm font-medium text-slate-700">Email Address <span className="text-rose-600">*</span></label>
        <input id="email" type="email" value={form.email} onChange={(event) => handleFieldChange("email", event.target.value)}
          placeholder="Enter email address" aria-invalid={Boolean(errors.email)} aria-describedby={ errors.email ? "email-help email-error" : "email-help"}
          className={inputClasses(Boolean(errors.email))}
        />
        <p id="email-help" className="mt-2 text-xs text-slate-500"> This email will be used as the active student session.</p>
          {errors.email ? (
        <p id="email-error" className="mt-2 text-sm text-rose-600">{errors.email}</p>
          ) : null}
    </div>

    <div>
      <label htmlFor="education" className="text-sm font-medium text-slate-700">Education Background <span className="text-rose-600">*</span></label>
        
        <select id="education" value={form.education} onChange={(event) => handleFieldChange("education", event.target.value)}
         aria-invalid={Boolean(errors.education)} aria-describedby={ errors.education ? "education-error" : undefined } className={inputClasses(Boolean(errors.education))}
        >
          <option value="">Select education level</option>
          <option value="Bachelors">Bachelors</option>
          <option value="Masters">Masters</option>
          <option value="Intermediate">Intermediate</option>
          <option value="DAE">DAE</option>
        </select>
        
        {errors.education ? (
          <p id="education-error" className="mt-2 text-sm text-rose-600">{errors.education}</p>
          ) : null}

    </div>

      <div>
                <label
                  htmlFor="discipline"
                  className="text-sm font-medium text-slate-700"
                >
                  Discipline <span className="text-rose-600">*</span>
                </label>
                <input
                  id="discipline"
                  value={form.discipline}
                  onChange={(event) =>
                    handleFieldChange("discipline", event.target.value)
                  }
                  placeholder="Enter discipline"
                  aria-invalid={Boolean(errors.discipline)}
                  aria-describedby={
                    errors.discipline ? "discipline-error" : undefined
                  }
                  className={inputClasses(Boolean(errors.discipline))}
                />
                {errors.discipline ? (
                  <p
                    id="discipline-error"
                    className="mt-2 text-sm text-rose-600"
                  >
                    {errors.discipline}
                  </p>
                ) : null}
              </div>
            </div>
          </form>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 p-4">
              <h2 className="text-base font-semibold text-slate-900">
                Preview
              </h2>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-start justify-between gap-4">
                  <span className="text-slate-500">Student</span>
                  <span className="font-medium text-slate-900">
                    {form.name.trim() || "Not entered yet"}
                  </span>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <span className="text-slate-500">Discipline</span>
                  <span className="font-medium text-slate-900">
                    {form.discipline.trim() || "Not entered yet"}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <h2 className="text-base font-semibold text-slate-900">Notes</h2>
              <ul className="mt-4 space-y-2 text-sm text-slate-600">
                <li>Use a valid email address for the student session.</li>
                <li>Available programs will appear on the dashboard.</li>
              </ul>
            </div>
          </div>

          {statusMessage ? (
            <div
              className={`rounded-xl border px-4 py-3 text-sm ${
                statusMessage.type === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-rose-200 bg-rose-50 text-rose-700"
              }`}
              role={statusMessage.type === "success" ? "status" : "alert"}
              aria-live={
                statusMessage.type === "success" ? "polite" : "assertive"
              }
            >
              {statusMessage.text}
            </div>
          ) : null}

          <div className="flex flex-col gap-4 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              Required fields must be completed before saving.
            </p>

            <button
              type="button"
              onClick={handleSave}
              disabled={!canSave}
              className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              Save Registration
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
