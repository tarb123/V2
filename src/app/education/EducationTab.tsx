"use client";

import React, { useMemo, useState } from "react";
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

type SubDepartment = {
  id: string;
  fieldId: string;
  name: string;
  roles: JobRole[];
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
  { id: "hr", name: "HR", shortDesc: "People ops, recruitment, policies" },
  { id: "finance", name: "Finance", shortDesc: "Accounting, analysis, FP&A" },
  { id: "sales", name: "Sales", shortDesc: "Revenue, client acquisition, accounts"},
  { id: "marketing", name: "Marketing", shortDesc: "Growth, content, brand" },
  { id: "customer_relation", name: "Customer Relation", shortDesc: "Service, communication, public engagement" },
  { id: "supply_chain_management", name: "Supply Chain Management", shortDesc: "Procurement, logistics, inventory, production" },
  { id: "it", name: "IT", shortDesc: "Software, systems, data, networks" },
  { id: "product_innovation", name: "Product & Innovation", shortDesc: "Product strategy, roadmap, innovation" },
{ id: "program_delivery_management", name: "Program & Delivery Management", shortDesc: "Projects, PMO, portfolio delivery" },
{ id: "operations_process_excellence", name: "Operations & Process Excellence", shortDesc: "Business analysis, process improvement, governance" },
  { id: "engineering", name: "Engineering", shortDesc: "Civil, mechanical, electrical" },
  { id: "medical", name: "Medical", shortDesc: "Clinical and healthcare roles" },
  { id: "education", name: "Education", shortDesc: "Teaching, training, curriculum" },
];

const HR_DEPARTMENT_CONTENT = [
  {
    id: "hr_talent_acquisition",
    name: "Talent Acquisition",
    roles: [
      {
        title: "HR Intern",
        skills: ["CV screening", "Job posting", "Interview coordination", "HR documentation"],
      },
      {
        title: "TA Officer",
        skills: ["Candidate sourcing", "Interview scheduling", "Database management", "Offer drafting"],
      },
      {
        title: "Senior TA Specialist",
        skills: ["Employer branding", "Bulk hiring", "Stakeholder coordination", "Recruitment analytics"],
      },
      {
        title: "TA Manager",
        skills: ["Workforce planning", "Recruitment budgeting", "Team supervision", "Policy compliance"],
      },
      {
        title: "Head of TA",
        skills: ["Hiring strategy", "Employer brand leadership", "Executive hiring", "Talent pipeline development"],
      },
    ],
  },
  {
    id: "hr_comp_benefits",
    name: "Compensation & Benefits",
    roles: [
      {
        title: "HR Assistant",
        skills: ["Payroll data entry", "Leave records", "Benefits documentation", "Excel reporting"],
      },
      {
        title: "C&B Officer",
        skills: ["Salary processing", "EOBI/SESSI handling", "Tax deductions", "Employee queries"],
      },
      {
        title: "Senior Analyst",
        skills: ["Salary benchmarking", "Incentive planning", "Benefits cost analysis", "HRIS reporting"],
      },
      {
        title: "Compensation Manager",
        skills: ["Pay structure design", "Policy formulation", "Compliance oversight", "Budgeting"],
      },
      {
        title: "Head of Compensation",
        skills: ["Reward strategy", "Executive compensation planning", "Regulatory alignment", "Financial control"],
      },
    ],
  },
  {
    id: "hr_org_dev",
    name: "Organizational Development",
    roles: [
      {
        title: "Coordinator",
        skills: ["Training logistics", "Feedback collection", "Documentation", "HR reporting"],
      },
      {
        title: "OD Officer",
        skills: ["Performance appraisal support", "Competency mapping", "Employee surveys", "Data analysis"],
      },
      {
        title: "OD Specialist",
        skills: ["KPI framework design", "Succession planning", "Engagement strategy", "Change support"],
      },
      {
        title: "OD Manager",
        skills: ["Organizational restructuring", "Leadership development", "Performance governance", "HR strategy alignment"],
      },
      {
        title: "Head of OD",
        skills: ["Culture transformation", "Workforce strategy", "Executive advisory", "Organizational effectiveness"],
      },
    ],
  },
  {
    id: "hr_payroll",
    name: "Payroll Management",
    roles: [
      {
        title: "Assistant",
        skills: ["Attendance verification", "Data entry", "Pay slip preparation", "Record maintenance"],
      },
      {
        title: "Officer",
        skills: ["Salary calculation", "Overtime processing", "Tax deduction", "Compliance filing"],
      },
      {
        title: "Senior Executive",
        skills: ["Payroll reconciliation", "Statutory compliance", "Audit coordination", "MIS reports"],
      },
      {
        title: "Payroll Manager",
        skills: ["Payroll system control", "Risk management", "Policy enforcement", "Team supervision"],
      },
    ],
  },
  {
    id: "hr_change_management",
    name: "Change Management",
    roles: [
      {
        title: "Officer",
        skills: ["Change documentation", "Training coordination"],
      },
      {
        title: "Manager",
        skills: ["Change strategy", "Stakeholder engagement"],
      },
      {
        title: "Head",
        skills: ["Organizational transformation leadership"],
      },
    ],
  },
  {
    id: "hr_compliance",
    name: "Compliance",
    roles: [
      {
        title: "Officer",
        skills: ["Regulatory documentation", "Monitoring reports", "Policy implementation", "Compliance checks"],
      },
      {
        title: "Executive",
        skills: ["Regulatory filing", "Audit coordination", "Compliance tracking", "Risk documentation"],
      },
      {
        title: "Senior Specialist",
        skills: ["Regulatory advisory", "Internal control review", "Policy drafting", "Compliance analytics"],
      },
      {
        title: "Manager",
        skills: ["Compliance framework development", "Regulatory communication", "Team oversight", "Risk mitigation"],
      },
      {
        title: "Chief Compliance Officer",
        skills: ["Regulatory governance", "Compliance strategy", "Institutional oversight", "Legal"],
      },
    ],
  },
  {
    id: "hr_legal_affairs",
    name: "Legal Affairs",
    roles: [
      {
        title: "Officer",
        skills: ["Contract review", "Case documentation"],
      },
      {
        title: "Senior",
        skills: ["Legal drafting", "Compliance review"],
      },
      {
        title: "Manager",
        skills: ["Litigation management"],
      },
      {
        title: "Head",
        skills: ["Corporate legal governance"],
      },
    ],
  },
];

