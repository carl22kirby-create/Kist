// KIST Knowledge Base.
//
// Each entry has four independently editable layers, deliberately kept
// separate rather than flattened into one object:
//
//   concept       WHAT this is and why it matters. Essentially never
//                 changes — name, purpose, category, tags, type.
//   method        HOW we currently assess it — the question asked, what
//                 evidence should support an answer, what to look for on
//                 site, what metrics apply, how often it should be reviewed.
//   scoring       HOW we currently score it — six bands (0-5), each with a
//                 maturity label and a description specific to this
//                 concept. The maturity label set (Foundation, Foundation,
//                 Intermediate, Advanced, Best Practice, Industry Leading)
//                 is the shared structure across every concept; if KIST
//                 ever moves to a different scale, that's one change to
//                 the shape everything follows, not an edit to each concept.
//   improvement   WHAT we currently recommend at each score. Specific to
//                 this concept, independent of scoring — you can rewrite
//                 recommendations without touching how something is scored,
//                 or vice versa.
//
// This separation is what lets a future feature reason across concepts
// together ("your inventory problem is process, not technology") rather
// than just replaying one canned recommendation per question in isolation
// — the scoring and improvement layers are addressable on their own,
// independent of the question that produced a score.

const MATURITY_LABELS = ["Foundation", "Foundation", "Intermediate", "Advanced", "Best Practice", "Industry Leading"];

function band(description) {
  return description;
}

function buildScoring(descriptions) {
  return descriptions.map((description, score) => ({ score, maturity: MATURITY_LABELS[score], description }));
}

function buildImprovement(recommendations) {
  return recommendations.map((recommendation, score) => ({ score, recommendation }));
}

function concept({ name, purpose, category, tags, observation = false }) {
  return { name, purpose, category, tags, type: observation ? "observation" : "question" };
}

function knowledgeItem(conceptDef, method, scoringDescriptions, improvementRecommendations) {
  return {
    concept: conceptDef,
    method,
    scoring: buildScoring(scoringDescriptions),
    improvement: buildImprovement(improvementRecommendations)
  };
}

