"use client";

import React, { useMemo, useState } from "react";

/** ---------------- Types ---------------- */

type Proficiency = "Beginner" | "Intermediate" | "Advanced";
type SkillType = "Technical" | "Soft";

type SkillRequirement = {
  id: string;
  name: string;
  type: SkillType;
  requiredLevel: Proficiency;
  weight?: number;
};

type JobRole = {
  id: string;
  fieldId: string;
  title: string;
  description: string;
  skills: SkillRequirement[];
};

type CareerField = {
  id: string;
  name: string;
  shortDesc?: string;
};

type UserSkill = {
  id: string;
  name: string;
  level: Proficiency;
  type: SkillType;
  source?: "Profile" | "Assessment";
};

type JobOpening = {
  id: string;
  roleId: string;
  title: string;
  company: string;
  location: string;
  isRemote?: boolean;
};

type MatchResult = {
  matchPercent: number;
  missingSkills: SkillRequirement[];
  weakSkills: Array<{ skill: SkillRequirement; userLevel: Proficiency; delta: number }>;
  recommendedLearningPath: Array<{ skillName: string; targetLevel: Proficiency; steps: string[] }>;
  recommendedOpenings: JobOpening[];
};

const PROF_TO_NUM: Record<Proficiency, number> = {
  Beginner: 1,
  Intermediate: 2,
  Advanced: 3,
};