const FINANCE_DEPARTMENT_CONTENT = [
  {
    id: "finance_corporate_finance",
    name: "Corporate Finance",
    roles: [
      {
        title: "Finance Executive",
        skills: ["Voucher entry", "Bank reconciliation", "Ledger posting", "Reporting"],
      },
      {
        title: "Financial Analyst",
        skills: ["Budget preparation", "Financial modeling", "Variance analysis", "Forecasting"],
      },
      {
        title: "Senior Analyst",
        skills: ["Cost optimization", "Financial planning", "Capital budgeting", "Performance review"],
      },
      {
        title: "Finance Manager",
        skills: ["Budget control", "Team supervision", "Compliance management", "Cash flow oversight"],
      },
      {
        title: "Finance Director",
        skills: ["Capital structure planning", "Financial strategy", "Board reporting", "Risk control"],
      },
      {
        title: "CFO",
        skills: ["Corporate finance leadership", "Investor relations", "Governance oversight", "Enterprise risk strategy"],
      },
    ],
  },
  {
    id: "finance_fpa",
    name: "Financial Planning & Analysis (FP&A)",
    roles: [
      {
        title: "Executive",
        skills: ["Data consolidation", "Budget templates", "Excel modeling", "Reporting support"],
      },
      {
        title: "Analyst",
        skills: ["Forecasting", "Cost analysis", "KPI tracking", "Performance dashboards"],
      },
      {
        title: "Senior Analyst",
        skills: ["Financial scenario planning", "Margin analysis", "Strategic insights", "Management reporting"],
      },
      {
        title: "FP&A Manager",
        skills: ["Financial planning cycle management", "Budgeting strategy", "Variance control", "Stakeholder reporting"],
      },
      {
        title: "Finance Director",
        skills: ["Long-term financial planning", "Capital allocation", "Strategic financial oversight", "Board presentation"],
      },
    ],
  },
  {
    id: "finance_taxation",
    name: "Taxation",
    roles: [
      {
        title: "Assistant",
        skills: ["Tax filing support", "Documentation", "Data compilation", "FBR portal handling"],
      },
      {
        title: "Officer",
        skills: ["Income tax returns", "Sales tax filing", "Withholding tax compliance", "Audit support"],
      },
      {
        title: "Senior Consultant",
        skills: ["Tax advisory", "Compliance review", "Risk assessment", "Client handling"],
      },
      {
        title: "Tax Manager",
        skills: ["Tax planning", "Regulatory compliance", "Audit defense", "Team supervision"],
      },
      {
        title: "Head of Tax",
        skills: ["Corporate tax strategy", "Policy compliance", "Regulatory engagement", "Financial risk control"],
      },
    ],
  },
  {
    id: "finance_treasury",
    name: "Treasury",
    roles: [
      {
        title: "Officer",
        skills: ["Bank coordination", "Payment processing", "Liquidity tracking", "Documentation"],
      },
      {
        title: "Analyst",
        skills: ["Cash flow forecasting", "Fund allocation", "Risk assessment", "Banking reconciliation"],
      },
      {
        title: "Senior Analyst",
        skills: ["Investment planning", "Debt management", "Financial risk mitigation", "Reporting"],
      },
      {
        title: "Treasury Manager",
        skills: ["Liquidity strategy", "Banking negotiations", "Capital management", "Compliance oversight"],
      },
    ],
  },
  {
    id: "finance_risk_management",
    name: "Risk Management",
    roles: [
      {
        title: "Officer",
        skills: ["Risk documentation", "Compliance monitoring", "Reporting support", "Policy review"],
      },
      {
        title: "Analyst",
        skills: ["Risk assessment models", "Operational risk analysis", "Audit coordination", "Mitigation planning"],
      },
      {
        title: "Senior Analyst",
        skills: ["Enterprise risk mapping", "Regulatory risk analysis", "Fraud detection", "Reporting"],
      },
      {
        title: "Risk Manager",
        skills: ["Risk framework design", "Compliance governance", "Team supervision", "Strategic oversight"],
      },
      {
        title: "Head of Risk",
        skills: ["Enterprise risk leadership", "Governance advisory", "Regulatory liaison", "Crisis management"],
      },
    ],
  },
  {
    id: "finance_commercial_banking",
    name: "Commercial Banking",
    roles: [
      {
        title: "Banking Officer",
        skills: ["Account opening", "Cash handling", "KYC verification", "Customer servicing"],
      },
      {
        title: "Relationship Officer",
        skills: ["Deposit mobilization", "Loan processing", "Client coordination", "Target achievement"],
      },
      {
        title: "Senior RM",
        skills: ["Corporate portfolio handling", "Credit assessment", "Risk evaluation", "Revenue growth"],
      },
      {
        title: "Branch Manager",
        skills: ["Branch operations control", "Team supervision", "Compliance management", "Sales strategy"],
      },
      {
        title: "Regional Manager",
        skills: ["Multi-branch oversight", "Performance monitoring", "Regulatory compliance", "Strategic planning"],
      },
    ],
  },
  {
    id: "finance_corporate_banking",
    name: "Corporate Banking",
    roles: [
      {
        title: "Credit Officer",
        skills: ["Financial statement analysis", "Credit proposals", "Risk grading", "Documentation"],
      },
      {
        title: "RM",
        skills: ["Corporate client handling", "Loan structuring", "Negotiation", "Portfolio growth"],
      },
      {
        title: "Senior RM",
        skills: ["Large exposure management", "Syndicate financing", "Credit risk assessment", "Compliance review"],
      },
      {
        title: "Manager",
        skills: ["Corporate portfolio supervision", "Revenue planning", "Risk mitigation", "Team leadership"],
      },
      {
        title: "Head",
        skills: ["Corporate banking strategy", "Credit governance", "Regulatory liaison", "Institutional growth"],
      },
    ],
  },
  {
    id: "finance_islamic_banking",
    name: "Islamic Banking",
    roles: [
      {
        title: "Officer",
        skills: ["Account management", "Islamic product handling", "Documentation"],
      },
      {
        title: "Shariah Officer",
        skills: ["Shariah audit", "Product compliance", "Reporting", "Regulatory coordination"],
      },
      {
        title: "Senior Manager",
        skills: ["Islamic financing portfolio", "Product structuring (Murabaha, Ijarah)", "Risk monitoring"],
      },
      {
        title: "Head",
        skills: ["Shariah governance", "Islamic banking strategy", "Regulatory alignment", "Product development"],
      },
    ],
  },
  {
    id: "finance_microfinance",
    name: "Microfinance",
    roles: [
      {
        title: "Loan Officer",
        skills: ["Field verification", "Loan disbursement", "Recovery follow-up", "Client assessment"],
      },
      {
        title: "Credit Officer",
        skills: ["Credit analysis", "Portfolio tracking", "Documentation control", "Compliance"],
      },
      {
        title: "Branch Manager",
        skills: ["Microfinance operations", "Team supervision", "Recovery management", "Risk control"],
      },
      {
        title: "Regional Manager",
        skills: ["Regional loan portfolio oversight", "Policy compliance", "Performance monitoring"],
      },
    ],
  },
  {
    id: "finance_insurance",
    name: "Insurance",
    roles: [
      {
        title: "Officer",
        skills: ["Policy issuance", "Documentation", "Client servicing", "Premium calculation"],
      },
      {
        title: "Underwriter",
        skills: ["Risk evaluation", "Policy pricing", "Claim review", "Compliance"],
      },
      {
        title: "Senior Underwriter",
        skills: ["Complex risk assessment", "Reinsurance coordination", "Portfolio review"],
      },
      {
        title: "Manager",
        skills: ["Insurance operations control", "Team leadership", "Regulatory compliance"],
      },
      {
        title: "Head",
        skills: ["Insurance product strategy", "Underwriting governance", "Risk framework oversight"],
      },
    ],
  },
];

const SALES_DEPARTMENT_CONTENT = [
  {
    id: "sales_general",
    name: "Sales",
    roles: [
      {
        title: "Executive",
        skills: ["Client visits", "Order booking", "Sales reporting", "Target achievement"],
      },
      {
        title: "Senior Exec",
        skills: ["Key account handling", "Negotiation", "Revenue tracking", "CRM management"],
      },
      {
        title: "Supervisor",
        skills: ["Field team monitoring", "Sales planning", "Territory management"],
      },
      {
        title: "Manager",
        skills: ["Sales strategy", "Revenue forecasting", "Performance review", "Channel expansion"],
      },
      {
        title: "Head",
        skills: ["National sales planning", "Pricing strategy", "Distribution governance"],
      },
    ],
  },
  {
    id: "sales_corporate",
    name: "Corporate Sales",
    roles: [
      {
        title: "Officer",
        skills: ["Corporate client approach", "Proposal drafting", "CRM updates"],
      },
      {
        title: "KAM",
        skills: ["Contract negotiation", "Account growth", "Client retention"],
      },
      {
        title: "Senior KAM",
        skills: ["Strategic partnerships", "Portfolio expansion", "Revenue planning"],
      },
      {
        title: "Manager",
        skills: ["Corporate sales governance", "Target setting", "Team leadership"],
      },
    ],
  },
  {
    id: "sales_business_development",
    name: "Business Development",
    roles: [
      {
        title: "Executive",
        skills: ["Market visits", "Proposal drafting", "Client prospecting"],
      },
      {
        title: "Officer",
        skills: ["Deal negotiation", "Pipeline management", "Revenue forecasting"],
      },
      {
        title: "Manager",
        skills: ["Market expansion strategy", "Partnership development", "Financial projections"],
      },
      {
        title: "Head",
        skills: ["Growth strategy", "Strategic alliances", "Diversification planning"],
      },
    ],
  },
];

