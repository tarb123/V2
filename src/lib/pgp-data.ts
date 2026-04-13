export type Student = {
  name: string;
  email: string;
  education: string;
  discipline: string;
  programs: string[];
};

export type Program = {
  name: string;
  status: "offered" | "not offered";
};

export type Course = {
  code: string;
  name: string;
  startDate: string;
  duration: string;
  mentors: string;
  areas: string;
  skills: string;
};

export const programs: Program[] = [
  { name: "HR Talent Pipeline", status: "offered" },
  { name: "Pharmaceuticals Sales", status: "not offered" },
  { name: "IT", status: "not offered" },
];

export const courseData: Record<string, Course> = {
  "HR Talent Pipeline": {
    code: "XYZ",
    name: "HR Talent Pipeline",
    startDate: "01 May 2026",
    duration: "03 Months",
    mentors: "Senior HR Experts",
    areas: "Recruitment, Talent Management, HR Analytics",
    skills: "Soft: Communication, Leadership | Hard: HR Tools, ATS",
  },
};