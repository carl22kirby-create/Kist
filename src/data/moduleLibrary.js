// Module Library — Layers 2 through 5 of the KIST assessment engine.
//
// Layer 1 (Universal) lives in seedData.js as the original 250 questions and
// always applies to every client, unchanged.
//
// Everything here is additional: only included in a given client's
// assessment if their Business Profile matches the module's tag. A question
// can carry more than one tag (e.g. "Fleet Management" appears both as part
// of the Logistics industry module and as a standalone capability, since a
// non-logistics business — a utilities company, for instance — can also
// have a fleet).
//
// Each entry still maps to one of the 11 universal KIST categories so it
// rolls into the same KIST Business DNA scoring and radar chart as every
// other question — modules change WHICH questions a client sees, not how
// the resulting score is structured.
//
// These starter modules are intentionally lean (a handful of genuine,
// evidence-based questions each) rather than exhaustive. The engine is
// built to make expanding any one of them later a content change only, not
// a structural one.

function mod(category, tag, items, { observation = false, evidenceType } = {}) {
  return items.map((q) => ({
    category,
    tags: [tag],
    type: observation ? "observation" : "question",
    question: q,
    evidenceType: evidenceType || (observation ? "Observed" : undefined) // undefined = inferred later
  }));
}

// --- Layer 2: Industry Modules ---
const industryModules = [
  ...mod("Operations and Process", "Industry:Logistics", [
    "Walk me through how a shipment is tracked from the moment it's booked to the moment it's delivered.",
    "What evidence shows warehouse pick accuracy is measured, and what happens when it falls short?",
    "Describe how a missed delivery window is identified and communicated before the customer has to ask.",
    "How is fleet utilisation tracked, and what's been done recently to improve it?",
    "What happens when a customs or cross border compliance requirement isn't met on time?"
  ]),
  ...mod("Operations and Process", "Industry:Manufacturing", [
    "Walk me through how a production run is planned and what happens when it falls behind schedule.",
    "What evidence shows preventative maintenance is actually carried out on schedule, not just planned?",
    "Describe how a quality defect discovered on the line gets traced back to its root cause.",
    "How is raw material or component inventory managed to avoid both shortages and excess stock?",
    "What happens when a machine breakdown threatens a customer delivery date?"
  ]),
  ...mod("Customer Experience", "Industry:Retail", [
    "Describe how consistent the in store experience is across different staff, shifts or locations.",
    "What evidence shows stock availability on the shelf matches what the system says should be there?",
    "How is visual merchandising decided, and how is its impact on sales actually measured?",
    "Walk me through what happens when a customer wants to return or exchange an item.",
    "What happens during peak trading periods when footfall exceeds normal staffing levels?"
  ]),
  ...mod("Customer Experience", "Industry:Hospitality", [
    "Walk me through what happens between a booking being made and the guest actually arriving.",
    "What evidence shows food safety standards are followed consistently during service, not just at inspection?",
    "Describe how a below par guest experience is identified and recovered while the guest is still present.",
    "How is kitchen and front of house communication managed during a busy service?",
    "What happens when a guest's specific dietary or accessibility need isn't caught before they arrive?"
  ]),
  ...mod("Sales and Marketing", "Industry:Professional Services", [
    "Walk me through how a new client engagement is scoped and agreed before work begins.",
    "What evidence shows client work is delivered consistently regardless of which team member handles it?",
    "Describe how knowledge and expertise is captured so it isn't lost when a senior person leaves.",
    "How is client satisfaction tracked across the life of an engagement, not just at the end?",
    "What happens when a client engagement runs over scope or budget partway through?"
  ])
];