const MARKETING_DEPARTMENT_CONTENT = [
  {
    id: "marketing_general",
    name: "Marketing",
    roles: [
      {
        title: "Executive",
        skills: ["Campaign execution", "Social media handling", "Reporting"],
      },
      {
        title: "Officer",
        skills: ["Branding support", "Digital ads management", "Market analysis"],
      },
      {
        title: "Manager",
        skills: ["Marketing strategy", "Campaign budgeting", "Team supervision"],
      },
      {
        title: "Head",
        skills: ["Corporate branding", "Market positioning", "Revenue growth strategy"],
      },
    ],
  },
  {
    id: "marketing_brand_management",
    name: "Brand Management",
    roles: [
      {
        title: "Executive",
        skills: ["Brand monitoring", "Competitor analysis", "Campaign support"],
      },
      {
        title: "Officer",
        skills: ["Brand positioning", "Media coordination", "Product launches"],
      },
      {
        title: "Manager",
        skills: ["Brand strategy development", "ATL/BTL planning", "Budget control"],
      },
      {
        title: "Head",
        skills: ["Corporate brand governance", "Brand equity management"],
      },
    ],
  },
  {
    id: "marketing_market_research",
    name: "Market Research",
    roles: [
      {
        title: "Executive",
        skills: ["Data collection", "Surveys", "Field coordination"],
      },
      {
        title: "Analyst",
        skills: ["Data analysis", "SPSS usage", "Reporting"],
      },
      {
        title: "Senior Analyst",
        skills: ["Consumer insights", "Forecasting", "Statistical modeling"],
      },
      {
        title: "Manager",
        skills: ["Research strategy", "Client reporting", "Team leadership"],
      },
    ],
  },
  {
    id: "marketing_digital_marketing",
    name: "Digital Marketing",
    roles: [
      {
        title: "Digital Marketing Specialist",
        skills: [
          "Digital strategy development",
          "Campaign management",
          "SEO optimization",
          "Paid ads management",
          "Content planning",
          "Email marketing",
        ],
      },
      {
        title: "SEO Executive / Manager",
        skills: [
          "SEO strategy",
          "Technical SEO audits",
          "Content optimization",
          "Competitor analysis",
        ],
      },
      {
        title: "Social Media Executive",
        skills: [
          "Social media strategy",
          "Campaign design",
          "Influencer coordination",
          "Analytics tracking",
          "Content posting",
          "Community management",
          "Engagement monitoring",
        ],
      },
    ],
  },
];

const CUSTOMER_RELATION_DEPARTMENT_CONTENT = [
  {
    id: "cr_public_relations",
    name: "Public Relations",
    roles: [
      {
        title: "Officer",
        skills: ["Press release drafting", "Media coordination"],
      },
      {
        title: "Executive",
        skills: ["Event coverage", "Brand communication", "Crisis support"],
      },
      {
        title: "Manager",
        skills: ["Media strategy", "Corporate communication planning"],
      },
      {
        title: "Head",
        skills: ["Reputation management", "Communication governance"],
      },
    ],
  },
  {
    id: "cr_customer_service",
    name: "Customer Service",
    roles: [
      {
        title: "CSR",
        skills: ["Complaint handling", "Call logging", "Customer queries"],
      },
      {
        title: "Senior CSR",
        skills: ["Escalation handling", "Reporting", "Service monitoring"],
      },
      {
        title: "Supervisor",
        skills: ["Team monitoring", "Quality checks", "Performance reporting"],
      },
      {
        title: "Manager",
        skills: ["Service policy development", "Customer retention strategy"],
      },
    ],
  },
  {
    id: "cr_call_center_ops",
    name: "Call Center Operations",
    roles: [
      {
        title: "Agent",
        skills: ["Inbound/outbound calls", "CRM updates", "Issue resolution"],
      },
      {
        title: "Team Leader",
        skills: ["Team monitoring", "KPI tracking", "Coaching"],
      },
      {
        title: "Floor Manager",
        skills: ["Shift management", "Performance control"],
      },
      {
        title: "Operations Manager",
        skills: ["Call center strategy", "SLA compliance"],
      },
    ],
  },
];

const SUPPLY_CHAIN_DEPARTMENT_CONTENT = [
  {
    id: "scm_procurement",
    name: "Procurement",
    roles: [
      {
        title: "Officer",
        skills: ["Vendor sourcing", "Quotation comparison", "Purchase orders"],
      },
      {
        title: "Senior Officer",
        skills: ["Contract negotiation", "Cost analysis", "Vendor evaluation"],
      },
      {
        title: "Manager",
        skills: ["Procurement planning", "Supplier management", "Compliance"],
      },
      {
        title: "Head",
        skills: ["Strategic sourcing", "Cost optimization", "Policy governance"],
      },
    ],
  },
  {
    id: "scm_logistics",
    name: "Logistics",
    roles: [
      {
        title: "Officer",
        skills: ["Shipment tracking", "Dispatch planning", "Documentation"],
      },
      {
        title: "Senior Officer",
        skills: ["Route planning", "Freight negotiation", "Cost monitoring"],
      },
      {
        title: "Manager",
        skills: ["Logistics network management", "Vendor contracts", "Risk control"],
      },
    ],
  },
  {
    id: "scm_inventory_management",
    name: "Inventory Management",
    roles: [
      {
        title: "Store Officer",
        skills: ["Stock entry", "GRN handling", "Stock audits"],
      },
      {
        title: "Controller",
        skills: ["Inventory reconciliation", "Stock forecasting", "ERP tracking"],
      },
      {
        title: "Manager",
        skills: ["Warehouse operations", "Stock optimization", "Risk mitigation"],
      },
    ],
  },
  {
    id: "scm_manufacturing",
    name: "Manufacturing",
    roles: [
      {
        title: "Officer",
        skills: ["Line supervision", "Machine monitoring", "Quality checks"],
      },
      {
        title: "Senior Officer",
        skills: ["Output planning", "Workforce allocation"],
      },
      {
        title: "Manager",
        skills: ["Production scheduling", "Cost control", "Compliance"],
      },
      {
        title: "Plant Manager",
        skills: ["Factory operations", "Capacity planning", "Safety governance"],
      },
    ],
  },
  {
    id: "scm_production",
    name: "Production",
    roles: [
      {
        title: "Executive",
        skills: ["Line operation", "Reporting", "Safety compliance"],
      },
      {
        title: "Supervisor",
        skills: ["Shift management", "Quality monitoring"],
      },
      {
        title: "Manager",
        skills: ["Output planning", "Workforce control"],
      },
    ],
  },
  {
    id: "scm_quality_assurance",
    name: "Quality Assurance",
    roles: [
      {
        title: "Officer",
        skills: ["Quality checks", "SOP compliance"],
      },
      {
        title: "Analyst",
        skills: ["Process audits", "Defect analysis"],
      },
      {
        title: "Manager",
        skills: ["QA framework implementation", "Compliance monitoring"],
      },
      {
        title: "Head",
        skills: ["Quality governance", "ISO compliance strategy"],
      },
    ],
  },
  {
    id: "scm_quality_control",
    name: "Quality Control",
    roles: [
      {
        title: "Inspector",
        skills: ["Material inspection", "Testing"],
      },
      {
        title: "Supervisor",
        skills: ["Process monitoring", "Reporting"],
      },
      {
        title: "Manager",
        skills: ["Quality standards enforcement"],
      },
    ],
  },
  {
    id: "scm_lean_management",
    name: "Lean Management",
    roles: [
      {
        title: "Officer",
        skills: ["Process mapping", "Waste analysis"],
      },
      {
        title: "Specialist",
        skills: ["Kaizen implementation", "KPI tracking"],
      },
      {
        title: "Manager",
        skills: ["Continuous improvement strategy"],
      },
    ],
  },
];

