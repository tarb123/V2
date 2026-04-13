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
  href?: string;
  badge?: string;
  disabled?: boolean;
};

type NavSection = {
  title: string;
  items: NavItem[];
};

const navSections: NavSection[] = [
  {
    title: "Main",
    items: [{ label: "Dashboard", href: "/pgp/dashboard", badge: "Home" }],
  },
  {
    title: "Registration",
    items: [{ label: "PGP Courses", href: "/pgp", badge: "Open" }],
  },
  {
    title: "Account",
    items: [
      { label: "Profile", href: "/pgp/profile" },
      { label: "Attendance & Schedule", disabled: true, badge: "Soon" },
    ],
  },
];

function readActiveStudent(): StudentSnapshot | null {
  if (typeof window === "undefined") return null;

  const saved = JSON.parse(
    localStorage.getItem("pgp_students") || "[]"
  ) as StudentSnapshot[];
  const activeEmail = localStorage.getItem("pgp_active_student_email");

  if (!saved.length) return null;
  if (!activeEmail) return saved[saved.length - 1] ?? null;

  return (
    saved.find((student) => student.email === activeEmail) ??
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
  if (href === "/pgp") return pathname === "/pgp";
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
    <nav className="space-y-6" aria-label="Portal navigation">
      {navSections.map((section) => (
        <div key={section.title}>
          <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
            {section.title}
          </p>

          <div className="mt-3 space-y-2">
            {section.items.map((item) => {
              const active = isItemActive(pathname, item.href);
              const baseClass = active
                ? "bg-white/12 text-white ring-1 ring-white/15"
                : "text-slate-300 hover:bg-white/8 hover:text-white";

              if (item.disabled || !item.href) {
                return (
                  <div
                    key={`${section.title}-${item.label}`}
                    className="flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium text-slate-500"
                    aria-disabled="true"
                  >
                    <span>{item.label}</span>
                    {item.badge ? (
                      <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                        {item.badge}
                      </span>
                    ) : null}
                  </div>
                );
              }

              return (
                <Link
                  key={`${section.title}-${item.label}`}
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-medium transition ${baseClass}`}
                >
                  <span>{item.label}</span>
                  {item.badge ? (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                        active
                          ? "bg-blue-500/20 text-blue-100"
                          : "bg-white/10 text-slate-300"
                      }`}
                    >
                      {item.badge}
                    </span>
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
      weekday: "long",
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  }, [now]);

  const headerTime = useMemo(() => {
    return now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  }, [now]);

  const initials = getInitials(student?.name);
  const studentName = student?.name || "Guest Student";
  const studentEmail = student?.email || "No email found";

  const handleSignOut = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("pgp_session_email");
    localStorage.removeItem("pgp_active_student_email");
    setProfileOpen(false);
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="flex min-h-screen">
        <aside className="hidden w-[290px] shrink-0 border-r border-slate-200 bg-slate-950 text-white lg:block">
          <div className="border-b border-white/10 px-7 py-8">
            <p className="mt-20 text-xs font-semibold uppercase tracking-[0.24em] text-blue-300">
              User Portal
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white">
              Professional Grooming Program
            </h1>
          </div>

          <div className="px-5 py-6">
            <NavItems pathname={pathname} />
          </div>
        </aside>

        {mobileOpen ? (
          <div
            className="fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <div
              className="h-full w-[88%] max-w-[320px] border-r border-slate-200 bg-slate-950 px-5 py-6 text-white shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-start justify-between border-b border-white/10 pb-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-300">
                    User Portal
                  </p>
                  <h2 className="mt-2 text-xl font-semibold tracking-tight text-white">
                    PGP Navigation
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-lg text-slate-300 transition hover:bg-white/10 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="mt-6">
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
    className="fixed inset-0 z-50 bg-slate-950/35"
    onClick={() => setProfileOpen(false)}
  >
    <div
      className="ml-auto h-full w-full max-w-sm bg-white shadow-2xl"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <h3 className="text-lg font-semibold text-slate-900">
          User Details
        </h3>

        <button
          type="button"
          onClick={() => setProfileOpen(false)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
        >
          ✕
        </button>
      </div>

      <div className="px-5 py-6">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-100 text-xl font-bold text-teal-600">
              {initials}
            </div>

            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                Student
              </p>
              <p className="mt-1 truncate text-lg font-bold text-slate-900">
                {studentName}
              </p>
              <p className="mt-1 break-all text-sm text-slate-500">
                {student?.email || "No email found"}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              User Name
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-900">
              {studentName}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              Email
            </p>
            <p className="mt-2 break-all text-sm font-semibold text-slate-900">
              {student?.email || "No email found"}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
) : null}

  <div className="flex min-w-0 flex-1 flex-col">
  <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
            <div className="px-4 py-4 sm:px-6 lg:px-8">
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-start gap-3">
                  <button
                    type="button"
                    onClick={() => setMobileOpen(true)}
                    className="mt-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 lg:hidden"
                    aria-label="Open navigation menu"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setProfileOpen(true)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-cyan-100 text-sm font-bold text-teal-600"
                >
                  {initials}
                </button>
              </div>

<div className="-mt-14 lg:mt-10 ml-auto flex flex-col items-end gap-0 text-right">
  <div className="inline-flex items-center justify-end gap-2 text-[11px] lg:px-3 lg:py-1 lg:text-base -lg:mb-4">
    <span className="font-bold text-blue-500">Welcome,</span>
    <span className="font-bold uppercase text-slate-600">
      {studentName}
    </span>

    <button
      type="button"
      onClick={() => setProfileOpen(true)}
      className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-cyan-100 text-[10px] font-bold text-teal-600 lg:h-9 lg:w-9 lg:text-sm"
      aria-label="Open user details"
    >
      {initials}
    </button>
  </div>

  <div className="inline-flex items-center justify-end gap-2 py-2 text-[11px] text-black lg:px-3 lg:py-2 lg:text-sm">
    <span className="font-bold text-blue-500">{headerDate}</span>
    <span className="font-bold tracking-wide">{headerTime}</span>
  </div>
</div>
            </div>
          </header>

          <main id="pgp-main" className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </main>
  </div>
      </div>
    </div>
  );
}