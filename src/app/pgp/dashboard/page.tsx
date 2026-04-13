"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PortalShell from "../PortalShell";
import StudentDashboard from "../StudentDashboard";

export default function PGPDashboardPage() {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const sessionEmail = localStorage.getItem("pgp_session_email");
    const students = JSON.parse(localStorage.getItem("pgp_students") || "[]");

    if (!token || !sessionEmail) {
      router.replace("/login");
      return;
    }

    const isRegistered = students.some(
      (student: { email?: string }) =>
        student.email?.toLowerCase() === sessionEmail.toLowerCase()
    );

    if (!isRegistered) {
      router.replace("/pgp");
      return;
    }

    localStorage.setItem("pgp_active_student_email", sessionEmail);
    setAllowed(true);
  }, [router]);

  if (!allowed) {
    return null;
  }

  return (
    <PortalShell title="PGP Dashboard">
      <StudentDashboard />
    </PortalShell>
  );
}