const IT_DEPARTMENT_CONTENT = [
  {
    id: "it_web_development",
    name: "Web Development",
    roles: [
      {
        title: "Junior",
        skills: ["HTML", "CSS", "Debugging"],
      },
      {
        title: "Developer",
        skills: ["Frontend coding", "Backend coding", "API integration"],
      },
      {
        title: "Senior",
        skills: ["Architecture design", "Code optimization"],
      },
      {
        title: "Manager",
        skills: ["Project planning", "Team leadership"],
      },
    ],
  },
  {
    id: "it_mobile_app_development",
    name: "Mobile App Development",
    roles: [
      {
        title: "Junior",
        skills: ["Flutter basics", "Android basics", "Debugging"],
      },
      {
        title: "Developer",
        skills: ["API integration", "UI development"],
      },
      {
        title: "Senior",
        skills: ["Architecture planning", "Performance optimization"],
      },
      {
        title: "Manager",
        skills: ["Mobile strategy", "Release management"],
      },
    ],
  },
  {
    id: "it_business_intelligence",
    name: "Business Intelligence",
    roles: [
      {
        title: "Executive",
        skills: ["Data cleaning", "Dashboard support"],
      },
      {
        title: "Analyst",
        skills: ["SQL queries", "Power BI", "Reporting"],
      },
      {
        title: "Senior",
        skills: ["Data modeling", "KPI tracking"],
      },
      {
        title: "Manager",
        skills: ["BI strategy", "Analytics governance"],
      },
    ],
  },
  {
    id: "it_artificial_intelligence",
    name: "Artificial Intelligence",
    roles: [
      {
        title: "Engineer",
        skills: ["Python", "ML models", "Data preprocessing"],
      },
      {
        title: "Senior",
        skills: ["Model deployment", "Deep learning"],
      },
      {
        title: "Manager",
        skills: ["AI project leadership", "Solution strategy"],
      },
    ],
  },
  {
    id: "it_cloud_computing",
    name: "Cloud Computing",
    roles: [
      {
        title: "Engineer",
        skills: ["AWS setup", "Azure setup", "Deployment"],
      },
      {
        title: "Senior",
        skills: ["Cloud architecture", "Security"],
      },
      {
        title: "Manager",
        skills: ["Cloud governance", "Infrastructure planning"],
      },
    ],
  },
  {
    id: "it_devops",
    name: "DevOps",
    roles: [
      {
        title: "Engineer",
        skills: ["CI/CD pipelines", "Docker"],
      },
      {
        title: "Senior",
        skills: ["Infrastructure automation", "Kubernetes"],
      },
      {
        title: "Manager",
        skills: ["DevOps strategy", "Release governance"],
      },
    ],
  },
  {
    id: "it_erp_systems",
    name: "ERP Systems",
    roles: [
      {
        title: "Executive",
        skills: ["ERP data entry", "Module support"],
      },
      {
        title: "Consultant",
        skills: ["SAP configuration", "Oracle configuration"],
      },
      {
        title: "Manager",
        skills: ["ERP governance", "Implementation strategy"],
      },
    ],
  },
  {
    id: "it_mis_reporting",
    name: "MIS & Reporting",
    roles: [
      {
        title: "Officer",
        skills: ["Excel reports", "Database updates"],
      },
      {
        title: "Analyst",
        skills: ["Data modeling", "KPI dashboards"],
      },
      {
        title: "Manager",
        skills: ["Reporting framework", "Data governance"],
      },
    ],
  },
  {
    id: "it_network_administration",
    name: "Network Administration",
    roles: [
      {
        title: "Support",
        skills: ["LAN troubleshooting", "WAN troubleshooting"],
      },
      {
        title: "Engineer",
        skills: ["Router configuration", "Switch configuration"],
      },
      {
        title: "Senior",
        skills: ["Network security", "Firewall management"],
      },
      {
        title: "Manager",
        skills: ["Infrastructure planning"],
      },
    ],
  },
  {
    id: "it_database_administration",
    name: "Database Administration",
    roles: [
      {
        title: "Officer",
        skills: ["Data entry", "Backups"],
      },
      {
        title: "DBA",
        skills: ["SQL management", "Tuning"],
      },
      {
        title: "Senior",
        skills: ["Database optimization", "Security"],
      },
      {
        title: "Manager",
        skills: ["Database governance"],
      },
    ],
  },
  {
    id: "it_blockchain",
    name: "Blockchain",
    roles: [
      {
        title: "Developer",
        skills: ["Smart contracts", "Solidity"],
      },
      {
        title: "Senior",
        skills: ["DApp architecture", "Security"],
      },
      {
        title: "Lead",
        skills: ["Blockchain strategy", "Integration planning"],
      },
    ],
  },
]; 

const PRODUCT_INNOVATION_DEPARTMENT_CONTENT = [
  {
    id: "pi_product_management",
    name: "Product Management",
    roles: [
      {
        title: "Product Executive",
        skills: [
          "Product documentation",
          "Coordination with development teams",
          "Backlog updates",
          "Market data collection",
        ],
      },
      {
        title: "Product Manager",
        skills: [
          "Product roadmap planning",
          "Market analysis",
          "Feature prioritization",
          "Stakeholder coordination",
        ],
      },
      {
        title: "Senior Product Manager",
        skills: [
          "Product strategy",
          "Lifecycle management",
          "Cross-functional leadership",
          "Product performance monitoring",
        ],
      },
      {
        title: "Head of Product",
        skills: [
          "Product governance",
          "Innovation strategy",
          "Portfolio management",
          "Long-term product vision",
        ],
      },
    ],
  },
];

const PROGRAM_DELIVERY_DEPARTMENT_CONTENT = [
  {
    id: "pdm_project_management_pmo",
    name: "Project Management / PMO",
    roles: [
      {
        title: "Project Coordinator",
        skills: [
          "Project scheduling",
          "Documentation management",
          "Meeting coordination",
          "Progress tracking",
        ],
      },
      {
        title: "Project Manager",
        skills: [
          "Budget control",
          "Risk management",
          "Team coordination",
          "Milestone monitoring",
        ],
      },
      {
        title: "Senior Project Manager",
        skills: [
          "Multi-project oversight",
          "Stakeholder management",
          "Strategic project alignment",
          "Governance reporting",
        ],
      },
      {
        title: "PMO Head",
        skills: [
          "Portfolio management",
          "Project governance frameworks",
          "PM methodology development",
          "Executive reporting",
        ],
      },
    ],
  },
];

const OPERATIONS_PROCESS_EXCELLENCE_CONTENT = [
  {
    id: "ope_business_analysis",
    name: "Business Analysis",
    roles: [
      {
        title: "Business Analyst",
        skills: [
          "Requirement gathering",
          "Process documentation",
          "Stakeholder interviews",
          "Workflow analysis",
        ],
      },
      {
        title: "Senior Business Analyst",
        skills: [
          "Process modeling",
          "Solution design support",
          "Stakeholder coordination",
          "Gap analysis",
        ],
      },
      {
        title: "BA Manager",
        skills: [
          "Business analysis governance",
          "Team supervision",
          "Methodology implementation",
          "Process improvement strategy",
        ],
      },
    ],
  },
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
];

const MOCK_OPENINGS: JobOpening[] = [
  { id: "j1", roleId: "role_fe", title: "Frontend Developer", company: "Sanjeeda Labs", location: "Karachi", isRemote: true },
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
        ? "bg-gray text-gray-700 border border-gray-200"
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
  const [selectedSubDepartmentId, setSelectedSubDepartmentId] = useState<string | null>(null);

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

const hrSubDepartments = useMemo(() => {
  return activeFieldId === "hr" ? HR_DEPARTMENT_CONTENT : [];
}, [activeFieldId]);

const selectedSubDepartment = useMemo(() => {
  return hrSubDepartments.find((d) => d.id === selectedSubDepartmentId) ?? null;
}, [hrSubDepartments, selectedSubDepartmentId]);

  const fieldRoles = useMemo(() => {
    const list = roles.filter((r) => (activeFieldId ? r.fieldId === activeFieldId : true));
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter((r) => r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q));
  }, [roles, activeFieldId, search]);