// --- Layer 3: Capability Modules ---
// These apply based on what the business actually does, independent of
// industry — a construction firm and a utilities company can both have a
// fleet and field engineers despite being in different industries.
const capabilityModules = [
  ...mod("Operations and Process", "Capability:Warehouse Operations", [
    "How is stock accuracy measured, and what's the current variance between system and physical counts?",
    "Describe what happens when a pick or pack error reaches a customer.",
    "What evidence shows warehouse layout is reviewed for efficiency rather than left as it's always been?"
  ]),
  ...mod("Operations and Process", "Capability:Fleet Management", [
    "How is vehicle utilisation and downtime tracked across the fleet?",
    "Describe how driver behaviour and vehicle condition are monitored day to day.",
    "What happens when a vehicle fails a safety or compliance check?"
  ]),
  ...mod("Operations and Process", "Capability:Field Service", [
    "Walk me through how a field engineer's job is scheduled, communicated and confirmed with the customer.",
    "What evidence shows first time fix rate is tracked, and what's driving it up or down?",
    "How is a field engineer supported when they encounter something outside their expertise on site?"
  ]),
  ...mod("Operations and Process", "Capability:Manufacturing", [
    "Describe how production efficiency is measured beyond simply hitting output targets.",
    "What happens when a quality issue is traced back to a specific shift, machine or supplier?",
    "How is planned versus actual production reviewed, and what changes as a result?"
  ]),
  ...mod("Customer Experience", "Capability:Customer Support", [
    "What evidence shows customer support response times are measured against a defined standard?",
    "Describe what happens when a support case can't be resolved by the first person who picks it up.",
    "How is customer sentiment tracked across support interactions, not just resolution rate?"
  ]),
  ...mod("Customer Experience", "Capability:Call Centre", [
    "How is call quality monitored, and what happens as a result of a call scoring poorly?",
    "What evidence shows average wait time is tracked and actively managed, not just recorded?",
    "Describe how a call handler is supported when a customer becomes difficult or distressed."
  ]),
  ...mod("Sales and Marketing", "Capability:Sales Team", [
    "How is individual and team sales performance reviewed, and what happens when someone consistently underperforms?",
    "What evidence shows the sales team follows a consistent process rather than everyone selling their own way?",
    "Describe how sales forecasts are built and how accurate they've been recently."
  ]),
  ...mod("Operations and Process", "Capability:Project Delivery", [
    "Walk me through how a project's scope, budget and timeline are tracked once work is underway.",
    "What happens when a project is at risk of running over budget or past deadline?",
    "How is a completed project reviewed to capture what would be done differently next time?"
  ]),
  ...mod("Finance and Commercial Control", "Capability:Procurement", [
    "How are suppliers selected and reviewed, beyond simply choosing the lowest price?",
    "What evidence shows procurement spend is tracked against budget in real time?",
    "Describe what happens when a critical supplier's pricing or terms change unexpectedly."
  ]),
  ...mod("Risk Compliance and Resilience", "Capability:Exporting", [
    "How is export documentation and customs compliance managed for each shipment?",
    "What happens when a destination country's import requirements change?",
    "Describe how currency and payment risk is managed on international sales."
  ]),
  ...mod("Risk Compliance and Resilience", "Capability:Importing", [
    "How is supplier and customs compliance verified before goods are imported?",
    "What happens when an imported shipment is delayed or held at the border?",
    "Describe how import cost, including duty and exchange rate movement, is factored into pricing."
  ]),
  ...mod("Sales and Marketing", "Capability:Ecommerce", [
    "How effectively does the online store convert visitors into paying customers, and how is that measured?",
    "What happens when an online order can't be fulfilled as shown at checkout?",
    "Describe how cart abandonment is tracked and what's been done to address it."
  ]),
  ...mod("Finance and Commercial Control", "Capability:Subscriptions", [
    "How is subscriber churn measured, and what's driving it currently?",
    "What happens when a recurring payment fails?",
    "Describe how subscriber value is tracked over the lifetime of the relationship, not just at signup."
  ]),
  ...mod("Operations and Process", "Capability:Franchises", [
    "How is consistency maintained across franchise locations, and what happens when one falls below standard?",
    "What evidence shows franchisees are properly supported, not just monitored for compliance?",
    "Describe how best practice from one location gets shared across the rest of the network."
  ]),
  ...mod("Operations and Process", "Capability:Multi Site Operations", [
    "How is performance compared across sites, and what happens when one consistently underperforms?",
    "What evidence shows standards are applied consistently across every site, not just the flagship one?",
    "Describe how a decision made at head office actually gets implemented on the ground at each site."
  ]),
  ...mod("People and Capability", "Capability:Remote Workforce", [
    "How is performance and engagement measured for staff who aren't physically present day to day?",
    "What evidence shows remote staff have equal access to support, training and career progression?",
    "Describe how team culture and communication are maintained across a distributed workforce."
  ])
];

