export const categories = [
  "Strategy and Direction",
  "Leadership and Accountability",
  "Operations and Process",
  "Customer Experience",
  "People and Capability",
  "Finance and Commercial Control",
  "Sales and Marketing",
  "Technology and Systems",
  "AI Readiness and Automation",
  "Risk Compliance and Resilience",
  "Growth Innovation and Improvement"
];

const stems = [
  "business strategy", "clear objectives", "management rhythm", "leadership ownership", "decision making",
  "documented processes", "process consistency", "customer response", "complaint handling", "customer retention",
  "skills and training", "staff engagement", "financial visibility", "margin control", "cash flow forecasting",
  "sales pipeline", "marketing effectiveness", "system integration", "data accuracy", "automation opportunity",
  "AI readiness", "risk ownership", "compliance controls", "business continuity", "continuous improvement"
];

export const questionsSeed = Array.from({ length: 250 }, (_, i) => {
  const category = categories[i % categories.length];
  const stem = stems[i % stems.length];
  return {
    id: i + 1,
    category,
    question: `How effective is the business at managing ${stem}?`,
    guidance: `Review evidence of ${stem}, ownership, consistency, maturity and measurable impact.`,
    score: 0,
    notes: "",
    evidence: "",
    action: "",
    risk: "Medium",
    priority: "Medium"
  };
});

export function freshAssessment() {
  return questionsSeed.map((q) => ({ ...q }));
}

export const visitStages = [
  "Reception",
  "Managing Director Interview",
  "Business Walkthrough",
  "Assessment",
  "Evidence Review",
  "Report",
  "Presentation Mode",
  "90 Day Action Plan",
  "Schedule Follow Up",
  "Finish"
];

export const featureRegister = [
  "Clickable dashboard",
  "Dark styled client cards",
  "CRM search and filters",
  "Add client wizard",
  "Schedule first consultation",
  "Client workspace",
  "Multiple contacts",
  "Client timeline",
  "Calendar day week month year list",
  "Calendar jump to 2035",
  "Rescheduling updates dashboard",
  "Visit workflow restored layout",
  "Embedded assessment inside visit workflow",
  "250 questions restored",
  "11 categories restored",
  "Category navigation restored",
  "Assessment answers persist per client",
  "Backend API with SQLite database",
  "Dashboard widget preferences synced server-side",
  "Reports retained",
  "Actions retained",
  "Analytics retained",
  "AI Consultant retained",
  "Version history retained"
];

export const versionHistory = [
  ["v0.6.0", "Consultancy workflow prototype"],
  ["v0.7.0", "Add Client and embedded assessment"],
  ["v0.8.0", "Clickable dashboard and reschedule detail"],
  ["v0.9.0", "Customisable dashboard"],
  ["v1.0.0", "Calendar release and module restore"],
  ["v1.1.0", "Client onboarding and first consultation"],
  ["v1.2.0", "CRM and scheduling"],
  ["v2.0.1", "Recovery build"],
  ["v2.1.0", "Repair build"],
  ["v2.2.0", "Operational build: per-client assessment persistence, calendar-to-visit and reports-to-client navigation, multi-file architecture"],
  ["v2.3.0", "Backend and database release: Node + SQLite API replaces localStorage, dashboard widget prefs synced server-side"],
  ["v3.0.0", "Auth and Postgres release: password login with sessions, SQLite migrated to Postgres, Railway deployment config"],
  ["v4.0.0", "Vercel and Supabase release: backend rewritten as serverless functions, database logic moved into Postgres RPC functions, deployed to a dedicated Supabase project"]
];