const visibleRoles = useMemo(() => {
  if (activeFieldId === "hr") {
    if (!selectedSubDepartment) return [];
    return selectedSubDepartment.roles;
  }
  return fieldRoles;
}, [activeFieldId, selectedSubDepartment, fieldRoles]);

  const userMap = useMemo(() => {
    const m = new Map<string, UserSkill>();
    for (const s of userSkills) m.set(normalizeSkillName(s.name), s);
    return m;
  }, [userSkills]);

  const roleSkills = useMemo(() => {
    if (!selectedRole) return [];
    let list = selectedRole.skills;
    if (skillFilter !== "all") list = list.filter((s) => s.type === skillFilter);
    if (showOnlyMissing) list = list.filter((req) => !userMap.has(normalizeSkillName(req.name)));
    return list;
  }, [selectedRole, skillFilter, showOnlyMissing, userMap]);

const selectedHrDepartmentContent = useMemo(() => {
  return HR_DEPARTMENT_CONTENT.find((dept) => dept.id === selectedSubDepartmentId) ?? null;
}, [selectedSubDepartmentId]);

const selectedFinanceDepartmentContent = useMemo(() => {
  return FINANCE_DEPARTMENT_CONTENT.find((dept) => dept.id === selectedSubDepartmentId) ?? null;
}, [selectedSubDepartmentId]);

const selectedSalesDepartmentContent = useMemo(() => {
  return SALES_DEPARTMENT_CONTENT.find((dept) => dept.id === selectedSubDepartmentId) ?? null;
}, [selectedSubDepartmentId]);

const selectedMarketingDepartmentContent = useMemo(() => {
  return MARKETING_DEPARTMENT_CONTENT.find((dept) => dept.id === selectedSubDepartmentId) ?? null;
}, [selectedSubDepartmentId]);

const selectedCustomerRelationDepartmentContent = useMemo(() => {
  return CUSTOMER_RELATION_DEPARTMENT_CONTENT.find((dept) => dept.id === selectedSubDepartmentId) ?? null;
}, [selectedSubDepartmentId]);

const selectedSupplyChainDepartmentContent = useMemo(() => {
  return SUPPLY_CHAIN_DEPARTMENT_CONTENT.find((dept) => dept.id === selectedSubDepartmentId) ?? null;
}, [selectedSubDepartmentId]);

const selectedITDepartmentContent = useMemo(() => {
  return IT_DEPARTMENT_CONTENT.find((dept) => dept.id === selectedSubDepartmentId) ?? null;
}, [selectedSubDepartmentId]);

const selectedProductInnovationDepartmentContent = useMemo(() => {
  return PRODUCT_INNOVATION_DEPARTMENT_CONTENT.find(
    (dept) => dept.id === selectedSubDepartmentId
  ) ?? null;
}, [selectedSubDepartmentId]);

const selectedProgramDeliveryDepartmentContent = useMemo(() => {
  return PROGRAM_DELIVERY_DEPARTMENT_CONTENT.find(
    (dept) => dept.id === selectedSubDepartmentId
  ) ?? null;
}, [selectedSubDepartmentId]);

const selectedOperationsProcessExcellenceContent = useMemo(() => {
  return OPERATIONS_PROCESS_EXCELLENCE_CONTENT.find(
    (dept) => dept.id === selectedSubDepartmentId
  ) ?? null;
}, [selectedSubDepartmentId]);