// --- Layer 4: Regulatory Modules ---
// Kept at the level of "what evidence proves this is genuinely working",
// rather than citing specific clause numbers that can change over time —
// the assessment tests operating reality, not just certificate paperwork.
const regulatoryModules = [
  ...mod("Risk Compliance and Resilience", "Regulatory:ISO 9001", [
    "What evidence shows corrective actions from your most recent internal audit have actually been implemented?",
    "Describe how nonconformities are identified and tracked through to resolution.",
    "How is customer satisfaction data actually used to drive documented improvement, not just recorded?"
  ]),
  ...mod("Risk Compliance and Resilience", "Regulatory:ISO 14001", [
    "What evidence shows environmental objectives are actively tracked, not just set once and forgotten?",
    "Describe how a significant environmental incident would be identified, reported and investigated.",
    "How is supplier environmental performance assessed as part of your own compliance?"
  ]),
  ...mod("Risk Compliance and Resilience", "Regulatory:ISO 27001", [
    "What evidence shows information security risks are formally assessed and reviewed on a regular basis?",
    "Describe how an actual or suspected data breach would be identified and escalated.",
    "How is access to sensitive systems and data reviewed and removed when no longer needed?"
  ]),
  ...mod("Risk Compliance and Resilience", "Regulatory:ISO 45001", [
    "What evidence shows near misses and minor incidents are reported, not just serious accidents?",
    "Describe how health and safety risk assessments are kept current as the business changes.",
    "How is worker consultation on health and safety actually carried out, not just documented as a policy?"
  ]),
  ...mod("Risk Compliance and Resilience", "Regulatory:CQC", [
    "What evidence shows care plans are reviewed and updated to reflect a person's current needs?",
    "Describe how a safeguarding concern would be identified, escalated and followed through.",
    "How is staff competency verified and kept current for the care being delivered?"
  ]),
  ...mod("Risk Compliance and Resilience", "Regulatory:FCA", [
    "What evidence shows customer outcomes are actively monitored in line with Consumer Duty expectations?",
    "Describe how a customer complaint involving potential harm would be identified and escalated.",
    "How is staff training on regulatory requirements verified as effective, not just completed?"
  ]),
  ...mod("Risk Compliance and Resilience", "Regulatory:GDPR", [
    "What evidence shows personal data is only kept for as long as there's a genuine business reason to hold it?",
    "Describe how the business would respond to a subject access request within the required timeframe.",
    "How is consent for marketing or data use actually recorded and kept current?"
  ]),
  ...mod("Risk Compliance and Resilience", "Regulatory:Food Hygiene", [
    "What evidence shows temperature control records are checked and acted on, not just filled in?",
    "Describe what happens when a food safety issue is identified during service.",
    "How is staff food hygiene training kept current, and how is it verified in practice rather than on paper?"
  ]),
  ...mod("Risk Compliance and Resilience", "Regulatory:Construction Design and Management", [
    "What evidence shows a principal designer's duties are being actively fulfilled on current projects?",
    "Describe how a site specific risk is identified and communicated before work begins.",
    "How is subcontractor competency verified before they're allowed on site?"
  ]),
  ...mod("Risk Compliance and Resilience", "Regulatory:Environmental Compliance", [
    "What evidence shows waste is disposed of through properly licensed and verified routes?",
    "Describe how an environmental permit condition is monitored for ongoing compliance.",
    "How would an environmental incident, such as a spill or discharge, be identified and reported?"
  ]),
  ...mod("Risk Compliance and Resilience", "Regulatory:Medical Device Regulations", [
    "What evidence shows device traceability is maintained from manufacture through to end use?",
    "Describe how an adverse event involving a device would be identified, reported and investigated.",
    "How is post market surveillance actually carried out, rather than assumed to be someone else's responsibility?"
  ])
];

// --- Layer 5: Observation Module ---
// Universal, cross-industry items the consultant scores from direct
// observation rather than by asking the client — evidence should always
// outweigh opinion, per the KIST assessment philosophy.
const observationModule = mod("Customer Experience", "Observation", [
  "How professional and trustworthy does the website look and feel when viewed as a prospective customer would see it?",
  "How consistent is branding across the website, signage, vehicles and printed material?",
  "How professional is staff appearance and presentation on arrival?",
  "How is the telephone answered, and what tone and professionalism does the greeting set?",
  "How clean, organised and well presented is the reception or entrance area?",
  "How clear and professional is signage, both external and internal?",
  "How well presented and maintained are company vehicles, if any are visible?",
  "How safe and well organised does the premises appear during a walk through?",
  "How accessible is the premises for a visitor with additional needs?",
  "How professional and well organised do meeting rooms or client facing spaces appear?",
  "How would a customer describe their overall journey through the premises, from arrival to leaving?"
], { observation: true });

export const moduleLibrary = [...industryModules, ...capabilityModules, ...regulatoryModules, ...observationModule];

// Controlled lists used to drive the Business Profile step in Client
// Onboarding — these must line up with the tag names used above so matching
// works, but are kept separate here as the single source of truth for the UI.
export const industryOptions = ["Logistics", "Manufacturing", "Retail", "Hospitality", "Professional Services", "Other"];
export const capabilityOptions = [
  "Warehouse Operations", "Fleet Management", "Field Service", "Manufacturing", "Customer Support",
  "Call Centre", "Sales Team", "Project Delivery", "Procurement", "Exporting", "Importing",
  "Ecommerce", "Subscriptions", "Franchises", "Multi Site Operations", "Remote Workforce"
];
export const regulatoryOptions = [
  "ISO 9001", "ISO 14001", "ISO 27001", "ISO 45001", "CQC", "FCA", "GDPR",
  "Food Hygiene", "Construction Design and Management", "Environmental Compliance", "Medical Device Regulations"
];
