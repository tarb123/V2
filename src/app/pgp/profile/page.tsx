"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import PortalShell from "../PortalShell";
import { Student } from "@/lib/pgp-data";

type ProfileStudent = Student & {
  dob?: string;
  nic?: string;
  gender?: string;
  cell?: string;
  image?: string;
};

type ProfileErrors = {
  cell?: string;
};

const emptyProfile: ProfileStudent = {
  name: "",
  email: "",
  education: "",
  discipline: "",
  programs: [],
  dob: "",
  nic: "",
  gender: "",
  cell: "",
  image: "",
};

function readActiveStudent(): ProfileStudent | null {
  if (typeof window === "undefined") return null;

  const saved = JSON.parse(
    localStorage.getItem("pgp_students") || "[]"
  ) as ProfileStudent[];

  const activeEmail =
    localStorage.getItem("pgp_active_student_email") ||
    localStorage.getItem("pgp_session_email");

  if (!saved.length) return null;
  if (!activeEmail) return saved[saved.length - 1] ?? null;

  return (
    saved.find(
      (student) => student.email?.toLowerCase() === activeEmail.toLowerCase()
    ) ??
    saved[saved.length - 1] ??
    null
  );
}

function getInitials(name?: string) {
  if (!name) return "PG";

  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (!parts.length) return "PG";

  return parts.map((part) => part[0]?.toUpperCase() || "").join("");
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileStudent>(emptyProfile);
  const [errors, setErrors] = useState<ProfileErrors>({});
  const [message, setMessage] = useState("");

  useEffect(() => {
    const activeStudent = readActiveStudent();

    if (activeStudent) {
      setProfile({
        ...emptyProfile,
        ...activeStudent,
        programs: activeStudent.programs || [],
      });
    }
  }, []);

  const completion = useMemo(() => {
    const fields = [
      profile.name,
      profile.email,
      profile.education,
      profile.discipline,
      profile.dob,
      profile.nic,
      profile.gender,
      profile.cell,
    ];

    return Math.round((fields.filter(Boolean).length / fields.length) * 100);
  }, [profile]);

  const handleChange = <K extends keyof ProfileStudent>(
    key: K,
    value: ProfileStudent[K]
  ) => {
    setProfile((current) => ({
      ...current,
      [key]: value,
    }));

    if (key === "cell") {
      setErrors((current) => ({ ...current, cell: undefined }));
    }

    setMessage("");
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      setProfile((current) => ({
        ...current,
        image: String(reader.result),
      }));
      setMessage("");
    };

    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!profile.cell?.trim()) {
      setErrors({ cell: "Cell number is required." });
      setMessage("Please complete required fields.");
      return;
    }

    const saved = JSON.parse(
      localStorage.getItem("pgp_students") || "[]"
    ) as ProfileStudent[];

    const updatedProfile: ProfileStudent = {
      ...profile,
      name: profile.name.trim(),
      email: profile.email.trim().toLowerCase(),
      education: profile.education.trim(),
      discipline: profile.discipline.trim(),
      dob: profile.dob?.trim(),
      nic: profile.nic?.trim(),
      gender: profile.gender,
      cell: profile.cell.trim(),
      programs: profile.programs || [],
    };

    const index = saved.findIndex(
      (student) =>
        student.email?.toLowerCase() === updatedProfile.email.toLowerCase()
    );

    const updatedStudents = [...saved];

    if (index >= 0) {
      updatedStudents[index] = updatedProfile;
    } else {
      updatedStudents.push(updatedProfile);
    }

    localStorage.setItem("pgp_students", JSON.stringify(updatedStudents));
    localStorage.setItem("pgp_active_student_email", updatedProfile.email);
    localStorage.setItem("pgp_session_email", updatedProfile.email);

    setProfile(updatedProfile);
    setErrors({});
    setMessage("Profile saved successfully.");
  };

  return (
    <PortalShell title="User Profile">
      <section className="bg-white p-5 shadow-sm md:p-6">
        <div className="mb-5 flex flex-col gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Student Profile
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-slate-800">
              Profile Overview
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage student identity and contact information.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSave}
            className="w-fit rounded-md bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            Save Profile
          </button>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[280px_1fr]">
          <aside className="bg-slate-50 p-5">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-md bg-white text-xl font-medium text-blue-700 shadow-sm">
                {profile.image ? (
                  <img
                    src={profile.image}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  getInitials(profile.name)
                )}
              </div>

              <label className="mt-4 cursor-pointer rounded-md bg-white px-4 py-2 text-sm text-slate-700 shadow-sm hover:bg-slate-100">
                Upload Picture
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>

              <h2 className="mt-4 text-base font-medium text-slate-800">
                {profile.name || "Student Name"}
              </h2>

              <p className="mt-1 break-all text-sm text-slate-500">
                {profile.email || "No email found"}
              </p>
            </div>

            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-slate-500">Profile Completion</span>
                <span className="text-slate-700">{completion}%</span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-blue-600"
                  style={{ width: `${completion}%` }}
                />
              </div>
            </div>

            <div className="mt-6 divide-y divide-slate-200 text-sm">
              <div className="flex justify-between py-3">
                <span className="text-slate-500">Courses</span>
                <span className="text-slate-700">
                  {profile.programs?.length || 0}
                </span>
              </div>

              <div className="flex justify-between py-3">
                <span className="text-slate-500">Status</span>
                <span className="text-emerald-600">Active</span>
              </div>
            </div>
          </aside>

          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-medium text-slate-800">
                Personal Information
              </h2>

              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm text-slate-600">
                    Full Name
                  </label>
                  <input
                    value={profile.name}
                    onChange={(event) =>
                      handleChange("name", event.target.value)
                    }
                    className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="Enter full name"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm text-slate-600">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(event) =>
                      handleChange("email", event.target.value)
                    }
                    className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="Enter email"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm text-slate-600">
                    Date Of Birth
                  </label>
                  <input
                    type="date"
                    value={profile.dob || ""}
                    onChange={(event) =>
                      handleChange("dob", event.target.value)
                    }
                    className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm text-slate-600">
                    NIC #
                  </label>
                  <input
                    value={profile.nic || ""}
                    onChange={(event) =>
                      handleChange("nic", event.target.value)
                    }
                    className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="Enter NIC number"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm text-slate-600">
                    Gender
                  </label>
                  <select
                    value={profile.gender || ""}
                    onChange={(event) =>
                      handleChange("gender", event.target.value)
                    }
                    className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">Select gender</option>
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm text-slate-600">
                    Cell# <span className="text-rose-600">*</span>
                  </label>
                  <input
                    value={profile.cell || ""}
                    onChange={(event) =>
                      handleChange("cell", event.target.value)
                    }
                    className={`h-11 w-full rounded-md border px-3 text-sm text-slate-800 outline-none focus:ring-2 ${
                      errors.cell
                        ? "border-rose-400 focus:border-rose-500 focus:ring-rose-100"
                        : "border-slate-300 focus:border-blue-500 focus:ring-blue-100"
                    }`}
                    placeholder="Enter cell number"
                  />
                  {errors.cell ? (
                    <p className="mt-1 text-sm text-rose-600">
                      {errors.cell}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-medium text-slate-800">
                Academic Information
              </h2>

              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm text-slate-600">
                    Education Background
                  </label>
                  <input
                    value={profile.education}
                    onChange={(event) =>
                      handleChange("education", event.target.value)
                    }
                    className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="Enter education"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm text-slate-600">
                    Discipline
                  </label>
                  <input
                    value={profile.discipline}
                    onChange={(event) =>
                      handleChange("discipline", event.target.value)
                    }
                    className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="Enter discipline"
                  />
                </div>
              </div>
            </div>

            {message ? (
              <p
                className={`rounded-md px-3 py-2 text-sm ${
                  message.includes("successfully")
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-rose-50 text-rose-700"
                }`}
              >
                {message}
              </p>
            ) : null}

            <div className="flex justify-end border-t border-slate-200 pt-5">
              <button
                type="button"
                onClick={handleSave}
                className="rounded-md bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
              >
                Save Profile
              </button>
            </div>
          </div>
        </div>
      </section>
    </PortalShell>
  );
}