function goBack(): void {
  if (selectedRoleId) {
    setSelectedRoleId(null);
    setMatchResult(null);
    return;
  }

  if (selectedSubDepartmentId) {
    setSelectedSubDepartmentId(null);
    setMatchResult(null);
    return;
  }

  if (activeFieldId) {
    setActiveFieldId(null);
    setSelectedSubDepartmentId(null);
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

  

<div className="mt-1 text-sm font-sans text-emerald-700">
  {selectedRole
    ? "Review required skills, compare your profile, and run Match Profile."
    : selectedSubDepartment
      ? "Browse position roles inside this sub department."
      : activeField
        ? activeFieldId === "hr"
          ? "Browse position roles inside this sub department."
          : "Browse roles inside this field."
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

{/* HR Department Dropdown */}
{activeFieldId === "hr" && !selectedRole && (
  <div className="mb-6">
    <div className="rounded-2xl border border-slate-300 bg-gradient-to-r from-white via-slate-50 to-slate-100 p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-md">
          <span className="text-sm font-bold">HR</span>
        </div>

        <div>
          <h3 className="text-base font-semibold tracking-tight text-slate-900">
            HR Sub Departments
          </h3>
          <p className="text-xs text-slate-500">
            Select a department to explore its position roles
          </p>
        </div>
      </div>

      <div className="relative">
        <label
          htmlFor="hr-department"
          className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-600"
        >
          Department
        </label>

        <select
          id="hr-department"
          value={selectedSubDepartmentId ?? ""}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            setSelectedSubDepartmentId(e.target.value || null)
          }
          className=" appearance-none rounded-xl border border-slate-300 bg-white 
          px-4 py-2 pr-10 text-xs font-medium text-slate-900 shadow-sm outline-none transition 
          duration-200 hover:border-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
        >
          <option value="">Select HR Sub-Department</option>
          <option value="hr_talent_acquisition">Talent Acquisition</option>
          <option value="hr_comp_benefits">Compensation & Benefits</option>
          <option value="hr_org_dev">Organizational Development</option>
          <option value="hr_payroll">Payroll Management</option>
          <option value="hr_change_management">Change Management</option>
          <option value="hr_compliance">Compliance</option>
          <option value="hr_legal_affairs">Legal Affairs</option>
        </select>

        <div className="-mt-2 pointer-events-none absolute left-44 top-[42px] text-slate-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-semibold text-emerald-700">
          Structured Career Path
        </span>
        <span className="rounded-full bg-slate-200 px-3 py-1 text-[11px] font-semibold text-slate-700">
          Department Based Roles
        </span>
      </div>
    </div>
  </div>
)}
{/* Finance Department Dropdown */}
{activeFieldId === "finance" && !selectedRole && (
  <div className="mb-6">
    <div className="rounded-2xl border border-slate-300 bg-gradient-to-r from-white via-slate-50 to-slate-100 p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-md">
          <span className="text-[11px] font-bold">FIN</span>
        </div>

        <div>
          <h3 className="text-base font-semibold tracking-tight text-slate-900">
            Finance Sub Departments
          </h3>
          <p className="text-xs text-slate-500">
            Select a finance department to explore its role ladder
          </p>
        </div>
      </div>

      <div className="relative">
        <label
          htmlFor="finance-department"
          className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-600"
        >
          Department
        </label>

        <select
          id="finance-department"
          value={selectedSubDepartmentId ?? ""}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            setSelectedSubDepartmentId(e.target.value || null)
          }
          className="appearance-none rounded-xl border border-slate-300 bg-white px-4 py-2 pr-10 text-xs font-medium text-slate-900 shadow-sm outline-none transition duration-200 hover:border-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
        >
          <option value="">Select Finance Sub-Department</option>
          <option value="finance_corporate_finance">Corporate Finance</option>
          <option value="finance_fpa">Financial Planning & Analysis (FP&A)</option>
          <option value="finance_taxation">Taxation</option>
          <option value="finance_treasury">Treasury</option>
          <option value="finance_risk_management">Risk Management</option>
          <option value="finance_commercial_banking">Commercial Banking</option>
          <option value="finance_corporate_banking">Corporate Banking</option>
          <option value="finance_islamic_banking">Islamic Banking</option>
          <option value="finance_microfinance">Microfinance</option>
          <option value="finance_insurance">Insurance</option>
        </select>

        <div className="-mt-2 pointer-events-none absolute left-48 top-[42px] text-slate-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-semibold text-emerald-700">
          Structured Career Path
        </span>
        <span className="rounded-full bg-slate-200 px-3 py-1 text-[11px] font-semibold text-slate-700">
          Finance Role Ladder
        </span>
      </div>
    </div>
  </div>
)}
{/* Sales Department Dropdown */}
{activeFieldId === "sales" && !selectedRole && (
  <div className="mb-6">
    <div className="rounded-2xl border border-slate-300 bg-gradient-to-r from-white via-slate-50 to-slate-100 p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-md">
          <span className="text-[11px] font-bold">SAL</span>
        </div>

        <div>
          <h3 className="text-base font-semibold tracking-tight text-slate-900">
            Sales Sub Departments
          </h3>
          <p className="text-xs text-slate-500">
            Select a sales department to explore its role ladder
          </p>
        </div>
      </div>

      <div className="relative">
        <label
          htmlFor="sales-department"
          className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-600"
        >
          Department
        </label>

        <select
          id="sales-department"
          value={selectedSubDepartmentId ?? ""}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            setSelectedSubDepartmentId(e.target.value || null)
          }
          className="appearance-none rounded-xl border border-slate-300 bg-white px-4 py-2 pr-10 text-xs font-medium text-slate-900 shadow-sm outline-none transition duration-200 hover:border-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
        >
          <option value="">Select Sales Sub-Department</option>
          <option value="sales_general">Sales</option>
          <option value="sales_corporate">Corporate Sales</option>
          <option value="sales_business_development">Business Development</option>
        </select>

        <div className="-mt-2 pointer-events-none absolute left-48 top-[42px] text-slate-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-semibold text-emerald-700">
          Structured Career Path
        </span>
        <span className="rounded-full bg-slate-200 px-3 py-1 text-[11px] font-semibold text-slate-700">
          Sales Role Ladder
        </span>
      </div>
    </div>
  </div>
)}
{/* Marketing Department Dropdown */}
{activeFieldId === "marketing" && !selectedRole && (
  <div className="mb-6">
    <div className="rounded-2xl border border-slate-300 bg-gradient-to-r from-white via-slate-50 to-slate-100 p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-md">
          <span className="text-[10px] font-bold">MKT</span>
        </div>

        <div>
          <h3 className="text-base font-semibold tracking-tight text-slate-900">
            Marketing Sub Departments
          </h3>
          <p className="text-xs text-slate-500">
            Select a marketing department to explore its role ladder
          </p>
        </div>
      </div>

      <div className="relative">
        <label
          htmlFor="marketing-department"
          className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-600"
        >
          Department
        </label>

        <select
          id="marketing-department"
          value={selectedSubDepartmentId ?? ""}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            setSelectedSubDepartmentId(e.target.value || null)
          }
          className="appearance-none rounded-xl border border-slate-300 bg-white px-4 py-2 pr-10 
          text-xs font-medium text-slate-900 shadow-sm outline-none transition duration-200 hover:border-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
        >
          <option value="">Select Marketing Sub-Department</option>
          <option value="marketing_general">Marketing</option>
          <option value="marketing_brand_management">Brand Management</option>
          <option value="marketing_market_research">Market Research</option>
          <option value="marketing_digital_marketing">Digital Marketing</option>
        </select>

        <div className="-mt-2 pointer-events-none absolute left-52 top-[42px] text-slate-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-semibold text-emerald-700">
          Structured Career Path
        </span>
        <span className="rounded-full bg-slate-200 px-3 py-1 text-[11px] font-semibold text-slate-700">
          Marketing Role Ladder
        </span>
      </div>
    </div>
  </div>
)}
{/* Customer Relation Department Dropdown */}
{activeFieldId === "customer_relation" && !selectedRole && (
  <div className="mb-6">
    <div className="rounded-2xl border border-slate-300 bg-gradient-to-r from-white via-slate-50 to-slate-100 p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-md">
          <span className="text-[10px] font-bold">CR</span>
        </div>

        <div>
          <h3 className="text-base font-semibold tracking-tight text-slate-900">
            Customer Relation Sub Departments
          </h3>
          <p className="text-xs text-slate-500">
            Select a department to explore its role ladder
          </p>
        </div>
      </div>

      <div className="relative">
        <label
          htmlFor="customer-relation-department"
          className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-600"
        >
          Department
        </label>

        <select
          id="customer-relation-department"
          value={selectedSubDepartmentId ?? ""}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            setSelectedSubDepartmentId(e.target.value || null)
          }
          className="appearance-none rounded-xl border border-slate-300 bg-white px-4 py-2 pr-10 text-xs font-medium text-slate-900 shadow-sm outline-none transition duration-200 hover:border-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
        >
          <option value="">Select Customer Relation Sub-Department</option>
          <option value="cr_public_relations">Public Relations</option>
          <option value="cr_customer_service">Customer Service</option>
          <option value="cr_call_center_ops">Call Center Operations</option>
        </select>

        <div className="-mt-2 pointer-events-none absolute left-64 top-[42px] text-slate-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-semibold text-emerald-700">
          Structured Career Path
        </span>
        <span className="rounded-full bg-slate-200 px-3 py-1 text-[11px] font-semibold text-slate-700">
          Customer Relation Roles
        </span>
      </div>
    </div>
  </div>
)}
{/* Supply Chain Department Dropdown*/}
{activeFieldId === "supply_chain_management" && !selectedRole && (
  <div className="mb-6">
    <div className="rounded-2xl border border-slate-300 bg-gradient-to-r from-white via-slate-50 to-slate-100 p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-md">
          <span className="text-[10px] font-bold">SCM</span>
        </div>

        <div>
          <h3 className="text-base font-semibold tracking-tight text-slate-900">
            Supply Chain Sub Departments
          </h3>
          <p className="text-xs text-slate-500">
            Select a supply chain department to explore its role ladder
          </p>
        </div>
      </div>

      <div className="relative">
        <label
          htmlFor="scm-department"
          className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-600"
        >
          Department
        </label>

        <select
          id="scm-department"
          value={selectedSubDepartmentId ?? ""}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            setSelectedSubDepartmentId(e.target.value || null)
          }
          className="appearance-none rounded-xl border border-slate-300 bg-white px-4 py-2 pr-10 text-xs font-medium text-slate-900 shadow-sm outline-none transition duration-200 hover:border-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
        >
          <option value="">Select Supply Chain Sub-Department</option>
          <option value="scm_procurement">Procurement</option>
          <option value="scm_logistics">Logistics</option>
          <option value="scm_inventory_management">Inventory Management</option>
          <option value="scm_manufacturing">Manufacturing</option>
          <option value="scm_production">Production</option>
          <option value="scm_quality_assurance">Quality Assurance</option>
          <option value="scm_quality_control">Quality Control</option>
          <option value="scm_lean_management">Lean Management</option>
        </select>

        <div className="-mt-2 pointer-events-none absolute left-56 top-[42px] text-slate-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-semibold text-emerald-700">
          Structured Career Path
        </span>
        <span className="rounded-full bg-slate-200 px-3 py-1 text-[11px] font-semibold text-slate-700">
          SCM Role Ladder
        </span>
      </div>
    </div>
  </div>
)}
{/* IT Department Dropdown*/}
{activeFieldId === "it" && !selectedRole && (
  <div className="mb-6">
    <div className="rounded-2xl border border-slate-300 bg-gradient-to-r from-white via-slate-50 to-slate-100 p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-md">
          <span className="text-[12px] font-bold">IT</span>
        </div>

        <div>
          <h3 className="text-base font-semibold tracking-tight text-slate-900">
            IT Sub Departments
          </h3>
          <p className="text-xs text-slate-500">
            Select an IT department to explore its role ladder
          </p>
        </div>
      </div>

      <div className="relative">
        <label
          htmlFor="it-department"
          className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-600"
        >
          Department
        </label>

        <select
          id="it-department"
          value={selectedSubDepartmentId ?? ""}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            setSelectedSubDepartmentId(e.target.value || null)
          }
          className="appearance-none rounded-xl border border-slate-300 bg-white px-4 py-2 pr-10 text-xs font-medium text-slate-900 shadow-sm outline-none transition duration-200 hover:border-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
        >
          <option value="">Select IT Sub-Department</option>
          <option value="it_web_development">Web Development</option>
          <option value="it_mobile_app_development">Mobile App Development</option>
          <option value="it_business_intelligence">Business Intelligence</option>
          <option value="it_artificial_intelligence">Artificial Intelligence</option>
          <option value="it_cloud_computing">Cloud Computing</option>
          <option value="it_devops">DevOps</option>
          <option value="it_erp_systems">ERP Systems</option>
          <option value="it_mis_reporting">MIS & Reporting</option>
          <option value="it_network_administration">Network Administration</option>
          <option value="it_database_administration">Database Administration</option>
          <option value="it_blockchain">Blockchain</option>
        </select>

        <div className="-mt-2 pointer-events-none absolute left-44 top-[42px] text-slate-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-semibold text-emerald-700">
          Structured Career Path
        </span>
        <span className="rounded-full bg-slate-200 px-3 py-1 text-[11px] font-semibold text-slate-700">
          IT Role Ladder
        </span>
      </div>
    </div>
  </div>
)}
{/* Product Innovation Department Dropdown*/}
{activeFieldId === "product_innovation" && !selectedRole && (
  <div className="mb-6">
    <div className="rounded-2xl border border-slate-300 bg-gradient-to-r from-white via-slate-50 to-slate-100 p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-md">
          <span className="text-[10px] font-bold">PI</span>
        </div>

        <div>
          <h3 className="text-base font-semibold tracking-tight text-slate-900">
            Product & Innovation
          </h3>
          <p className="text-xs text-slate-500">
            Select a sub department to explore its role ladder
          </p>
        </div>
      </div>

      <div className="relative">
        <label
          htmlFor="product-innovation-department"
          className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-600"
        >
          Department
        </label>

        <select
          id="product-innovation-department"
          value={selectedSubDepartmentId ?? ""}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            setSelectedSubDepartmentId(e.target.value || null)
          }
          className="appearance-none rounded-xl border border-slate-300 bg-white px-4 py-2 pr-10 text-xs font-medium text-slate-900 shadow-sm outline-none transition duration-200 hover:border-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
        >
          <option value="">Select Product Sub-Department</option>
          <option value="pi_product_management">Product Management</option>
        </select>

        <div className="-mt-2 pointer-events-none absolute left-52 top-[42px] text-slate-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-semibold text-emerald-700">
          Structured Career Path
        </span>
        <span className="rounded-full bg-slate-200 px-3 py-1 text-[11px] font-semibold text-slate-700">
          Product Role Ladder
        </span>
      </div>
    </div>
  </div>
)}
{/* Program & Delivery Management Dropdowm*/}
{activeFieldId === "program_delivery_management" && !selectedRole && (
  <div className="mb-6">
    <div className="rounded-2xl border border-slate-300 bg-gradient-to-r from-white via-slate-50 to-slate-100 p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-md">
          <span className="text-[10px] font-bold">PDM</span>
        </div>

        <div>
          <h3 className="text-base font-semibold tracking-tight text-slate-900">
            Program & Delivery Management
          </h3>
          <p className="text-xs text-slate-500">
            Select a sub department to explore its role ladder
          </p>
        </div>
      </div>

      <div className="relative">
        <label
          htmlFor="pdm-department"
          className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-600"
        >
          Department
        </label>

        <select
          id="pdm-department"
          value={selectedSubDepartmentId ?? ""}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            setSelectedSubDepartmentId(e.target.value || null)
          }
          className="appearance-none rounded-xl border border-slate-300 bg-white px-4 py-2 pr-10 text-xs font-medium text-slate-900 shadow-sm outline-none transition duration-200 hover:border-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
        >
          <option value="">Select Program & Delivery Sub-Department</option>
          <option value="pdm_project_management_pmo">Project Management / PMO</option>
        </select>

        <div className="-mt-2 pointer-events-none absolute left-64 top-[42px] text-slate-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z"
              clipRule="evenodd"
            />
          </svg>
        </div>

      </div>

      

      <div className="mt-3 flex flex-wrap gap-2">
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-semibold text-emerald-700">
          Structured Career Path
        </span>
        <span className="rounded-full bg-slate-200 px-3 py-1 text-[11px] font-semibold text-slate-700">
          Delivery Role Ladder
        </span>
      </div>
    </div>
  </div>
)}
{/*Operations & Process Excellence Dropdown*/}
{activeFieldId === "operations_process_excellence" && !selectedRole && (
  <div className="mb-6">
    <div className="rounded-2xl border border-slate-300 bg-gradient-to-r from-white via-slate-50 to-slate-100 p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-md">
          <span className="text-[10px] font-bold">OPE</span>
        </div>

        <div>
          <h3 className="text-base font-semibold tracking-tight text-slate-900">
            Operations &amp; Process Excellence
          </h3>
          <p className="text-xs text-slate-500">
            Select a sub department to explore its role ladder
          </p>
        </div>
      </div>

      <div className="relative">
        <label
          htmlFor="ope-department"
          className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-600"
        >
          Department
        </label>

        <select
          id="ope-department"
          value={selectedSubDepartmentId ?? ""}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            setSelectedSubDepartmentId(e.target.value || null)
          }
          className="appearance-none rounded-xl border border-slate-300 bg-white px-4 py-2 pr-10 text-xs font-medium text-slate-900 shadow-sm outline-none transition duration-200 hover:border-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
        >
          <option value="">Select Operations Sub-Department</option>
          <option value="ope_business_analysis">Business Analysis</option>
        </select>

        <div className="-mt-2 pointer-events-none absolute left-52 top-[42px] text-slate-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-semibold text-emerald-700">
          Structured Career Path
        </span>
        <span className="rounded-full bg-slate-200 px-3 py-1 text-[11px] font-semibold text-slate-700">
          Process Excellence Roles
        </span>
      </div>
    </div>
  </div>
)}

