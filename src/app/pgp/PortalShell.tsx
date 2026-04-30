"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";

type StudentSnapshot = {
  name?: string;
  email?: string;
  education?: string;
  discipline?: string;
  programs?: string[];
  image?: string;
};

type NavItem = {
  label: string;
  icon: string;
  href?: string;
  disabled?: boolean;
};

type NavSection = {
  title: string;
  items: NavItem[];
};

const navSections: NavSection[] = [
  {
    title: "Menu",
    items: [
      {
        label: "Dashboard",
        icon: "⌂",
        href: "/pgp/dashboard",
      },
      {
        label: "My Courses",
        icon: "▤",
        href: "/pgp/my-courses",
      },
    ],
  },
  {
    title: "Registration",
    items: [
      {
        label: "Online Register",
        icon: "◉",
        href: "/pgp/online-register",
      },
    ],
  },
  {
    title: "Account",
    items: [
      {
        label: "Profile",
        icon: "◌",
        href: "/pgp/profile",
      },
      {
        label: "Attendance",
        icon: "◷",
        disabled: true,
      },
    ],
  },
];

function readActiveStudent(): StudentSnapshot | null {
  if (typeof window === "undefined") return null;

  const saved = JSON.parse(
    localStorage.getItem("pgp_students") || "[]"
  ) as StudentSnapshot[];

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

function isItemActive(pathname: string, href?: string) {
  if (!href) return false;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavItems({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav aria-label="Portal navigation" className="space-y-7">
      {navSections.map((section) => (
        <div key={section.title}>
          <p className="px-3 text-[11px] uppercase tracking-wide text-slate-400">
            {section.title}
          </p>

          <div className="mt-2 space-y-1">
            {section.items.map((item) => {
              const active = isItemActive(pathname, item.href);

              if (item.disabled || !item.href) {
                return (
                  <div
                    key={item.label}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-400"
                    aria-disabled="true"
                  >
                    <span className="w-5 text-center text-base">
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                    <span className="ml-auto text-[11px] text-slate-500">
                      Soon
                    </span>
                  </div>
                );
              }

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                    active
                      ? "bg-slate-100 text-slate-900"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <span className="w-5 text-center text-base">
                    {item.icon}
                  </span>
                  <span>{item.label}</span>

                  {item.label === "My Courses" ||
                  item.label === "Online Register" ? (
                    <span className="ml-auto text-slate-400">›</span>
                  ) : null}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

export default function PortalShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [student, setStudent] = useState<StudentSnapshot | null>(null);
  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    setStudent(readActiveStudent());
  }, [pathname]);

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const headerDate = useMemo(() => {
    return now.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  }, [now]);

  const headerTime = useMemo(() => {
    return now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }, [now]);

  const initials = getInitials(student?.name);
  const studentName = student?.name || "Guest Student";
  const studentEmail = student?.email || "No email found";
  const myCourses = student?.programs || [];

  const handleSignOut = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("pgp_session_email");
    localStorage.removeItem("pgp_active_student_email");

    setProfileOpen(false);
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <div className="flex min-h-screen">
        <aside className="hidden w-[270px] shrink-0 bg-white lg:block">
          <div className="flex min-h-screen flex-col border-r border-slate-200">
            <div className="px-6 py-6">
              <p className="text-xs uppercase tracking-wide text-slate-400">
                User Portal
              </p>

              <h1 className="mt-1 text-lg font-medium leading-6 text-slate-900">
                Professional Grooming Program
              </h1>
            </div>

            <div className="px-4">
              <NavItems pathname={pathname} />
            </div>

            <div className="mt-auto border-t border-slate-200 px-4 py-4">
              <button
                type="button"
                onClick={handleSignOut}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              >
                <span className="w-5 text-center">↩</span>
                <span>Sign out</span>
              </button>
            </div>
          </div>
        </aside>

        {mobileOpen ? (
          <div
            className="fixed inset-0 z-40 bg-slate-900/30 lg:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <div
              className="h-full w-[86%] max-w-[300px] bg-white shadow-xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    User Portal
                  </p>
                  <h2 className="mt-1 text-base font-medium text-slate-900">
                    PGP Menu
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100"
                  aria-label="Close navigation menu"
                >
                  ✕
                </button>
              </div>

              <div className="px-4 py-5">
                <NavItems
                  pathname={pathname}
                  onNavigate={() => setMobileOpen(false)}
                />
              </div>
            </div>
          </div>
        ) : null}

        {profileOpen ? (
          <div
            className="fixed inset-0 z-50 bg-slate-900/25"
            onClick={() => setProfileOpen(false)}
          >
            <div
              className="ml-auto h-full w-full max-w-sm bg-white shadow-xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                <h3 className="text-base font-medium text-slate-900">
                  Student Details
                </h3>

                <button
                  type="button"
                  onClick={() => setProfileOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100"
                  aria-label="Close user details"
                >
                  ✕
                </button>
              </div>

              <div className="px-5 py-5">
                <div className="flex items-center gap-4 rounded-lg bg-slate-50 p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-md bg-blue-50 text-sm font-medium text-blue-700">
                    {initials}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {studentName}
                    </p>
                    <p className="mt-0.5 break-all text-xs text-slate-500">
                      {studentEmail}
                    </p>
                  </div>
                </div>

                <div className="mt-5 divide-y divide-slate-100">
                  <div className="py-3">
                    <p className="text-xs text-slate-400">Education</p>
                    <p className="mt-1 text-sm text-slate-700">
                      {student?.education || "Not added"}
                    </p>
                  </div>

                  <div className="py-3">
                    <p className="text-xs text-slate-400">Discipline</p>
                    <p className="mt-1 text-sm text-slate-700">
                      {student?.discipline || "Not added"}
                    </p>
                  </div>

                  <div className="py-3">
                    <p className="text-xs text-slate-400">Courses</p>
                    <p className="mt-1 text-sm text-slate-700">
                      {myCourses.length} selected
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSignOut}
                  className="mt-5 w-full rounded-md bg-slate-900 px-4 py-2.5 text-sm text-white hover:bg-blue-600"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        ) : null}

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 bg-white">
            <div className="border-b border-slate-200 px-4 py-3 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setMobileOpen(true)}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 lg:hidden"
                    aria-label="Open navigation menu"
                  >
                    ☰
                  </button>

                  <div className="min-w-0">
                    <h2 className="truncate text-base font-medium text-slate-900">
                      {title}
                    </h2>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {headerDate} · {headerTime}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setProfileOpen(true)}
                  className="flex items-center gap-3 rounded-md px-2 py-1.5 hover:bg-slate-50"
                  aria-label="Open user details"
                >
                  <div className="hidden text-right sm:block">
                    <p className="text-sm text-slate-700">{studentName}</p>
                    <p className="text-xs text-slate-400">Student</p>
                  </div>

                  <span className="flex h-9 w-9 items-center justify-center rounded-md bg-blue-50 text-xs font-medium text-blue-700">
                    {initials}
                  </span>
                </button>
              </div>
            </div>
          </header>

          <main id="pgp-main" className="flex-1 px-4 py-5 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}