// Concept Library — the Business Knowledge Engine.
//
// Every entry here is one Assessment Item: a self-contained unit of
// business knowledge (a "concept") that can appear in any assessment whose
// tags match it. There is no such thing as "the Logistics module" as a
// fixed set of content — a module is just a saved combination of tags.
// One concept (e.g. Stock Accuracy) can carry tags spanning industries,
// capabilities and regulatory frameworks at once, and is authored exactly
// once no matter how many of those it's relevant to.
//
// This intentionally starts as a modest, genuine set of concepts (not
// thousands) — the point of this pass is the engine and the schema, not
// content volume. Growing the library later is purely a content exercise:
// add an object to conceptLibrary with the right tags, nothing else in the
// codebase needs to change.
//
// Assessment Item shape:
//   concept            short business-concept label, e.g. "Stock Accuracy"
//   question           the open, evidence-seeking question itself
//   category           which of the 11 KIST DNA categories this rolls into
//   type               "question" (asked to the client) or "observation"
//                       (scored by the consultant directly)
//   tags               flat array of tags — industries, capabilities,
//                       regulatory frameworks, or anything else. No prefixes.
//   evidenceRequired    array of concrete evidence examples that should
//                       support a score, e.g. ["Stock reports","Cycle count"]
//   observationPoints   array of things a consultant should physically look
//                       for during a visit, where relevant (can be empty)
//   scoringGuidance     how to interpret a 0-5 score for this concept
//   recommendations     improvement advice, generally framed for a low score

function item(concept, question, category, tags, extra = {}) {
  return {
    concept,
    question,
    category,
    tags,
    type: extra.observation ? "observation" : "question",
    evidenceRequired: extra.evidenceRequired || [],
    observationPoints: extra.observationPoints || [],
    scoringGuidance: extra.scoringGuidance ||
      "0-1: no evidence or ad hoc. 2-3: exists but inconsistent or undocumented. 4: consistent and evidenced. 5: consistent, evidenced and actively improved.",
    recommendations: extra.recommendations ||
      "Where scored below 4, agree a named owner and a specific next step with a review date, rather than a general intention to improve."
  };
}

