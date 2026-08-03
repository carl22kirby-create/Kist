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
  ["v2.2.0", "Operational build: per-client assessment persistence, calendar-to-visit and reports-to-client navigation, multi-file architecture"]
];

export const seedData = {
  clients: [
    {
      id: "c1", name: "Demo Company Ltd", industry: "Manufacturing", size: "51 to 100", turnover: "£8.5m",
      address: "Staffordshire", website: "www.democompany.co.uk", score: 72, previous: 64, health: "Stable",
      status: "Active", tags: ["Manufacturing", "Automation", "Report Due"],
      notes: "Operational complexity, manual reporting and AI process opportunity.",
      contacts: [
        { id: "p1", name: "Sarah Mitchell", role: "Managing Director", email: "sarah@demo.co.uk", phone: "01785 000000", primary: true },
        { id: "p2", name: "Daniel Price", role: "Finance Director", email: "daniel@demo.co.uk", phone: "01785 000001", primary: false }
      ],
      timeline: [
        { id: "t1", date: "2026-06-12", type: "Assessment", title: "Full KIST assessment completed" },
        { id: "t2", date: "2026-06-14", type: "Report", title: "Report generated" }
      ]
    },
    {
      id: "c2", name: "ABC Engineering", industry: "Engineering", size: "11 to 50", turnover: "£4.1m",
      address: "Stoke on Trent", website: "www.abcengineering.co.uk", score: 64, previous: 58, health: "Watch",
      status: "Prospect", tags: ["Engineering", "High Risk", "First Assessment"],
      notes: "Growth potential. Focus on operations, process control and reporting.",
      contacts: [{ id: "p3", name: "James Walker", role: "Operations Director", email: "james@abc.co.uk", phone: "01782 000000", primary: true }],
      timeline: [{ id: "t3", date: "2026-05-28", type: "Discovery", title: "Initial conversation logged" }]
    },
    {
      id: "c3", name: "Stafford Logistics", industry: "Logistics", size: "101 to 250", turnover: "£12.3m",
      address: "Stafford", website: "www.staffordlogistics.co.uk", score: 78, previous: 73, health: "Excellent",
      status: "Active", tags: ["Logistics", "Follow Up", "AI Opportunity"],
      notes: "Strong operation with automation and customer visibility opportunities.",
      contacts: [{ id: "p4", name: "Mark Edwards", role: "General Manager", email: "mark@stafford.co.uk", phone: "01785 111111", primary: true }],
      timeline: [{ id: "t4", date: "2026-06-02", type: "Follow Up", title: "Follow up review completed" }]
    }
  ],
  schedule: [
    { id: "s1", date: "2026-07-06", start: "09:00", end: "12:00", clientId: "c2", client: "ABC Engineering", type: "Business Assessment", consultant: "Carl Kirby", location: "Stoke on Trent", status: "Scheduled", colour: "amber" },
    { id: "s2", date: "2026-07-06", start: "13:30", end: "14:30", clientId: "c1", client: "Demo Company Ltd", type: "Report Review", consultant: "Carl Kirby", location: "Stafford", status: "Scheduled", colour: "blue" },
    { id: "s3", date: "2026-07-07", start: "10:00", end: "11:00", clientId: "c3", client: "Stafford Logistics", type: "Follow Up", consultant: "Carl Kirby", location: "Stafford", status: "Scheduled", colour: "green" }
  ],
  actions: [
    { id: "a1", clientId: "c1", client: "Demo Company Ltd", title: "Map order to delivery process", owner: "Operations Manager", priority: "High", status: "In Progress", due: "2026-07-31" },
    { id: "a2", clientId: "c2", client: "ABC Engineering", title: "Create complaint categories", owner: "Customer Lead", priority: "Medium", status: "Not Started", due: "2026-07-25" },
    { id: "a3", clientId: "c3", client: "Stafford Logistics", title: "Review AI customer updates", owner: "General Manager", priority: "Medium", status: "In Progress", due: "2026-08-05" }
  ],
  reports: [
    { id: "r1", clientId: "c2", client: "ABC Engineering", title: "Full Business Performance Report", status: "Due Today" },
    { id: "r2", clientId: "c1", client: "Demo Company Ltd", title: "90 Day Review Report", status: "Draft" },
    { id: "r3", clientId: "c3", client: "Stafford Logistics", title: "Follow Up Summary", status: "Overdue" }
  ],
  // Assessment answers persisted per client: { [clientId]: Array<Question> }
  assessments: {}
};