function normalizeSkillName(s: string): string {
  return s.trim().toLowerCase();
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function getSkillScore(user: Proficiency | null, required: Proficiency): number {
  if (!user) return 0;
  const u = PROF_TO_NUM[user];
  const r = PROF_TO_NUM[required];
  if (u >= r) return 1;
  return clamp(u / r, 0, 0.999);
}

function buildLearningSteps(skillName: string, fromLevel: Proficiency, toLevel: Proficiency, type: SkillType): string[] {
  const from = PROF_TO_NUM[fromLevel];
  const to = PROF_TO_NUM[toLevel];
  const steps: string[] = [];

  steps.push(`Identify a learning roadmap for ${skillName} (${type}).`);
  if (from < 2 && to >= 2) steps.push("Complete beginner fundamentals + small exercises.");
  if (from < 3 && to >= 3) steps.push("Build 1–2 projects/case studies to demonstrate competency.");
  steps.push("Validate with a short assessment + add evidence to your profile (projects/certs/work).");

  if (from >= to) steps.unshift("You already meet the requirement — keep it fresh with practice.");
  return steps;
}

function computeMatch(role: JobRole, userSkills: UserSkill[], openings: JobOpening[], minOpeningMatchPercent = 60): MatchResult {
  const userMap = new Map<string, UserSkill>();
  for (const us of userSkills) userMap.set(normalizeSkillName(us.name), us);

  const missingSkills: SkillRequirement[] = [];
  const weakSkills: Array<{ skill: SkillRequirement; userLevel: Proficiency; delta: number }> = [];

  let totalWeight = 0;
  let weightedScoreSum = 0;

  for (const req of role.skills) {
    const w = req.weight ?? 1;
    totalWeight += w;

    const user = userMap.get(normalizeSkillName(req.name)) ?? null;
    const score = getSkillScore(user?.level ?? null, req.requiredLevel);
    weightedScoreSum += score * w;

    if (!user) {
      missingSkills.push(req);
    } else if (PROF_TO_NUM[user.level] < PROF_TO_NUM[req.requiredLevel]) {
      weakSkills.push({
        skill: req,
        userLevel: user.level,
        delta: PROF_TO_NUM[req.requiredLevel] - PROF_TO_NUM[user.level],
      });
    }
  }

  const matchPercent = totalWeight === 0 ? 0 : Math.round((weightedScoreSum / totalWeight) * 100);

  const recommendedLearningPath = [
    ...missingSkills.map((s) => ({
      skillName: s.name,
      targetLevel: s.requiredLevel,
      steps: buildLearningSteps(s.name, "Beginner", s.requiredLevel, s.type),
    })),
    ...weakSkills.map((w) => ({
      skillName: w.skill.name,
      targetLevel: w.skill.requiredLevel,
      steps: buildLearningSteps(w.skill.name, w.userLevel, w.skill.requiredLevel, w.skill.type),
    })),
  ].slice(0, 10);

  const recommendedOpenings =
    matchPercent >= minOpeningMatchPercent ? openings.filter((o) => o.roleId === role.id) : [];

  return { matchPercent, missingSkills, weakSkills, recommendedLearningPath, recommendedOpenings };
}

/** ---------------- Mock Data ---------------- */

const MOCK_FIELDS: CareerField[] = [
  { id: "it", name: "IT", shortDesc: "Software, systems, data, networks" },
  { id: "hr", name: "HR", shortDesc: "People ops, recruitment, policies" },
  { id: "finance", name: "Finance", shortDesc: "Accounting, analysis, FP&A" },
  { id: "marketing", name: "Marketing", shortDesc: "Growth, content, brand" },
  { id: "engineering", name: "Engineering", shortDesc: "Civil, mechanical, electrical" },
  { id: "medical", name: "Medical", shortDesc: "Clinical and healthcare roles" },
  { id: "education", name: "Education", shortDesc: "Teaching, training, curriculum" },
];

const MOCK_ROLES: JobRole[] = [
  {
    id: "role_fe",
    fieldId: "it",
    title: "Frontend Developer",
    description: "Build responsive interfaces, collaborate with designers, and ensure UX quality.",
    skills: [
      { id: "s1", name: "HTML/CSS", type: "Technical", requiredLevel: "Advanced", weight: 1.2 },
      { id: "s2", name: "JavaScript/TypeScript", type: "Technical", requiredLevel: "Advanced", weight: 1.4 },
      { id: "s3", name: "React", type: "Technical", requiredLevel: "Advanced", weight: 1.4 },
      { id: "s4", name: "Git", type: "Technical", requiredLevel: "Intermediate" },
      { id: "s5", name: "Communication", type: "Soft", requiredLevel: "Intermediate" },
      { id: "s6", name: "Problem Solving", type: "Soft", requiredLevel: "Intermediate" },
    ],
  },
  {
    id: "role_hr",
    fieldId: "hr",
    title: "HR Generalist",
    description: "Support HR operations, hiring coordination, documentation, and employee lifecycle processes.",
    skills: [
      { id: "s7", name: "Recruitment", type: "Technical", requiredLevel: "Intermediate", weight: 1.2 },
      { id: "s8", name: "HR Policies", type: "Technical", requiredLevel: "Intermediate" },
      { id: "s9", name: "Excel", type: "Technical", requiredLevel: "Intermediate" },
      { id: "s10", name: "Stakeholder Management", type: "Soft", requiredLevel: "Advanced", weight: 1.2 },
      { id: "s11", name: "Communication", type: "Soft", requiredLevel: "Advanced", weight: 1.2 },
    ],
  },
];

const MOCK_OPENINGS: JobOpening[] = [
  { id: "j1", roleId: "role_fe", title: "Frontend Developer", company: "Sanjeeda Labs", location: "Karachi", isRemote: true },
  { id: "j2", roleId: "role_hr", title: "HR Generalist", company: "Conductivity Consultancy", location: "Karachi", isRemote: false },
];

const DEFAULT_USER_SKILLS: UserSkill[] = [
  { id: "1", name: "React", level: "Intermediate", type: "Technical", source: "Profile" },
  { id: "2", name: "JavaScript/TypeScript", level: "Intermediate", type: "Technical", source: "Assessment" },
  { id: "3", name: "HTML/CSS", level: "Advanced", type: "Technical", source: "Profile" },
  { id: "4", name: "Communication", level: "Intermediate", type: "Soft", source: "Assessment" },
  { id: "5", name: "Git", level: "Beginner", type: "Technical", source: "Profile" },
];

/** ---------------- Tiny UI Primitives (Tailwind) ---------------- */

function Card(props: { title?: string; desc?: string; children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      {(props.title || props.desc || props.right) && (
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            {props.title && <div className="text-base font-semibold">{props.title}</div>}
            {props.desc && <div className="text-sm text-gray-500">{props.desc}</div>}
          </div>
          {props.right}
        </div>
      )}
      {props.children}
    </div>
  );
}

function Badge(props: { children: React.ReactNode; variant?: "solid" | "outline" | "muted" }) {
  const variant = props.variant ?? "outline";
  const cls =
    variant === "solid"
      ? "bg-black text-white"
      : variant === "muted"
        ? "bg-gray-100 text-gray-700 border border-gray-200"
        : "bg-white text-gray-800 border border-gray-200";
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${cls}`}>{props.children}</span>;
}

function Button(props: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "solid" | "outline" }) {
  const v = props.variant ?? "solid";
  const cls =
    v === "solid"
      ? "bg-black text-white hover:bg-black/90"
      : "bg-white border border-gray-200 hover:bg-gray-50";
  return (
    <button
      {...props}
      className={`rounded-xl px-3 py-2 text-sm font-medium transition disabled:opacity-50 ${cls} ${props.className ?? ""}`}
    />
  );
}

function ProgressBar({ value }: { value: number }) {
  const v = clamp(value, 0, 100);
  return (
    <div className="h-1 w-full rounded-full bg-gray">
      <div className="h-1 rounded-full bg-white" style={{ width: `${v}%` }} />
    </div>
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: Array<{ label: string; value: string }>;
}) {
  return (
    <select
      value={value}
      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChange(e.target.value)}
      className="w-full rounded-xl border border-gray-200 bg-white text-black px-3 py-2 text-sm"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

/** ---------------- Component ---------------- */

export default function EducationTab() 
{  const [fields] = useState<CareerField[]>(MOCK_FIELDS);
  const [roles] = useState<JobRole[]>(MOCK_ROLES);
  const [userSkills, setUserSkills] = useState<UserSkill[]>(DEFAULT_USER_SKILLS);

  const [activeFieldId, setActiveFieldId] = useState<string | null>(null);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);

  const [search, setSearch] = useState<string>("");

  const [skillFilter, setSkillFilter] = useState<"all" | SkillType>("all");
  const [showOnlyMissing, setShowOnlyMissing] = useState<boolean>(false);

  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);

  const activeField = useMemo(
    () => fields.find((f) => f.id === activeFieldId) ?? null,
    [fields, activeFieldId]
  );

  const selectedRole = useMemo(
    () => roles.find((r) => r.id === selectedRoleId) ?? null,
    [roles, selectedRoleId]
  );

  const userMap = useMemo(() => {
    const m = new Map<string, UserSkill>();
    for (const s of userSkills) m.set(normalizeSkillName(s.name), s);
    return m;
  }, [userSkills]);

  const fieldRoles = useMemo(() => {
    const list = roles.filter((r) => (activeFieldId ? r.fieldId === activeFieldId : true));
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter((r) => r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q));
  }, [roles, activeFieldId, search]);

  const roleSkills = useMemo(() => {
    if (!selectedRole) return [];
    let list = selectedRole.skills;
    if (skillFilter !== "all") list = list.filter((s) => s.type === skillFilter);
    if (showOnlyMissing) list = list.filter((req) => !userMap.has(normalizeSkillName(req.name)));
    return list;
  }, [selectedRole, skillFilter, showOnlyMissing, userMap]);

  function goBack(): void {
    if (selectedRoleId) {
      setSelectedRoleId(null);
      setMatchResult(null);
      return;
    }
    if (activeFieldId) {
      setActiveFieldId(null);
      setSearch("");
      setMatchResult(null);
    }
  }

  function onMatchProfile(): void {
    if (!selectedRole) return;
    setMatchResult(computeMatch(selectedRole, userSkills, MOCK_OPENINGS, 60));
  }

  function addUserSkill(): void {
    setUserSkills((prev) => [
      ...prev, 
      { 
        id: Date.now().toString(), 
        name: "New Skill", 
        level: "Beginner", 
        type: "Technical", 
        source: "Profile" 
      }
    ]);
  }

  function updateUserSkill(idx: number, patch: Partial<UserSkill>): void {
    setUserSkills((prev) => prev.map((s, i) => (i === idx ? { ...s, ...patch } : s)));
  }

  function removeUserSkill(idx: number): void {
    setUserSkills((prev) => prev.filter((_, i) => i !== idx));
  }

return (
  <div className="min-h-screen w-full bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 text-slate-100">
    {/* Top header / hero */}
<div className="border-b border-white/10 bg-gradient-to-b from-slate-200 to-slate-400 text-black pt-15 md:pt-20">
  <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-8 lg:px-8">
    <div className="flex flex-col gap-3">
      <div className="space-y-2">
        {/* <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-600 sm:text-xs">
          Career Explorer
        </p> */}
<h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
  Education
</h1>

        {(activeFieldId || selectedRoleId) && (
          <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
            {activeFieldId && (
              <span className="rounded-full bg-white/70 px-3 py-1 text-slate-800">
                {activeField?.name ?? "Field"}
              </span>
            )}
            {selectedRoleId && (
              <span className="rounded-full bg-white/70 px-3 py-1 text-slate-800">
                {selectedRole?.title ?? "Role"}
              </span>
            )}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center rounded-full bg-emerald-400 px-2 py-1 text-xs font-bold text-slate-950">
            Skill Matching Engine
          </span>
        </div>

        <ol className="space-y-1 text-xs font-sans font-semibold sm:text-sm">
          <li className="before:mr-1 before:content-['✔'] before:text-emerald-600 before:animate-pulse before:drop-shadow-[0_0_6px_rgba(255,255,255,0.95)]">
            Explore career fields & job roles
          </li>
          <li className="before:mr-1 before:content-['✔'] before:text-emerald-600 before:animate-pulse before:drop-shadow-[0_0_6px_rgba(255,255,255,0.95)]">
            Compare your skills
          </li>
          <li className="before:mr-1 before:content-['✔'] before:text-emerald-600 before:animate-pulse before:drop-shadow-[0_0_6px_rgba(255,255,255,0.95)]">
            Generate a skill-gap report with match percentage
          </li>
        </ol>
      </div>
    </div>
  </div>
</div>

    {/* Main layout */}
    <div className="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-12">
        {/* LEFT: Main content */}
        <div className="space-y-6 lg:col-span-8">
          {/* Main Card */}
          <div className="rounded-2xl border border-white/10 bg-slate-200 shadow-[0_1px_0_0_rgba(255,255,255,0.06)]">
            <div className="border-b border-slate-300 p-4 sm:p-5">
              <div className="flex flex-col gap-4">
                <div>
                  <div className="text-sm font-sans font-semibold text-slate-950">
                    {selectedRole
                      ? "Job Role Details"
                      : activeField
                        ? `${activeField.name} — Job Roles`
                        : "Career Fields"}
                  </div>

                  <div className="text-lg font-sans font-semibold text-slate-950 sm:text-xl">
                    {selectedRole
                      ? selectedRole.title
                      : activeField
                        ? "Select a role to view skills"
                        : "Choose a career domain"}
                  </div>

                  <div className="mt-1 text-sm font-sans text-emerald-700">
                    {selectedRole
                      ? "Review required skills, compare your profile, and run Match Profile."
                      : activeField
                        ? "Browse roles inside this field."
                        : "Pick a domain to explore available job roles."}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {(activeFieldId || selectedRoleId) && (
                      <button
                        type="button"
                        onClick={goBack}
                        aria-label="Back"
                        className="before:text-3xl inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900/90 before:content-['<'] before:text-white before:animate-pulse before:drop-shadow-[0_0_6px_rgba(255,255,255,0.95)]"
                      />
                    )}

                    <button
                      type="button"
                      aria-label="Reset"
                      onClick={() => {
                        setActiveFieldId(null);
                        setSelectedRoleId(null);
                        setSearch("");
                        setMatchResult(null);
                      }}
                      className="before:text-3xl inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900/90 before:content-['>'] before:text-white before:animate-pulse before:drop-shadow-[0_0_6px_rgba(255,255,255,0.95)]"
                    />
                  </div>

                  {selectedRole && (
                    <button
                      type="button"
                      onClick={onMatchProfile}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-200/30"
                    >
                      <span aria-hidden="true">✨</span>
                      Match Profile
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-5">
              {/* Search (hide inside role view) */}
              {!selectedRole && (
                <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center">
                  <div className="relative w-full">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      🔎
                    </span>
                    <input
                      aria-label={activeField ? "Search roles" : "Search fields or roles"}
                      value={search}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                      placeholder={activeField ? "Search roles..." : "Search fields or roles..."}
                      className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-slate-300"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="rounded-xl border border-white/10 bg-green-300 px-3 py-2 text-sm font-sans font-medium text-green-800 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-white/15"
                  >
                    Clear
                  </button>
                </div>
              )}

              {/* Fields Grid */}
              {!activeFieldId && !selectedRole && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {fields
                    .filter((f) => {
                      const q = search.trim().toLowerCase();
                      if (!q) return true;
                      return (
                        f.name.toLowerCase().includes(q) ||
                        (f.shortDesc ?? "").toLowerCase().includes(q)
                      );
                    })
                    .map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setActiveFieldId(f.id)}
                        className="group text-left"
                      >
                        <div className="rounded-xl border border-white/10 bg-blue-950 p-4 transition hover:border-white/20 hover:bg-blue-950/70 focus:outline-none focus:ring-2 focus:ring-white/15">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <div className="text-base font-semibold text-white">
                                {f.name}
                              </div>
                              <div className="mt-1 text-xs text-slate-300">
                                {f.shortDesc}
                              </div>
                            </div>

                            <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200 group-hover:bg-white/10">
                              Browse →
                            </span>
                          </div>
                        </div>
                      </button>
                    ))}
                </div>
              )}

              {/* Roles List */}
              {activeFieldId && !selectedRole && (
                <div className="space-y-4">
                  {fieldRoles.map((r) => (
                    <div
                      key={r.id}
                      className="rounded-xl border border-white/10 bg-blue-950 p-4 transition hover:border-white/20 hover:bg-blue-950/70"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <div className="truncate text-base font-semibold text-white">
                              {r.title}
                            </div>
                            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200">
                              {activeField?.name ?? r.fieldId}
                            </span>
                          </div>

                          <p className="mt-1 text-xs text-slate-300">
                            {r.description}
                          </p>

                          <div className="mt-3 flex flex-wrap gap-2">
                            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200">
                              {r.skills.length} skills
                            </span>
                            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200">
                              {r.skills.filter((s) => s.type === "Technical").length} technical
                            </span>
                            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200">
                              {r.skills.filter((s) => s.type === "Soft").length} soft
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setSelectedRoleId(r.id)}
                          className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-white/30"
                        >
                          Open
                        </button>
                      </div>
                    </div>
                  ))}

                  {fieldRoles.length === 0 && (
                    <div className="rounded-2xl border border-white/10 bg-blue-950 p-4 text-sm text-slate-100">
                      No roles found.
                    </div>
                  )}
                </div>
              )}

              {/* Role view: filters + requirements */}
              {selectedRole && (
                <div className="space-y-5">
                  {/* Filters row */}
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                      <div className="w-full sm:w-56">
                        <label className="mb-1 block text-xs font-semibold text-slate-900">
                          Filter skills
                        </label>

                        <Select
                          value={skillFilter}
                          onChange={(v: string) => setSkillFilter(v as "all" | SkillType)}
                          options={[
                            { label: "All skills", value: "all" },
                            { label: "Technical", value: "Technical" },
                            { label: "Soft", value: "Soft" },
                          ]}
                        />
                      </div>

                      <label className="flex items-center gap-2 pt-1 text-xs text-black sm:pt-5">
                        <input
                          aria-label="Show only missing skills"
                          type="checkbox"
                          checked={showOnlyMissing}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setShowOnlyMissing(e.target.checked)
                          }
                          className="h-4 w-4 rounded border-white/20 bg-white/5 focus:ring-2 focus:ring-white/15"
                        />
                        Show only missing
                      </label>
                    </div>
                  </div>

                  {/* Skill requirement list */}
                  <div className="space-y-3">
                    {roleSkills.map((req) => {
                      const u = userMap.get(normalizeSkillName(req.name)) ?? null;
                      const score = getSkillScore(u?.level ?? null, req.requiredLevel);
                      const percent = Math.round(score * 100);

                      const status =
                        !u ? "Missing" : percent === 100 ? "Matched" : "Partial";

                      return (
                        <div
                          key={req.id}
                          className="rounded-xl border border-white/10 bg-blue-950 p-3"
                        >
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <div className="truncate text-sm font-semibold text-white">
                                  {req.name}
                                </div>
                                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200">
                                  {req.type}
                                </span>
                                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200">
                                  Required: {req.requiredLevel}
                                </span>
                                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200">
                                  Yours: {u ? u.level : "None"}
                                </span>
                              </div>
                            </div>

                            <span
                              className={
                                "shrink-0 rounded-full px-3 py-1 text-xs font-semibold " +
                                (!u
                                  ? "border border-rose-400/20 bg-rose-400/15 text-rose-300"
                                  : percent === 100
                                    ? "border border-emerald-400/20 bg-emerald-400/15 text-emerald-300"
                                    : "border border-amber-400/20 bg-amber-400/15 text-amber-300")
                              }
                            >
                              {u ? `${percent}% • ${status}` : "Missing"}
                            </span>
                          </div>

                          <div className="mt-3">
                            <ProgressBar value={u ? percent : 0} />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Skill profile editor */}
                  <div className="mt-2 rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="text-base font-semibold text-black font-sans">
                          Your Skill Profile
                        </div>
                        <div className="text-sm text-black font-sans">
                          Edit your skills (demo). In production, connect this to profile + assessments.
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={addUserSkill}
                        className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/15"
                      >
                        Add
                      </button>
                    </div>

                    <div className="mt-4 space-y-3">
                      {userSkills.map((s, idx) => (
                        <div
                          key={idx}
                          className="rounded-xl border border-white/10 bg-slate-300 p-3"
                        >
                          <div className="grid gap-3 md:grid-cols-12 md:items-center">
                            <div className="md:col-span-5">
                              <label className="mb-1 block text-xs font-semibold text-black">
                                Skill name
                              </label>
                              <input
                                value={s.name}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                  updateUserSkill(idx, { name: e.target.value })
                                }
                                className="w-full rounded-xl border border-white/10 bg-white px-3 py-2 text-sm text-black placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-white/15"
                                placeholder="e.g. React"
                              />
                            </div>

                            <div className="md:col-span-3">
                              <label className="mb-1 block text-xs font-semibold text-black">
                                Type
                              </label>
                              <Select
                                value={s.type}
                                onChange={(v: string) =>
                                  updateUserSkill(idx, { type: v as SkillType })
                                }
                                options={[
                                  { label: "Technical", value: "Technical" },
                                  { label: "Soft", value: "Soft" },
                                ]}
                              />
                            </div>

                            <div className="md:col-span-3">
                              <label className="mb-1 block text-xs font-semibold text-black">
                                Level
                              </label>
                              <Select
                                value={s.level}
                                onChange={(v: string) =>
                                  updateUserSkill(idx, { level: v as Proficiency })
                                }
                                options={[
                                  { label: "Beginner", value: "Beginner" },
                                  { label: "Intermediate", value: "Intermediate" },
                                  { label: "Advanced", value: "Advanced" },
                                ]}
                              />
                            </div>

                            <div className="md:col-span-1 md:flex md:justify-end">
                              <button
                                type="button"
                                onClick={() => removeUserSkill(idx)}
                                className="group mt-1 inline-flex w-full items-center justify-center px-3 py-2 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/15 md:mt-6 md:w-auto"
                                aria-label="Remove skill"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  className="h-6 w-6 group-hover:fill-white"
                                  aria-hidden="true"
                                >
                                  <path d="M18.36 5.64a1.5 1.5 0 0 0-2.12 0L12 9.88 7.76 5.64a1.5 1.5 0 1 0-2.12 2.12L9.88 12l-4.24 4.24a1.5 1.5 0 1 0 2.12 2.12L12 14.12l4.24 4.24a1.5 1.5 0 0 0 2.12-2.12L14.12 12l4.24-4.24a1.5 1.5 0 0 0 0-2.12Z" />
                                </svg>
                              </button>
                            </div>

                            <div className="flex flex-wrap gap-2 pt-1 md:col-span-12">
                              <span className="rounded-full border border-white/10 bg-white px-3 py-1 text-xs text-black">
                                Source: {s.source ?? "Profile"}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Match results */}
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="text-base font-semibold text-black font-sans">
                          Match Results
                        </div>
                        <div className="text-sm text-black font-sans">
                          Generated after clicking “Match Profile”.
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={onMatchProfile}
                        className="inline-flex items-center justify-center rounded-xl bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-200/30"
                      >
                        Recalculate
                      </button>
                    </div>

                    {!matchResult ? (
                      <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/30 p-4 text-sm text-slate-300">
                        Click <span className="font-semibold text-white">Match Profile</span> to generate results.
                      </div>
                    ) : (
                      <div className="mt-3 space-y-5">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-sans font-bold text-green-700">
                            Match Percentage
                          </div>
                          <span
                            className={
                              "rounded-full px-3 py-1 text-xs font-semibold " +
                              (matchResult.matchPercent >= 80
                                ? "border border-emerald-400/20 bg-emerald-600/100 text-white-100"
                                : matchResult.matchPercent >= 60
                                  ? "border border-amber-400/20 bg-amber-400 text-amber-100"
                                  : "border border-rose-400/20 bg-rose-400 text-rose-100")
                            }
                          >
                            {matchResult.matchPercent}%
                          </span>
                        </div>

                        <ProgressBar value={matchResult.matchPercent} />

                        <div className="grid gap-2 sm:grid-cols-3">
                          <div className="rounded-2xl border border-white/10 bg-slate-300 p-4">
                            <div className="text-xs font-bold text-black">Missing Skills</div>
                            <div className="mt-1 text-2xl font-bold text-black">
                              {matchResult.missingSkills.length}
                            </div>
                          </div>
                          <div className="rounded-2xl border border-white/10 bg-slate-300 p-4">
                            <div className="text-xs font-bold text-black">Weak Skills</div>
                            <div className="mt-1 text-2xl font-bold text-black">
                              {matchResult.weakSkills.length}
                            </div>
                          </div>
                          <div className="rounded-2xl border border-white/10 bg-slate-300 p-4">
                            <div className="text-xs font-bold text-black">Openings</div>
                            <div className="mt-1 text-2xl font-bold text-black">
                              {matchResult.recommendedOpenings.length}
                            </div>
                          </div>
                        </div>

                        {/* Gaps */}
                        <div className="space-y-3">
                          <div className="text-sm font-sans font-bold text-black">
                            Skill Gaps
                          </div>

                          {matchResult.missingSkills.length === 0 &&
                          matchResult.weakSkills.length === 0 ? (
                            <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4 text-sm text-slate-300">
                              No gaps — you meet or exceed all requirements.
                            </div>
                          ) : (
                            <>
                              {matchResult.missingSkills.length > 0 && (
                                <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                                  <div className="text-xs font-semibold text-white">Missing</div>
                                  <div className="mt-2 flex flex-wrap gap-2">
                                    {matchResult.missingSkills.map((s) => (
                                      <span
                                        key={s.id}
                                        className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-sans text-white"
                                      >
                                        {s.name} • {s.requiredLevel}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {matchResult.weakSkills.length > 0 && (
                                <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                                  <div className="text-xs font-semibold text-slate-200">
                                    Needs improvement
                                  </div>
                                  <div className="mt-3 space-y-2">
                                    {matchResult.weakSkills.map((w) => (
                                      <div
                                        key={w.skill.id}
                                        className="rounded-2xl border border-white/10 bg-slate-950/40 p-4"
                                      >
                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                          <div className="font-semibold font-sans text-white">
                                            {w.skill.name}
                                          </div>
                                          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-black">
                                            Δ {w.delta}
                                          </span>
                                        </div>
                                        <div className="mt-2 flex flex-wrap gap-2 text-xs">
                                          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-200">
                                            Yours: {w.userLevel}
                                          </span>
                                          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-200">
                                            Required: {w.skill.requiredLevel}
                                          </span>
                                          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-200">
                                            {w.skill.type}
                                          </span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </>
                          )}
                        </div>

                        {/* Learning path */}
                        <div className="space-y-3">
                          <div className="text-sm font-sans font-bold text-black">
                            Recommended Learning Path
                          </div>

                          {matchResult.recommendedLearningPath.length === 0 ? (
                            <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4 text-sm text-slate-300">
                              No learning steps needed.
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {matchResult.recommendedLearningPath.map((p) => (
                                <div
                                  key={p.skillName}
                                  className="rounded-2xl border border-white/10 bg-slate-950/30 p-4"
                                >
                                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="font-semibold text-white">{p.skillName}</div>
                                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-sans text-white">
                                      Target: {p.targetLevel}
                                    </span>
                                  </div>
                                  <ol className="mt-2 list-disc space-y-1 pl-4 text-xs text-white">
                                    {p.steps.map((step, i) => (
                                      <li key={i}>{step}</li>
                                    ))}
                                  </ol>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Openings */}
                        <div className="space-y-3">
                          <div className="text-sm font-sans font-bold text-black">
                            Suggested Job Openings
                          </div>

                          {matchResult.recommendedOpenings.length === 0 ? (
                            <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4 text-sm text-slate-300">
                              No openings shown (match below threshold or none available).
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {matchResult.recommendedOpenings.map((o) => (
                                <div
                                  key={o.id}
                                  className="flex flex-col gap-3 rounded-xl border border-white/10 bg-slate-950/30 p-4 sm:flex-row sm:items-start sm:justify-between"
                                >
                                  <div>
                                    <div className="font-semibold text-white">{o.title}</div>
                                    <div className="mt-1 text-xs text-white">
                                      {o.company} • {o.location} • {o.isRemote ? "Remote" : "On-site"}
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    className="rounded-xl border border-white/10 bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/15"
                                  >
                                    View
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: Sticky side panel */}
        <div className="space-y-4 lg:col-span-4 lg:space-y-6">
          <div className="space-y-4 lg:sticky lg:top-6 lg:space-y-6">
            {/* Quick actions */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5">
              <div className="text-base font-semibold text-white">Quick Navigation</div>
              <p className="mt-1 text-sm text-slate-300">
                Jump between views quickly.
              </p>

              <div className="mt-4 space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveFieldId(null);
                    setSelectedRoleId(null);
                    setSearch("");
                    setMatchResult(null);
                  }}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/15"
                >
                  All Career Fields
                </button>

                {activeFieldId && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRoleId(null);
                      setMatchResult(null);
                    }}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/15"
                  >
                    {activeField?.name ?? "Field"} Roles
                  </button>
                )}

                {selectedRole && (
                  <button
                    type="button"
                    onClick={onMatchProfile}
                    className="w-full rounded-xl bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-200/30"
                  >
                    ✨ Match Profile
                  </button>
                )}
              </div>
            </div>

            {/* Profile summary */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5">
              <div className="text-base font-semibold text-white">Profile Snapshot</div>
              <p className="mt-1 text-sm text-slate-300">
                Keep your skill list updated for accurate matching.
              </p>

              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-3">
                  <div className="text-xs text-slate-300">Skills</div>
                  <div className="mt-1 text-xl font-semibold text-white">{userSkills.length}</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-3">
                  <div className="text-xs text-slate-300">Technical</div>
                  <div className="mt-1 text-xl font-semibold text-white">
                    {userSkills.filter((s) => s.type === "Technical").length}
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-3">
                  <div className="text-xs text-slate-300">Soft</div>
                  <div className="mt-1 text-xl font-semibold text-white">
                    {userSkills.filter((s) => s.type === "Soft").length}
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/30 p-4 text-sm text-slate-300">
                Tip: Keep skill naming consistent (e.g.{" "}
                <span className="font-semibold text-white">JavaScript/TypeScript</span>) to improve matching accuracy.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
}