export const knowledgeBase = [
  knowledgeItem(
    concept({
      name: "Stock Accuracy", purpose: "Measure how effectively inventory is controlled.",
      category: "Operations and Process", tags: ["Warehouse", "Retail", "Manufacturing", "Distribution", "Inventory", "ISO 9001", "Risk", "Customer Experience"]
    }),
    {
      question: "How is stock accuracy measured?",
      evidenceRequired: ["Cycle count reports", "WMS reports", "Stock adjustment reports"],
      observationPoints: ["Warehouse layout", "Labelling", "Damaged stock", "Picking process"],
      metrics: ["Inventory accuracy %", "Shrinkage", "Stock variance"],
      frequency: "Quarterly to monthly, depending on stock value and turnover"
    },
    ["No stock control.", "Stock counted occasionally.", "Basic controls in place.", "Regular counting in place.", "Excellent controls.", "Industry leading."],
    ["Recommend introducing basic inventory controls.", "Introduce scheduled cycle counts.", "Implement a warehouse management system.", "Improve KPI reporting on stock accuracy.", "Benchmark stock accuracy against industry standards.", "Maintain current excellence and share practice across the business."]
  ),

  knowledgeItem(
    concept({
      name: "Preventative Maintenance", purpose: "Measure whether equipment failure is being prevented rather than reacted to.",
      category: "Operations and Process", tags: ["Manufacturing", "Engineering", "Facilities", "Utilities", "Fleet Management", "ISO 45001"]
    }),
    {
      question: "Describe your preventative maintenance programme and how compliance with it is verified.",
      evidenceRequired: ["Maintenance schedule", "Completed maintenance logs", "Breakdown history"],
      observationPoints: ["Equipment condition", "Visible maintenance records at point of use"],
      metrics: ["Planned versus reactive maintenance ratio", "Unplanned downtime hours"],
      frequency: "Reviewed monthly against the maintenance schedule"
    },
    ["No maintenance programme.", "Maintenance only happens after breakdown.", "A schedule exists but is inconsistently followed.", "Schedule followed with basic compliance tracking.", "Compliance verified and downtime actively reduced.", "Predictive maintenance informed by real data."],
    ["Recommend introducing a basic maintenance schedule for critical equipment.", "Move from purely reactive to at least partially scheduled maintenance.", "Introduce compliance tracking against the existing schedule.", "Use downtime data to prioritise which equipment needs tighter intervals.", "Explore condition based or predictive maintenance for highest value assets.", "Maintain current practice and document it as a reference standard."]
  ),

  knowledgeItem(
    concept({
      name: "Customer Complaints", purpose: "Measure whether customer feedback actually changes how the business operates.",
      category: "Customer Experience", tags: ["Retail", "Hospitality", "Professional Services", "Customer Support", "Call Centre", "ISO 9001"]
    }),
    {
      question: "What changes have been implemented because of customer complaints during the last 12 months?",
      evidenceRequired: ["Complaint log", "Root cause analysis", "Evidence of a resulting change"],
      observationPoints: [],
      metrics: ["Complaint volume trend", "Repeat complaint rate", "Time to resolution"],
      frequency: "Reviewed monthly, trends reviewed quarterly"
    },
    ["Complaints are not recorded.", "Complaints are recorded but rarely reviewed.", "Complaints are reviewed but rarely lead to change.", "Some complaints lead to a documented change.", "Complaints consistently drive tracked improvement.", "Complaint data actively shapes strategy and is shared business wide."],
    ["Start recording every complaint in one place, however simple.", "Introduce a regular review of the complaint log, even monthly is a start.", "Pick one recurring complaint theme and trace it to a specific process change.", "Track whether a change made in response to a complaint actually reduced its recurrence.", "Build complaint themes into regular management reporting.", "Use complaint trends to inform strategic decisions, not just operational fixes."]
  ),

  knowledgeItem(
    concept({
      name: "Leadership Communication", purpose: "Measure whether leadership decisions genuinely reach and are understood by the wider team.",
      category: "Leadership and Accountability", tags: ["Leadership", "Culture", "Communication"]
    }),
    {
      question: "Describe how leadership decisions get communicated down through the business, using a recent example.",
      evidenceRequired: ["Team briefing notes", "Internal communications", "Staff confirmation of understanding"],
      observationPoints: [],
      metrics: ["Staff survey understanding score, where available"],
      frequency: "Reviewed after any significant decision or change"
    },
    ["Decisions are not communicated beyond senior leadership.", "Communication happens but inconsistently and informally.", "A regular communication channel exists but understanding isn't checked.", "Communication is regular and understanding is checked informally.", "Communication is structured and understanding is verified.", "Two way communication is embedded, with feedback shaping future decisions."],
    ["Introduce a simple, regular way of sharing decisions with the wider team.", "Make the existing communication channel consistent rather than ad hoc.", "Start checking, even informally, whether the message actually landed.", "Formalise a check on understanding after significant communications.", "Close the loop by inviting and acting on feedback from staff.", "Maintain the two way channel and use it as a model for other decisions."]
  ),

  knowledgeItem(
    concept({
      name: "Website Credibility", purpose: "Measure whether the website builds trust and converts interest into enquiries, as a first impression of the business.",
      category: "Sales and Marketing", tags: ["Sales Team", "Ecommerce", "Visual Presentation", "Professionalism"],
      observation: true
    }),
    {
      question: "How effectively does the website communicate what this business offers, build trust and convert visitors into enquiries?",
      evidenceRequired: ["Website analytics", "Conversion rate data"],
      observationPoints: ["Professional appearance", "Loading speed", "Mobile responsiveness", "Clarity of offer", "Ease of enquiry or purchase"],
      metrics: ["Conversion rate", "Bounce rate", "Mobile versus desktop performance"],
      frequency: "Reviewed at least annually, or after any redesign"
    },
    ["No functioning website.", "Website exists but is outdated or hard to use.", "Website is usable but doesn't clearly build trust.", "Website is professional with a clear offer.", "Website is professional, fast, and measurably converts visitors.", "Website is best in class and actively tested and improved."],
    ["A basic, functioning website should be the first priority.", "Address the most visible usability or currency issues first.", "Clarify what the business actually offers within the first few seconds of landing.", "Introduce basic analytics if none exist, to know what's actually happening.", "Test specific changes against conversion rate rather than assuming what works.", "Maintain regular testing and treat the website as a living asset, not a one off project."]
  ),

  knowledgeItem(
    concept({
      name: "Cash Flow Forecasting", purpose: "Measure whether the business can see financial trouble coming before it arrives.",
      category: "Finance and Commercial Control", tags: ["Finance", "Commercial Performance", "Risk"]
    }),
    {
      question: "Describe how cash flow is forecast, and how far ahead that forecast typically looks.",
      evidenceRequired: ["Cash flow forecast document", "Forecast versus actual comparison"],
      observationPoints: [],
      metrics: ["Forecast accuracy over time", "Forecast horizon in weeks or months"],
      frequency: "Updated at least monthly"
    },
    ["No forecasting takes place.", "Forecasting happens informally and irregularly.", "A basic forecast exists but is rarely updated.", "A regularly updated forecast exists with a short horizon.", "A reliable forecast exists and is checked against actuals.", "Forecasting is accurate, forward looking, and drives commercial decisions."],
    ["Start with a simple weekly or monthly cash position forecast.", "Make forecasting a regular habit rather than an occasional exercise.", "Extend the forecast horizon and update it on a fixed schedule.", "Begin comparing forecast against actual to build accuracy over time.", "Use forecast accuracy to build confidence in longer term decisions.", "Maintain the discipline and use it to inform strategic, not just operational, decisions."]
  ),

  knowledgeItem(
    concept({
      name: "Supplier Performance", purpose: "Measure whether supplier reliability is actively managed rather than simply tolerated.",
      category: "Finance and Commercial Control", tags: ["Procurement", "Manufacturing", "Logistics", "Distribution", "ISO 9001"]
    }),
    {
      question: "How is supplier reliability measured and what happens when a supplier underperforms?",
      evidenceRequired: ["Supplier scorecards", "Delivery performance data", "Escalation records"],
      observationPoints: [],
      metrics: ["On time in full delivery rate", "Defect or return rate by supplier"],
      frequency: "Reviewed quarterly for key suppliers"
    },
    ["Supplier performance is not tracked.", "Problems are noticed but not formally recorded.", "Basic tracking exists for the most critical suppliers only.", "Performance is tracked and reviewed for most suppliers.", "Performance data drives supplier reviews and decisions.", "Supplier relationships are actively developed based on shared performance data."],
    ["Start tracking on time and in full delivery for your highest impact suppliers.", "Record supplier issues formally, even in a simple shared document.", "Extend basic tracking beyond just the most critical suppliers.", "Use tracked data in a regular supplier review conversation.", "Let performance data directly inform which suppliers get more or less business.", "Share performance data with suppliers to drive joint improvement."]
  ),

  knowledgeItem(
    concept({
      name: "Recruitment", purpose: "Measure whether recruitment brings in people who succeed in the role, not just people who were available.",
      category: "People and Capability", tags: ["People", "Culture", "Remote Workforce"]
    }),
    {
      question: "What evidence exists that recruitment brings in the right people rather than just available people?",
      evidenceRequired: ["Recruitment process documentation", "New starter retention data", "Probation pass rate"],
      observationPoints: [],
      metrics: ["Probation pass rate", "12 month retention rate", "Time to hire"],
      frequency: "Reviewed after each hiring round, trends reviewed annually"
    },
    ["No defined recruitment process.", "Recruitment is informal and inconsistent.", "A basic process exists but outcomes aren't tracked.", "A consistent process exists and probation outcomes are tracked.", "Recruitment outcomes are tracked and used to refine the process.", "Recruitment is data led and consistently brings in strong long term hires."],
    ["Write down even a basic, repeatable recruitment process.", "Make the existing process consistent across every hire.", "Start tracking probation pass rate as a simple success signal.", "Review retention data regularly and feed it back into how you recruit.", "Use hiring outcome data to refine what you screen for.", "Maintain the discipline and treat recruitment as a measurable, improvable process."]
  ),

  knowledgeItem(
    concept({
      name: "Training Effectiveness", purpose: "Measure whether training actually changes performance, rather than just being delivered.",
      category: "People and Capability", tags: ["People", "Training", "Culture"]
    }),
    {
      question: "What evidence shows that training actually improves performance rather than simply being delivered?",
      evidenceRequired: ["Training records", "Before and after performance data", "Manager feedback"],
      observationPoints: [],
      metrics: ["Performance change following training", "Training completion rate"],
      frequency: "Reviewed after major training investment, otherwise annually"
    },
    ["No training takes place.", "Training happens but attendance isn't tracked.", "Attendance is tracked but impact is not.", "Impact is checked informally through manager feedback.", "Impact is measured against a specific performance metric.", "Training investment is prioritised based on proven performance return."],
    ["Start with basic training on the highest priority skill gap.", "Track who has actually attended training, not just what's been offered.", "Pick one recent training and check whether performance actually changed.", "Ask managers directly whether they've seen a change in performance.", "Define a metric before training begins so impact can be measured afterwards.", "Use measured impact to decide where future training investment goes."]
  ),

  knowledgeItem(
    concept({
      name: "Sales Conversion", purpose: "Measure whether the sales pipeline reflects sales reality rather than aspiration.",
      category: "Sales and Marketing", tags: ["Sales Team", "Ecommerce", "Commercial Performance", "Data"]
    }),
    {
      question: "How is the sales pipeline tracked, and how confident are you in the numbers in it right now?",
      evidenceRequired: ["CRM or pipeline data", "Conversion rate by stage"],
      observationPoints: [],
      metrics: ["Conversion rate by stage", "Pipeline accuracy versus closed outcome"],
      frequency: "Reviewed weekly for active pipeline, monthly for conversion trends"
    },
    ["No pipeline is tracked.", "A pipeline exists but is rarely updated.", "The pipeline is updated but contains stale entries.", "The pipeline is actively maintained and broadly accurate.", "Conversion rate by stage is tracked and used to coach the team.", "Pipeline data reliably predicts revenue and shapes resourcing decisions."],
    ["Start recording every active opportunity in one place.", "Build a habit of updating the pipeline on a fixed schedule.", "Remove stale or dead opportunities so the numbers reflect reality.", "Start tracking conversion rate at each stage, not just overall.", "Use stage conversion data in coaching conversations with the sales team.", "Use pipeline reliability to inform hiring, targets and resourcing decisions."]
  ),

  knowledgeItem(
    concept({
      name: "Environmental Sustainability", purpose: "Measure whether environmental impact is actively managed rather than assumed to be someone else's concern.",
      category: "Risk Compliance and Resilience", tags: ["ISO 14001", "Environmental Compliance", "Manufacturing", "Logistics"]
    }),
    {
      question: "How are environmental objectives set, tracked and reviewed across the business?",
      evidenceRequired: ["Environmental policy", "Objective tracking data", "Waste or emissions records"],
      observationPoints: [],
      metrics: ["Waste volume trend", "Energy or emissions trend against a baseline"],
      frequency: "Reviewed annually, tracked continuously where possible"
    },
    ["No environmental policy or tracking.", "A policy exists but nothing is tracked against it.", "Basic waste or usage data is tracked informally.", "At least one measurable objective is tracked and reviewed.", "Multiple objectives are tracked and reviewed against a clear baseline.", "Environmental performance is actively improved and reported externally."],
    ["Start with a simple written policy stating current intentions.", "Begin tracking at least one basic measure, such as waste volume.", "Set one specific, measurable target against current tracked data.", "Review progress against that target on a fixed schedule.", "Extend tracking to a second measure and set a clear baseline.", "Consider external reporting or certification to validate ongoing performance."]
  ),

  knowledgeItem(
    concept({
      name: "Fleet Utilisation", purpose: "Measure whether vehicle assets are actively managed for efficiency rather than simply used until they fail.",
      category: "Operations and Process", tags: ["Fleet Management", "Logistics", "Transport Planning"]
    }),
    {
      question: "How is vehicle utilisation and downtime tracked across the fleet?",
      evidenceRequired: ["Vehicle tracking data", "Utilisation reports", "Maintenance downtime records"],
      observationPoints: ["Vehicle presentation and condition"],
      metrics: ["Utilisation rate", "Downtime hours per vehicle", "Cost per mile or per job"],
      frequency: "Reviewed monthly"
    },
    ["No tracking of vehicle usage or downtime.", "Downtime is noticed but not formally recorded.", "Basic tracking exists for some vehicles.", "Utilisation is tracked consistently across the fleet.", "Utilisation data drives maintenance and replacement decisions.", "Fleet performance is benchmarked and actively optimised."],
    ["Start recording downtime for your highest use vehicles.", "Record every incident of downtime, even informally, across the fleet.", "Extend tracking to cover the whole fleet consistently.", "Review utilisation data monthly as a standing habit.", "Use utilisation trends to inform maintenance scheduling and replacement timing.", "Benchmark utilisation against industry norms to find further efficiency."]
  ),

  knowledgeItem(
    concept({
      name: "Warehouse Organisation", purpose: "Measure whether warehouse layout supports efficient, safe operation rather than historical accident.",
      category: "Operations and Process", tags: ["Warehouse", "Logistics", "Distribution", "Manufacturing"],
      observation: true
    }),
    {
      question: "How is warehouse layout reviewed for efficiency rather than left as it's always been?",
      evidenceRequired: [],
      observationPoints: ["Warehouse organisation", "Labelling", "Storage", "Pick path efficiency", "Housekeeping and safety"],
      metrics: ["Average pick time", "Travel distance for top moving lines"],
      frequency: "Reviewed annually or after significant volume change"
    },
    ["Layout is disorganised with no clear logic.", "Layout has some logic but is inconsistently followed.", "Layout is functional but has never been reviewed for efficiency.", "Layout has been reviewed at least once against actual pick patterns.", "Layout is optimised for current top moving lines.", "Layout is continuously reviewed and adjusted as demand changes."],
    ["Address the most obvious organisation and safety issues first.", "Apply the existing logic consistently across the whole warehouse.", "Walk the pick path for your top five moving lines and note friction points.", "Reorganise based on that walk through, prioritising the biggest win first.", "Review layout each time volume or product mix changes materially.", "Treat layout as a continuously improving system, not a fixed decision."]
  ),

  knowledgeItem(
    concept({
      name: "Food Safety Practice", purpose: "Measure whether food safety standards hold up during live service, not just at inspection.",
      category: "Risk Compliance and Resilience", tags: ["Hospitality", "Food Hygiene", "Kitchen Operations"]
    }),
    {
      question: "What evidence shows food safety standards are followed consistently during service, not just at inspection?",
      evidenceRequired: ["Temperature logs", "Cleaning schedules", "Staff training records"],
      observationPoints: ["Kitchen cleanliness and organisation during live service"],
      metrics: ["Temperature log completion rate", "Internal audit score"],
      frequency: "Checked daily, formally reviewed monthly"
    },
    ["No food safety records kept.", "Records exist but are inconsistently completed.", "Records are mostly complete but rarely reviewed.", "Records are complete and reviewed regularly.", "Records are complete, reviewed, and used to correct issues quickly.", "Food safety practice is proactively audited and consistently exemplary."],
    ["Start with basic, consistent temperature logging.", "Make log completion a checked daily habit, not an occasional one.", "Introduce a regular review of completed logs, even weekly.", "Act visibly and quickly whenever a review identifies an issue.", "Use trends in the data to prevent issues before they occur.", "Maintain the standard and use it as the benchmark for other sites if multi site."]
  ),

  knowledgeItem(
    concept({
      name: "Guest Experience Recovery", purpose: "Measure whether a poor guest experience can be recovered in the moment, not just apologised for afterwards.",
      category: "Customer Experience", tags: ["Hospitality", "Reservations", "Guest Experience"]
    }),
    {
      question: "Describe how a below par guest experience is identified and recovered while the guest is still present.",
      evidenceRequired: ["Service recovery examples", "Staff empowerment policy"],
      observationPoints: [],
      metrics: ["Recovery rate for flagged issues", "Repeat visit rate following a complaint"],
      frequency: "Reviewed as incidents occur, trends reviewed quarterly"
    },
    ["Issues are only addressed after the guest has left, if at all.", "Staff notice issues but have no way to act on them.", "Some staff can act, but recovery is inconsistent.", "Staff are generally empowered to resolve issues on the spot.", "Recovery is consistent and tracked for effectiveness.", "Recovery consistently turns a poor experience into a loyal guest."],
    ["Give frontline staff at least one simple gesture they can offer without approval.", "Clarify explicitly what staff are allowed to do without asking a manager.", "Make that empowerment consistent across all staff, not just experienced ones.", "Start tracking how often in the moment recovery is actually used.", "Review recovery outcomes regularly to refine what works best.", "Treat recovered guests as a source of loyalty and word of mouth, and track it."]
  )
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

// Dependencies — lets the assessment shrink as more is known about the
// business. Each rule says: when this Business Profile answer is given,
// hard-exclude every item carrying the listed tag(s) — regardless of any
// other tag that item also carries.
export const dependencyQuestions = [
  { field: "hasWarehouse", label: "Does the business operate a warehouse?", excludeTagsWhenFalse: ["Warehouse"] },
  { field: "operatesOwnTransport", label: "Does the business operate its own transport or fleet, rather than outsourcing it?", excludeTagsWhenFalse: ["Fleet Management"] },
  { field: "manufactures", label: "Does the business manufacture or produce physical goods?", excludeTagsWhenFalse: ["Manufacturing"] },
  { field: "sellsOnline", label: "Does the business sell or take bookings online?", excludeTagsWhenFalse: ["Ecommerce"] }
];
