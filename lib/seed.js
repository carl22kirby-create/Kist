export const seedData = {
  clients: [
    {
      id: "c1", name: "Demo Company Ltd", industry: "Manufacturing", size: "51 to 100", turnover: "£8.5m",
      address: "Staffordshire", website: "www.democompany.co.uk", score: 72, previous: 64, health: "Stable",
      status: "Active", tags: ["Manufacturing", "Automation", "Report Due"],
      notes: "Operational complexity, manual reporting and AI process opportunity.",
      profile: { industry: "Manufacturing", capabilities: ["Warehouse Operations"], regulations: ["ISO 9001"] },
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
      profile: { industry: "Manufacturing", capabilities: ["Field Service"], regulations: ["ISO 45001"] },
      contacts: [{ id: "p3", name: "James Walker", role: "Operations Director", email: "james@abc.co.uk", phone: "01782 000000", primary: true }],
      timeline: [{ id: "t3", date: "2026-05-28", type: "Discovery", title: "Initial conversation logged" }]
    },
    {
      id: "c3", name: "Stafford Logistics", industry: "Logistics", size: "101 to 250", turnover: "£12.3m",
      address: "Stafford", website: "www.staffordlogistics.co.uk", score: 78, previous: 73, health: "Excellent",
      status: "Active", tags: ["Logistics", "Follow Up", "AI Opportunity"],
      notes: "Strong operation with automation and customer visibility opportunities.",
      profile: { industry: "Logistics", capabilities: ["Fleet Management", "Warehouse Operations", "Exporting"], regulations: [] },
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
  assessments: {},
  widgets: { metrics: true, diary: true, health: true, dna: true, reports: true, actions: true, ai: true }
};