export const conceptLibrary = [
  item("Stock Accuracy", "How is stock accuracy measured, and what's the current variance between system and physical counts?",
    "Operations and Process", ["Warehouse", "Retail", "Manufacturing", "Logistics", "Distribution", "ISO 9001", "Operations", "Inventory"],
    { evidenceRequired: ["Stock reports", "Cycle count records", "WMS or inventory system data"],
      observationPoints: ["Warehouse organisation", "Labelling", "Storage condition"],
      recommendations: "If variance isn't tracked, start with a monthly cycle count on highest value lines before attempting a full count." }),

  item("Preventative Maintenance", "Describe your preventative maintenance programme and how compliance with it is verified.",
    "Operations and Process", ["Manufacturing", "Engineering", "Facilities", "Utilities", "Fleet Management", "ISO 45001", "Operations"],
    { evidenceRequired: ["Maintenance schedule", "Completed maintenance logs", "Breakdown history"],
      observationPoints: ["Equipment condition", "Visible maintenance records at point of use"],
      recommendations: "Compare scheduled versus completed maintenance over the last quarter — a gap there is the first thing to close." }),

  item("Customer Complaints", "What changes have been implemented because of customer complaints during the last 12 months?",
    "Customer Experience", ["Retail", "Hospitality", "Professional Services", "Customer Support", "Call Centre", "ISO 9001", "Customer Experience"],
    { evidenceRequired: ["Complaint log", "Root cause analysis", "Evidence of a resulting change"],
      recommendations: "A complaint log that never produces a documented change is a record keeping exercise, not a feedback loop — look for at least one traceable example." }),

  item("Leadership Communication", "Describe how leadership decisions get communicated down through the business, using a recent example.",
    "Leadership and Accountability", ["Leadership", "Culture", "Communication"],
    { evidenceRequired: ["Team briefing notes", "Internal communications", "Staff confirmation of understanding"],
      recommendations: "If communication is verbal only, ask how leadership would know whether the message actually landed with frontline staff." }),

  item("Website Credibility", "How effectively does the website communicate what this business offers, build trust and convert visitors into enquiries?",
    "Sales and Marketing", ["Sales Team", "Ecommerce", "Visual Presentation", "Professionalism"],
    { observation: true,
      evidenceRequired: ["Website analytics", "Conversion rate data"],
      observationPoints: ["Professional appearance", "Loading speed", "Mobile responsiveness", "Clarity of what the business offers", "Ease of enquiry or purchase"],
      recommendations: "If there's no analytics data at all, that itself is the finding — a website with no measurement can't be improved with evidence, only guesswork." }),

  item("Cash Flow Forecasting", "Describe how cash flow is forecast, and how far ahead that forecast typically looks.",
    "Finance and Commercial Control", ["Finance", "Commercial Performance", "Risk"],
    { evidenceRequired: ["Cash flow forecast document", "Forecast versus actual comparison"],
      recommendations: "A forecast that's never compared against what actually happened isn't being used to manage the business, just produced for its own sake." }),

  item("Supplier Performance", "How is supplier reliability measured and what happens when a supplier underperforms?",
    "Finance and Commercial Control", ["Procurement", "Manufacturing", "Logistics", "Distribution", "ISO 9001", "Supplier Management"],
    { evidenceRequired: ["Supplier scorecards", "Delivery performance data", "Escalation records"],
      recommendations: "Where no formal scorecard exists, start by tracking on time and in full delivery rate for the three suppliers with the highest business impact." }),

  item("Recruitment", "What evidence exists that recruitment brings in the right people rather than just available people?",
    "People and Capability", ["People", "Culture", "Remote Workforce"],
    { evidenceRequired: ["Recruitment process documentation", "New starter retention data", "Probation pass rate"],
      recommendations: "Probation pass rate and 12 month retention are the two simplest signals that recruitment decisions are actually working." }),

  item("Training Effectiveness", "What evidence shows that training actually improves performance rather than simply being delivered?",
    "People and Capability", ["People", "Training", "Culture"],
    { evidenceRequired: ["Training records", "Before and after performance data", "Manager feedback"],
      recommendations: "If training completion is tracked but performance impact isn't, that's the gap — pick one recent training and trace its effect on a real metric." }),

  item("Sales Conversion", "How is the sales pipeline tracked, and how confident are you in the numbers in it right now?",
    "Sales and Marketing", ["Sales Team", "Ecommerce", "Commercial Performance", "Data"],
    { evidenceRequired: ["CRM or pipeline data", "Conversion rate by stage"],
      recommendations: "If pipeline confidence is low, the most common cause is stale entries that were never removed after a deal was lost — a quick audit usually reveals this fast." }),

  item("Environmental Sustainability", "How are environmental objectives set, tracked and reviewed across the business?",
    "Risk Compliance and Resilience", ["ISO 14001", "Environmental Compliance", "Manufacturing", "Logistics", "Risk"],
    { evidenceRequired: ["Environmental policy", "Objective tracking data", "Waste or emissions records"],
      recommendations: "A policy with no tracked objective behind it is a document, not a programme — ask for one measurable target currently being tracked." }),

  item("Fleet Utilisation", "How is vehicle utilisation and downtime tracked across the fleet?",
    "Operations and Process", ["Fleet Management", "Logistics", "Transport Planning"],
    { evidenceRequired: ["Vehicle tracking data", "Utilisation reports", "Maintenance downtime records"],
      observationPoints: ["Vehicle presentation and condition"],
      recommendations: "Where utilisation isn't tracked at all, downtime is usually far higher than assumed — even a basic weekly log will surface this quickly." }),

  item("Warehouse Organisation", "How is warehouse layout reviewed for efficiency rather than left as it's always been?",
    "Operations and Process", ["Warehouse", "Logistics", "Distribution", "Manufacturing"],
    { observation: true,
      observationPoints: ["Warehouse organisation", "Labelling", "Storage", "Pick path efficiency", "Housekeeping and safety"],
      recommendations: "Walk the pick path for the top five moving lines — the layout usually reveals itself as fine or clearly wrong within that single walk." }),

  item("Food Safety Practice", "What evidence shows food safety standards are followed consistently during service, not just at inspection?",
    "Risk Compliance and Resilience", ["Hospitality", "Food Hygiene", "Kitchen Operations"],
    { evidenceRequired: ["Temperature logs", "Cleaning schedules", "Staff training records"],
      observationPoints: ["Kitchen cleanliness and organisation during live service"],
      recommendations: "Ask to see today's temperature log, not last month's — consistency is proven by what's happening right now, not what's on file." }),

  item("Guest Experience Recovery", "Describe how a below par guest experience is identified and recovered while the guest is still present.",
    "Customer Experience", ["Hospitality", "Reservations", "Guest Experience"],
    { evidenceRequired: ["Service recovery examples", "Staff empowerment policy"],
      recommendations: "If recovery always requires manager approval, response time to unhappy guests is being slowed by process — consider what frontline staff can resolve unassisted." })
];

// Controlled lists used to drive the Business Profile step in Client
// Onboarding. These are the entry points into the tag space — selecting an
// industry, capability or regulation just adds that name as an active tag.
export const industryOptions = ["Logistics", "Manufacturing", "Retail", "Hospitality", "Professional Services", "Other"];
export const capabilityOptions = [
  "Warehouse", "Fleet Management", "Field Service", "Manufacturing", "Customer Support",
  "Call Centre", "Sales Team", "Project Delivery", "Procurement", "Exporting", "Importing",
  "Ecommerce", "Subscriptions", "Franchises", "Multi Site Operations", "Remote Workforce"
];
export const regulatoryOptions = [
  "ISO 9001", "ISO 14001", "ISO 27001", "ISO 45001", "CQC", "FCA", "GDPR",
  "Food Hygiene", "Construction Design and Management", "Environmental Compliance", "Medical Device Regulations"
];

// Dependencies — the piece that lets the assessment shrink as more is known
// about the business, rather than only ever growing from manual checkbox
// selection. Each rule says: when this Business Profile answer is given,
// hard-exclude every item carrying the listed tag(s) — regardless of any
// other tag that item also carries. A "no warehouse" answer removes every
// warehouse-tagged item completely, even one that's also tagged Retail.
export const dependencyQuestions = [
  { field: "hasWarehouse", label: "Does the business operate a warehouse?", excludeTagsWhenFalse: ["Warehouse"] },
  { field: "operatesOwnTransport", label: "Does the business operate its own transport or fleet, rather than outsourcing it?", excludeTagsWhenFalse: ["Fleet Management"] },
  { field: "manufactures", label: "Does the business manufacture or produce physical goods?", excludeTagsWhenFalse: ["Manufacturing"] },
  { field: "sellsOnline", label: "Does the business sell or take bookings online?", excludeTagsWhenFalse: ["Ecommerce"] }
];