{/* Roles List */}
{activeFieldId === "hr" && !selectedRole && selectedHrDepartmentContent && (
  <div className="mb-6">
    <div className="border-b border-slate-300 pb-3">
      <h3 className="text-lg font-semibold tracking-tight text-slate-900">
        {selectedHrDepartmentContent.name}
      </h3>
      <p className="mt-1 text-sm text-slate-600">
        Structured role ladder and core skill responsibilities.
      </p>
    </div>

    <div className="mt-4 space-y-4">
      {selectedHrDepartmentContent.roles.map((role, index) => (
        <div key={role.title} className="border-l-2 border-emerald-500/70 pl-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full 
            bg-blue-200 px-2 text-xs font-bold text-blue-700">
              {index + 1}
            </span>
            <h4 className="text-sm font-semibold text-slate-900 sm:text-sm">
              {role.title}
            </h4>
          </div>

          <div className="mt-2 flex flex-wrap gap-2">
            {role.skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex rounded-full bg-slate-100 
                px-3 py-1 text-xs font-sans
                text-slate-700 ring-1 ring-slate-200"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
)}
{activeFieldId === "finance" && !selectedRole && selectedFinanceDepartmentContent && (
  <div className="mb-6">
    <div className="border-b border-slate-300 pb-3">
      <h3 className="text-lg font-semibold tracking-tight text-slate-900">
        {selectedFinanceDepartmentContent.name}
      </h3>
      <p className="mt-1 text-sm text-slate-600">
        Structured finance role ladder and core functional skills.
      </p>
    </div>

    <div className="mt-4 space-y-4">
      {selectedFinanceDepartmentContent.roles.map((role, index) => (
        <div key={role.title} className="border-l-2 border-emerald-500/70 pl-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-blue-200 px-2 text-xs font-bold text-blue-700">
              {index + 1}
            </span>
            <h4 className="text-sm font-semibold text-slate-900 sm:text-sm">
              {role.title}
            </h4>
          </div>

          <div className="mt-2 flex flex-wrap gap-2">
            {role.skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-sans text-slate-700 ring-1 ring-slate-200"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
)}
{activeFieldId === "sales" && !selectedRole && selectedSalesDepartmentContent && (
  <div className="mb-6">
    <div className="border-b border-slate-300 pb-3">
      <h3 className="text-lg font-semibold tracking-tight text-slate-900">
        {selectedSalesDepartmentContent.name}
      </h3>
      <p className="mt-1 text-sm text-slate-600">
        Structured sales role ladder and core commercial skills.
      </p>
    </div>

    <div className="mt-4 space-y-4">
      {selectedSalesDepartmentContent.roles.map((role, index) => (
        <div key={role.title} className="border-l-2 border-emerald-500/70 pl-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-blue-200 px-2 text-xs font-bold text-blue-700">
              {index + 1}
            </span>
            <h4 className="text-sm font-semibold text-slate-900 sm:text-sm">
              {role.title}
            </h4>
          </div>

          <div className="mt-2 flex flex-wrap gap-2">
            {role.skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-sans text-slate-700 ring-1 ring-slate-200"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
)}
{activeFieldId === "marketing" && !selectedRole && selectedMarketingDepartmentContent && (
  <div className="mb-6">
    <div className="border-b border-slate-300 pb-3">
      <h3 className="text-lg font-semibold tracking-tight text-slate-900">
        {selectedMarketingDepartmentContent.name}
      </h3>
      <p className="mt-1 text-sm text-slate-600">
        Structured marketing role ladder and core functional skills.
      </p>
    </div>

    <div className="mt-4 space-y-4">
      {selectedMarketingDepartmentContent.roles.map((role, index) => (
        <div key={role.title} className="border-l-2 border-emerald-500/70 pl-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-blue-200 px-2 text-xs font-bold text-blue-700">
              {index + 1}
            </span>
            <h4 className="text-sm font-semibold text-slate-900 sm:text-sm">
              {role.title}
            </h4>
          </div>

          <div className="mt-2 flex flex-wrap gap-2">
            {role.skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-sans text-slate-700 ring-1 ring-slate-200"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
)}
{activeFieldId === "customer_relation" && !selectedRole && selectedCustomerRelationDepartmentContent && (
  <div className="mb-6">
    <div className="border-b border-slate-300 pb-3">
      <h3 className="text-lg font-semibold tracking-tight text-slate-900">
        {selectedCustomerRelationDepartmentContent.name}
      </h3>
      <p className="mt-1 text-sm text-slate-600">
        Structured customer relation role ladder and core functional skills.
      </p>
    </div>

    <div className="mt-4 space-y-4">
      {selectedCustomerRelationDepartmentContent.roles.map((role, index) => (
        <div key={role.title} className="border-l-2 border-emerald-500/70 pl-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-blue-200 px-2 text-xs font-bold text-blue-700">
              {index + 1}
            </span>
            <h4 className="text-sm font-semibold text-slate-900 sm:text-sm">
              {role.title}
            </h4>
          </div>

          <div className="mt-2 flex flex-wrap gap-2">
            {role.skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-sans text-slate-700 ring-1 ring-slate-200"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
)}
{activeFieldId === "supply_chain_management" && !selectedRole && selectedSupplyChainDepartmentContent && (
  <div className="mb-6">
    <div className="border-b border-slate-300 pb-3">
      <h3 className="text-lg font-semibold tracking-tight text-slate-900">
        {selectedSupplyChainDepartmentContent.name}
      </h3>
      <p className="mt-1 text-sm text-slate-600">
        Structured supply chain role ladder and core operational skills.
      </p>
    </div>

    <div className="mt-4 space-y-4">
      {selectedSupplyChainDepartmentContent.roles.map((role, index) => (
        <div key={role.title} className="border-l-2 border-emerald-500/70 pl-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-blue-200 px-2 text-xs font-bold text-blue-700">
              {index + 1}
            </span>
            <h4 className="text-sm font-semibold text-slate-900 sm:text-sm">
              {role.title}
            </h4>
          </div>

          <div className="mt-2 flex flex-wrap gap-2">
            {role.skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-sans text-slate-700 ring-1 ring-slate-200"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
)}    
{activeFieldId === "it" && !selectedRole && selectedITDepartmentContent && (
  <div className="mb-6">
    <div className="border-b border-slate-300 pb-3">
      <h3 className="text-lg font-semibold tracking-tight text-slate-900">
        {selectedITDepartmentContent.name}
      </h3>
      <p className="mt-1 text-sm text-slate-600">
        Structured IT role ladder and core technical skills.
      </p>
    </div>

    <div className="mt-4 space-y-4">
      {selectedITDepartmentContent.roles.map((role, index) => (
        <div key={role.title} className="border-l-2 border-emerald-500/70 pl-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-blue-200 px-2 text-xs font-bold text-blue-700">
              {index + 1}
            </span>
            <h4 className="text-sm font-semibold text-slate-900 sm:text-sm">
              {role.title}
            </h4>
          </div>

          <div className="mt-2 flex flex-wrap gap-2">
            {role.skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-sans text-slate-700 ring-1 ring-slate-200"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
)}    
{activeFieldId === "product_innovation" && !selectedRole && selectedProductInnovationDepartmentContent && (
  <div className="mb-6">
    <div className="border-b border-slate-300 pb-3">
      <h3 className="text-lg font-semibold tracking-tight text-slate-900">
        {selectedProductInnovationDepartmentContent.name}
      </h3>
      <p className="mt-1 text-sm text-slate-600">
        Structured product role ladder and core innovation skills.
      </p>
    </div>

    <div className="mt-4 space-y-4">
      {selectedProductInnovationDepartmentContent.roles.map((role, index) => (
        <div key={role.title} className="border-l-2 border-emerald-500/70 pl-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-blue-200 px-2 text-xs font-bold text-blue-700">
              {index + 1}
            </span>
            <h4 className="text-sm font-semibold text-slate-900 sm:text-sm">
              {role.title}
            </h4>
          </div>

          <div className="mt-2 flex flex-wrap gap-2">
            {role.skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-sans text-slate-700 ring-1 ring-slate-200"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
)}
{activeFieldId === "program_delivery_management" && !selectedRole && selectedProgramDeliveryDepartmentContent && (
  <div className="mb-6">
    <div className="border-b border-slate-300 pb-3">
      <h3 className="text-lg font-semibold tracking-tight text-slate-900">
        {selectedProgramDeliveryDepartmentContent.name}
      </h3>
      <p className="mt-1 text-sm text-slate-600">
        Structured delivery role ladder and core project governance skills.
      </p>
    </div>

    <div className="mt-4 space-y-4">
      {selectedProgramDeliveryDepartmentContent.roles.map((role, index) => (
        <div key={role.title} className="border-l-2 border-emerald-500/70 pl-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-blue-200 px-2 text-xs font-bold text-blue-700">
              {index + 1}
            </span>
            <h4 className="text-sm font-semibold text-slate-900 sm:text-sm">
              {role.title}
            </h4>
          </div>

          <div className="mt-2 flex flex-wrap gap-2">
            {role.skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-sans text-slate-700 ring-1 ring-slate-200"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
)}
{activeFieldId === "operations_process_excellence" && !selectedRole && selectedOperationsProcessExcellenceContent && (
  <div className="mb-6">
    <div className="border-b border-slate-300 pb-3">
      <h3 className="text-lg font-semibold tracking-tight text-slate-900">
        {selectedOperationsProcessExcellenceContent.name}
      </h3>
      <p className="mt-1 text-sm text-slate-600">
        Structured business analysis role ladder and core process skills.
      </p>
    </div>

    <div className="mt-4 space-y-4">
      {selectedOperationsProcessExcellenceContent.roles.map((role, index) => (
        <div key={role.title} className="border-l-2 border-emerald-500/70 pl-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-blue-200 px-2 text-xs font-bold text-blue-700">
              {index + 1}
            </span>
            <h4 className="text-sm font-semibold text-slate-900 sm:text-sm">
              {role.title}
            </h4>
          </div>

          <div className="mt-2 flex flex-wrap gap-2">
            {role.skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-sans text-slate-700 ring-1 ring-slate-200"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
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

          const status =  !u ? "Missing" : percent === 100 ? "Matched" : "Partial";

          return (
          <div key={req.id} className="rounded-xl border border-white/10 bg-blue-950 p-3">
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

                  <span className={
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

       <button type="button" onClick={addUserSkill}
        className="inline-flex items-center justify-center rounded-xl border border-white/10 
        bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/15"
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
                                    <div className="font-semibold text-black">{o.title}</div>
                                    <div className="mt-1 text-xs text-black">
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
                    setSelectedSubDepartmentId(null);
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
                      setSelectedSubDepartmentId(null);
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