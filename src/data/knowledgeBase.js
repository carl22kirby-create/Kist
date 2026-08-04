// KIST Knowledge Base — the Business Knowledge Engine.
//
// Every entry is one Assessment Item (Business Performance Indicator, or
// BPI). Five layers, kept deliberately separate so any one of them can be
// revised without touching the others:
//
//   concept           WHAT this is and why it matters. Rarely changes.
//   method            HOW it's currently assessed (question, evidence,
//                     observation points, metrics, frequency).
//   scoring           HOW it's currently scored (six bands, 0-5, each with
//                     a maturity label and a concept-specific description).
//   opportunity       WHAT the commercial upside is at each score — not
//                     just "how to improve", but what kind of business
//                     benefit doing so would unlock, and how a consultant
//                     should go about sizing it for a real client (never a
//                     fabricated number — a method for estimating one).
//   guidance          Consultant-only tacit knowledge, never client-facing.
//
// Two things sit alongside every concept but are NOT about the concept's
// content:
//
//   commercialImpact  Why this concept matters in commercial terms at all
//                     — lost revenue, reduced profitability, wasted time,
//                     risk, and so on. This is what turns "this scored
//                     low" into "this is costing the business something
//                     specific."
//   relevantObjectives Which client-stated Business Objectives this
//                     concept actually influences. This does NOT gate
//                     whether a BPI appears in the assessment — tags and
//                     dependencies still decide that. It changes what gets
//                     prioritised and how the report is framed: a BPI tied
//                     to a client's stated objective leads the report,
//                     while one that's still assessed but off-objective
//                     sits further back as supporting context.

function concept({ name, purpose, category, tags, relatedConcepts = [], observation = false }) {
  return { name, purpose, category, tags, relatedConcepts, type: observation ? "observation" : "question" };
}

function guidance({ ifClientSays = [], lookFor = [], warningSigns = [], typicalEvidence = [], commonExcuses = [], bestPractice = "", probingQuestions = [] }) {
  return { ifClientSays, lookFor, warningSigns, typicalEvidence, commonExcuses, bestPractice, probingQuestions };
}

function buildScoring(descriptions) {
  const MATURITY_LABELS = ["Foundation", "Foundation", "Intermediate", "Advanced", "Best Practice", "Industry Leading"];
  return descriptions.map((description, score) => ({ score, maturity: MATURITY_LABELS[score], description }));
}

function buildOpportunity(opportunities) {
  return opportunities.map((o, score) => ({ score, ...o }));
}

function commercialImpact({ categories, narrative }) {
  return { categories, narrative };
}

function knowledgeItem(conceptDef, method, scoringDescriptions, opportunities, guidanceContent, impact, relevantObjectives) {
  return {
    concept: { ...conceptDef, relevantObjectives },
    method,
    scoring: buildScoring(scoringDescriptions),
    opportunity: buildOpportunity(opportunities),
    guidance: guidanceContent,
    commercialImpact: impact
  };
}

export const knowledgeBase = [

  knowledgeItem(
    concept({
      name: "Stock Accuracy", purpose: "Measure how effectively inventory is controlled.",
      category: "Operations and Process", tags: ["Warehouse", "Retail", "Manufacturing", "Distribution", "Inventory", "ISO 9001", "Risk", "Customer Experience"],
      relatedConcepts: ["Warehouse Organisation", "Fleet Utilisation", "Supplier Performance"]
    }),
    {
      question: "How is stock accuracy measured, and what's the current variance between system and physical counts?",
      supportingQuestions: ["Who owns stock accuracy day to day?", "Can you demonstrate the current cycle count process?"],
      followUpQuestions: ["What's caused the last significant stock discrepancy?", "How would you know if accuracy was getting worse?"],
      evidenceRequired: ["Cycle count reports", "WMS reports", "Stock adjustment reports"],
      observationPoints: ["Warehouse layout", "Labelling", "Damaged stock", "Picking process"],
      metrics: ["Inventory accuracy %", "Shrinkage", "Stock variance"],
      frequency: "Quarterly to monthly, depending on stock value and turnover"
    },
    ["No stock control.", "Stock counted occasionally.", "Basic controls in place.", "Regular counting in place.", "Excellent controls.", "Industry leading."],
    [
      { recommendation: "Introduce basic inventory controls.", benefitType: "Cost Saving", estimationGuidance: "Estimate the value of stock currently unaccounted for or written off in the last 12 months as a baseline." },
      { recommendation: "Introduce scheduled cycle counts.", benefitType: "Cost Saving", estimationGuidance: "Compare the cost of running basic cycle counts against the value of adjustments made last quarter." },
      { recommendation: "Implement a warehouse management system.", benefitType: "Efficiency Improvement", estimationGuidance: "Estimate hours currently lost resolving stock discrepancies and value that time at a fully loaded labour rate." },
      { recommendation: "Improve KPI reporting on stock accuracy.", benefitType: "Revenue Opportunity", estimationGuidance: "Estimate revenue at risk from stockouts on the highest selling lines over a typical month." },
      { recommendation: "Benchmark stock accuracy against industry standards.", benefitType: "Efficiency Improvement", estimationGuidance: "Quantify the reduction in write-offs achieved since accuracy improved, as evidence of ongoing value." },
      { recommendation: "Maintain current excellence and share practice across the business.", benefitType: "Growth Opportunity", estimationGuidance: "Use this as a reference standard to justify investment in adjacent automation." }
    ],
    guidance({
      ifClientSays: [
        { says: "We do stock takes every year at year end.", meansCheckFor: "Annual counts only catch problems too late to prevent write-offs — ask what happens to variance in between." },
        { says: "Our team knows the stock, they don't need a system.", meansCheckFor: "This usually means no objective record exists at all — ask what happens when that person is on holiday or leaves." }
      ],
      lookFor: ["A visible, current stock report or count sheet, not last year's", "Whether staff can locate a specific SKU without hesitation", "Damaged or unlabelled stock sitting separately from the main count"],
      warningSigns: ["Different answers from different staff about how counting works", "No one can quote a current variance number", "Stock adjustments only happen after a customer complaint"],
      typicalEvidence: ["A cycle count schedule with actual completion dates, not just planned ones", "A WMS or spreadsheet showing variance trending over time", "Signed-off count sheets, even if paper-based"],
      commonExcuses: [
        { excuse: "We're too busy to count stock properly.", probe: "Ask what a stockout or overstock actually costs them in a typical month — this usually reframes counting as time saved, not time spent." },
        { excuse: "Our system is always accurate.", probe: "Ask when the system was last checked against a physical count — 'always' rarely survives that question." }
      ],
      bestPractice: "Leading operations run rolling cycle counts on their highest value or highest velocity lines weekly, with variance investigated and closed out within days, not left to accumulate until the next full count.",
      probingQuestions: ["When was the last time the system count and the physical count didn't match, and what happened next?", "If I picked a random shelf right now, how confident are you the count would be right?"]
    }),
    commercialImpact({
      categories: ["Cash flow", "Reduced profitability", "Operational efficiency", "Reputation"],
      narrative: "Inaccurate stock ties up cash in the wrong products, causes stockouts that lose sales and damage trust, and produces write-offs that quietly erode margin without ever showing up as a single visible cost."
    }),
    ["Reduce costs", "Improve profitability", "Improve operational efficiency", "Prepare for growth"]
  ),

  knowledgeItem(
    concept({
      name: "Preventative Maintenance", purpose: "Measure whether equipment failure is being prevented rather than reacted to.",
      category: "Operations and Process", tags: ["Manufacturing", "Engineering", "Facilities", "Utilities", "Fleet Management", "ISO 45001"],
      relatedConcepts: ["Fleet Utilisation", "Warehouse Organisation", "Training Effectiveness"]
    }),
    {
      question: "Describe your preventative maintenance programme and how compliance with it is verified.",
      supportingQuestions: ["Who owns the maintenance schedule?", "Can you show me a completed maintenance log from this week?"],
      followUpQuestions: ["What was the last unplanned breakdown, and what caused it?", "How is the schedule adjusted as equipment ages?"],
      evidenceRequired: ["Maintenance schedule", "Completed maintenance logs", "Breakdown history"],
      observationPoints: ["Equipment condition", "Visible maintenance records at point of use"],
      metrics: ["Planned versus reactive maintenance ratio", "Unplanned downtime hours"],
      frequency: "Reviewed monthly against the maintenance schedule"
    },
    ["No maintenance programme.", "Maintenance only happens after breakdown.", "A schedule exists but is inconsistently followed.", "Schedule followed with basic compliance tracking.", "Compliance verified and downtime actively reduced.", "Predictive maintenance informed by real data."],
    [
      { recommendation: "Introduce a basic maintenance schedule for critical equipment.", benefitType: "Risk Reduction", estimationGuidance: "Estimate the cost of the last serious breakdown, including lost production time, as a baseline case for investment." },
      { recommendation: "Move from purely reactive to at least partially scheduled maintenance.", benefitType: "Cost Saving", estimationGuidance: "Compare average reactive repair cost against typical scheduled service cost for the same equipment." },
      { recommendation: "Introduce compliance tracking against the existing schedule.", benefitType: "Risk Reduction", estimationGuidance: "Estimate downtime hours attributable to missed scheduled maintenance over the last quarter." },
      { recommendation: "Use downtime data to prioritise which equipment needs tighter intervals.", benefitType: "Efficiency Improvement", estimationGuidance: "Rank equipment by downtime hours and estimate output recovered by tightening the top offenders' intervals." },
      { recommendation: "Explore condition based or predictive maintenance for highest value assets.", benefitType: "Cost Saving", estimationGuidance: "Estimate the cost difference between calendar-based and condition-based servicing for the highest value asset." },
      { recommendation: "Maintain current practice and document it as a reference standard.", benefitType: "Growth Opportunity", estimationGuidance: "Use documented downtime reduction as evidence when justifying capacity expansion." }
    ],
    guidance({
      ifClientSays: [
        { says: "We fix things when they break.", meansCheckFor: "This is reactive maintenance dressed up as a strategy — ask what a breakdown actually costs them in downtime." },
        { says: "The manufacturer's schedule covers it.", meansCheckFor: "Ask whether that schedule has ever been adjusted for their actual usage or environment — most haven't." }
      ],
      lookFor: ["Maintenance logs with real dates and signatures, not blank templates", "Visible wear or leaks on equipment that should have been caught earlier", "Spare parts inventory that suggests planning versus panic ordering"],
      warningSigns: ["Maintenance records exist but are months out of date", "The same fault recurring on the same machine", "No one can say when a specific piece of equipment was last serviced"],
      typicalEvidence: ["A maintenance calendar cross-referenced against completed job sheets", "Downtime logs showing a declining trend after a specific intervention", "Photos or logs of condition-based checks, not just calendar-based ones"],
      commonExcuses: [
        { excuse: "We don't have time to do maintenance properly, production comes first.", probe: "Ask them to quantify the last unplanned downtime event against the time a scheduled service would have taken." },
        { excuse: "Our equipment is old, breakdowns are just normal.", probe: "Ask whether breakdown frequency has actually been tracked, or if that's an assumption." }
      ],
      bestPractice: "Best in class operations track planned versus reactive maintenance as a ratio and actively work to shift it, rather than accepting a fixed level of breakdown as inevitable.",
      probingQuestions: ["What was the last breakdown that caught you by surprise, and could it have been predicted?", "How would you know if your maintenance schedule was wrong for how this equipment is actually used?"]
    }),
    commercialImpact({
      categories: ["Cash flow", "Operational efficiency", "Risk", "Capacity"],
      narrative: "Reactive maintenance shows up as unplanned downtime, missed delivery dates and emergency repair costs that are almost always higher than a scheduled equivalent — the cost hides in lost capacity as much as repair invoices."
    }),
    ["Reduce costs", "Improve operational efficiency", "Reduce business risk"]
  ),

  knowledgeItem(
    concept({
      name: "Customer Complaints", purpose: "Measure whether customer feedback actually changes how the business operates.",
      category: "Customer Experience", tags: ["Retail", "Hospitality", "Professional Services", "Customer Support", "Call Centre", "ISO 9001"],
      relatedConcepts: ["Guest Experience Recovery", "Leadership Communication", "Training Effectiveness"]
    }),
    {
      question: "What changes have been implemented because of customer complaints during the last 12 months?",
      supportingQuestions: ["Who reviews the complaint log, and how often?", "Can you show me a complaint that led to a real change?"],
      followUpQuestions: ["What's the most common complaint theme right now?", "How would a complaint about a manager get raised safely?"],
      evidenceRequired: ["Complaint log", "Root cause analysis", "Evidence of a resulting change"],
      observationPoints: [],
      metrics: ["Complaint volume trend", "Repeat complaint rate", "Time to resolution"],
      frequency: "Reviewed monthly, trends reviewed quarterly"
    },
    ["Complaints are not recorded.", "Complaints are recorded but rarely reviewed.", "Complaints are reviewed but rarely lead to change.", "Some complaints lead to a documented change.", "Complaints consistently drive tracked improvement.", "Complaint data actively shapes strategy and is shared business wide."],
    [
      { recommendation: "Start recording every complaint in one place, however simple.", benefitType: "Customer Experience Improvement", estimationGuidance: "Estimate the value of customers lost to unresolved dissatisfaction, using average customer lifetime value." },
      { recommendation: "Introduce a regular review of the complaint log, even monthly is a start.", benefitType: "Risk Reduction", estimationGuidance: "Estimate cost exposure from a recurring theme escalating into a formal or public complaint." },
      { recommendation: "Pick one recurring complaint theme and trace it to a specific process change.", benefitType: "Customer Experience Improvement", estimationGuidance: "Estimate retention improvement if the most common complaint theme were resolved." },
      { recommendation: "Track whether a change made in response to a complaint actually reduced its recurrence.", benefitType: "Efficiency Improvement", estimationGuidance: "Estimate staff time currently spent repeatedly handling the same complaint type." },
      { recommendation: "Build complaint themes into regular management reporting.", benefitType: "Customer Experience Improvement", estimationGuidance: "Quantify retention or referral improvement already achieved from acting on complaint themes." },
      { recommendation: "Use complaint trends to inform strategic decisions, not just operational fixes.", benefitType: "Growth Opportunity", estimationGuidance: "Use resolved themes as evidence in growth or investment conversations." }
    ],
    guidance({
      ifClientSays: [
        { says: "We don't get many complaints.", meansCheckFor: "Low recorded volume often means poor capture, not genuine satisfaction — ask how a complaint would actually reach them." },
        { says: "We deal with every complaint personally.", meansCheckFor: "Personal handling without a record means no pattern can ever be seen — ask where that's written down." }
      ],
      lookFor: ["Whether there's one central place complaints are logged, or several disconnected ones", "Staff body language when asked about a specific recent complaint", "Whether a complaint log, if shown, has entries with no resolution recorded"],
      warningSigns: ["Complaints are described anecdotally rather than shown as records", "The same complaint theme keeps coming up but nothing's changed", "No one owns the complaint process specifically"],
      typicalEvidence: ["A dated complaint log with resolution and root cause fields actually filled in", "A specific example of a process change traced back to a complaint", "Trend data showing complaint volume or theme over time"],
      commonExcuses: [
        { excuse: "Most complaints are just people being difficult.", probe: "Ask for a specific recent example and walk through it together — this usually surfaces a real underlying issue." },
        { excuse: "We sort it out on the spot, there's nothing to write down.", probe: "Ask how they'd know if the same issue was happening repeatedly if nothing's recorded." }
      ],
      bestPractice: "Mature organisations treat every complaint as free market research, actively mining themes for systemic fixes rather than just closing individual tickets.",
      probingQuestions: ["What's the last thing you changed specifically because of a complaint?", "If the same complaint came in five times this month, would you know?"]
    }),
    commercialImpact({
      categories: ["Customer retention", "Reputation", "Lost revenue"],
      narrative: "Unresolved or unrecorded complaints don't just lose the customer in front of you — they lose referrals, invite public reviews, and repeat a cost the business could have designed out after the very first occurrence."
    }),
    ["Improve customer retention", "Improve customer experience", "Reduce business risk"]
  ),

  knowledgeItem(
    concept({
      name: "Leadership Communication", purpose: "Measure whether leadership decisions genuinely reach and are understood by the wider team.",
      category: "Leadership and Accountability", tags: ["Leadership", "Culture", "Communication"],
      relatedConcepts: ["Customer Complaints", "Training Effectiveness", "Recruitment"]
    }),
    {
      question: "Describe how leadership decisions get communicated down through the business, using a recent example.",
      supportingQuestions: ["Can you walk me through how the last major decision was communicated?", "Who's responsible for making sure the message actually lands?"],
      followUpQuestions: ["What happens when a decision is misunderstood by the team?", "How do you know staff felt able to ask questions about it?"],
      evidenceRequired: ["Team briefing notes", "Internal communications", "Staff confirmation of understanding"],
      observationPoints: [],
      metrics: ["Staff survey understanding score, where available"],
      frequency: "Reviewed after any significant decision or change"
    },
    ["Decisions are not communicated beyond senior leadership.", "Communication happens but inconsistently and informally.", "A regular communication channel exists but understanding isn't checked.", "Communication is regular and understanding is checked informally.", "Communication is structured and understanding is verified.", "Two way communication is embedded, with feedback shaping future decisions."],
    [
      { recommendation: "Introduce a simple, regular way of sharing decisions with the wider team.", benefitType: "Efficiency Improvement", estimationGuidance: "Estimate hours lost to rework or confusion from decisions not reaching the team in time." },
      { recommendation: "Make the existing communication channel consistent rather than ad hoc.", benefitType: "Efficiency Improvement", estimationGuidance: "Estimate time spent by managers repeating the same information informally to different people." },
      { recommendation: "Start checking, even informally, whether the message actually landed.", benefitType: "Risk Reduction", estimationGuidance: "Estimate the cost of the last mistake caused by a misunderstood instruction." },
      { recommendation: "Formalise a check on understanding after significant communications.", benefitType: "Efficiency Improvement", estimationGuidance: "Track reduction in repeat questions or errors after formal checks are introduced." },
      { recommendation: "Close the loop by inviting and acting on feedback from staff.", benefitType: "Growth Opportunity", estimationGuidance: "Estimate staff turnover cost avoided through improved engagement and clarity." },
      { recommendation: "Maintain the two way channel and use it as a model for other decisions.", benefitType: "Growth Opportunity", estimationGuidance: "Use demonstrated communication maturity as evidence when planning expansion or delegation." }
    ],
    guidance({
      ifClientSays: [
        { says: "Everyone knows what's going on, we're a small team.", meansCheckFor: "Small size doesn't guarantee alignment — ask a frontline person the same question separately if possible." },
        { says: "We have a WhatsApp group for that.", meansCheckFor: "Informal channels often mean inconsistent reach — ask what happens when someone misses a message." }
      ],
      lookFor: ["Whether leadership and frontline staff describe the same decision differently", "Visible communication artefacts — noticeboards, briefing notes, minutes", "Hesitation when asked how a recent change was actually communicated"],
      warningSigns: ["Staff hear about major decisions informally or after the fact", "No consistent channel exists, communication is different every time", "Leadership assumes understanding without ever checking it"],
      typicalEvidence: ["Briefing notes or minutes with a distribution list", "A specific example where feedback from staff changed a decision", "A consistent, named channel used repeatedly, not invented each time"],
      commonExcuses: [{ excuse: "We don't need formal communication, we just talk.", probe: "Ask what happens to someone who's absent, part time, or on a different shift when 'we just talk' happens." }],
      bestPractice: "Strong leadership communication is two way — not just broadcasting decisions but building in a way to check understanding and invite challenge before it's finalised.",
      probingQuestions: ["Can I ask someone on the floor how they heard about the last big decision, separately from you?", "What's an example of a decision that changed because of feedback from below?"]
    }),
    commercialImpact({
      categories: ["Poor productivity", "Risk", "Time"],
      narrative: "When decisions don't reliably reach the people who have to act on them, the cost shows up as rework, inconsistent service, and time managers spend repeating themselves — all avoidable, and all invisible until someone actually measures it."
    }),
    ["Improve staff performance", "Improve operational efficiency", "Prepare for growth"]
  ),

  knowledgeItem(
    concept({
      name: "Website Credibility", purpose: "Measure whether the website builds trust and converts interest into enquiries, as a first impression of the business.",
      category: "Sales and Marketing", tags: ["Sales Team", "Ecommerce", "Visual Presentation", "Professionalism"],
      relatedConcepts: ["Sales Conversion", "Customer Complaints"], observation: true
    }),
    {
      question: "How effectively does the website communicate what this business offers, build trust and convert visitors into enquiries?",
      supportingQuestions: ["Who owns keeping the website updated?", "Can you show me the last time it was reviewed for accuracy?"],
      followUpQuestions: ["What happens when someone finds an error on the site?", "How does the website compare to your closest competitor's?"],
      evidenceRequired: ["Website analytics", "Conversion rate data"],
      observationPoints: ["Professional appearance", "Loading speed", "Mobile responsiveness", "Clarity of offer", "Ease of enquiry or purchase"],
      metrics: ["Conversion rate", "Bounce rate", "Mobile versus desktop performance"],
      frequency: "Reviewed at least annually, or after any redesign"
    },
    ["No functioning website.", "Website exists but is outdated or hard to use.", "Website is usable but doesn't clearly build trust.", "Website is professional with a clear offer.", "Website is professional, fast, and measurably converts visitors.", "Website is best in class and actively tested and improved."],
    [
      { recommendation: "A basic, functioning website should be the first priority.", benefitType: "Revenue Opportunity", estimationGuidance: "Estimate enquiries lost to prospects who couldn't find or trust the business online at all." },
      { recommendation: "Address the most visible usability or currency issues first.", benefitType: "Revenue Opportunity", estimationGuidance: "Estimate the proportion of visitors likely lost at the point the site looks outdated or broken." },
      { recommendation: "Clarify what the business actually offers within the first few seconds of landing.", benefitType: "Revenue Opportunity", estimationGuidance: "Estimate conversion uplift typical for a clearer value proposition, then apply to current visitor volume." },
      { recommendation: "Introduce basic analytics if none exist, to know what's actually happening.", benefitType: "Efficiency Improvement", estimationGuidance: "Frame as a near-zero cost step that unlocks every future estimate on this concept." },
      { recommendation: "Test specific changes against conversion rate rather than assuming what works.", benefitType: "Revenue Opportunity", estimationGuidance: "Estimate additional enquiries per month from even a modest tested conversion rate improvement." },
      { recommendation: "Maintain regular testing and treat the website as a living asset, not a one off project.", benefitType: "Growth Opportunity", estimationGuidance: "Use ongoing conversion gains as justification for further marketing investment." }
    ],
    guidance({
      ifClientSays: [
        { says: "Our website's fine, customers find us okay.", meansCheckFor: "'Fine' is not a measured claim — ask what data supports that, and check the site yourself on a phone before the visit." },
        { says: "We're getting a new website built soon.", meansCheckFor: "Ask how long 'soon' has been true — this is a common way of avoiding the current state." }
      ],
      lookFor: ["How the site performs on mobile specifically, not just desktop", "Whether contact information and opening hours are current", "How many clicks it takes to actually understand what the business offers"],
      warningSigns: ["The site hasn't been updated in a visibly long time", "No analytics or tracking exists at all", "The site loads slowly or breaks on mobile during your own test"],
      typicalEvidence: ["Actual analytics screenshots showing traffic and conversion", "A/B test results or evidence of iteration", "Clear calls to action that were deliberately designed, not accidental"],
      commonExcuses: [
        { excuse: "We don't get much business from the website anyway.", probe: "Ask how they'd actually know that without any analytics in place." },
        { excuse: "Our customers are all repeat business, they don't need the website.", probe: "Ask how a first time customer would find them today if they searched right now." }
      ],
      bestPractice: "The best small business websites are tested from the customer's actual device and journey, not just reviewed by the owner on a desktop they're already familiar with.",
      probingQuestions: ["When did you last look at your own website as if you were a stranger?", "What does someone see in the first five seconds on their phone?"]
    }),
    commercialImpact({
      categories: ["Lost revenue", "Reputation"],
      narrative: "For most prospective customers the website is the business before they've ever spoken to anyone — a weak one quietly loses enquiries that never even register as lost, because the prospect simply goes elsewhere without ever making contact."
    }),
    ["Increase enquiries", "Improve online presence", "Improve conversion"]
  ),

  knowledgeItem(
    concept({
      name: "Cash Flow Forecasting", purpose: "Measure whether the business can see financial trouble coming before it arrives.",
      category: "Finance and Commercial Control", tags: ["Finance", "Commercial Performance", "Risk"],
      relatedConcepts: ["Sales Conversion", "Supplier Performance"]
    }),
    {
      question: "Describe how cash flow is forecast, and how far ahead that forecast typically looks.",
      supportingQuestions: ["Who prepares the forecast, and who reviews it?", "Can you show me last month's forecast against what actually happened?"],
      followUpQuestions: ["What would trigger you to revise the forecast mid month?", "How far out could you confidently predict a cash shortfall?"],
      evidenceRequired: ["Cash flow forecast document", "Forecast versus actual comparison"],
      observationPoints: [],
      metrics: ["Forecast accuracy over time", "Forecast horizon in weeks or months"],
      frequency: "Updated at least monthly"
    },
    ["No forecasting takes place.", "Forecasting happens informally and irregularly.", "A basic forecast exists but is rarely updated.", "A regularly updated forecast exists with a short horizon.", "A reliable forecast exists and is checked against actuals.", "Forecasting is accurate, forward looking, and drives commercial decisions."],
    [
      { recommendation: "Start with a simple weekly or monthly cash position forecast.", benefitType: "Risk Reduction", estimationGuidance: "Estimate the cost of the last cash surprise, including any emergency funding or missed discount." },
      { recommendation: "Make forecasting a regular habit rather than an occasional exercise.", benefitType: "Risk Reduction", estimationGuidance: "Estimate interest or fees avoided by spotting a shortfall further in advance." },
      { recommendation: "Extend the forecast horizon and update it on a fixed schedule.", benefitType: "Growth Opportunity", estimationGuidance: "Frame as the minimum visibility needed to safely commit to growth investment." },
      { recommendation: "Begin comparing forecast against actual to build accuracy over time.", benefitType: "Risk Reduction", estimationGuidance: "Track the narrowing gap between forecast and actual as a direct risk reduction measure." },
      { recommendation: "Use forecast accuracy to build confidence in longer term decisions.", benefitType: "Growth Opportunity", estimationGuidance: "Use forecast reliability as evidence when seeking finance or investment." },
      { recommendation: "Maintain the discipline and use it to inform strategic, not just operational, decisions.", benefitType: "Growth Opportunity", estimationGuidance: "Use as a selling point in any future funding, acquisition or sale conversation." }
    ],
    guidance({
      ifClientSays: [
        { says: "I know the numbers, they're in my head.", meansCheckFor: "This is a single point of failure — ask what happens if that person is unavailable for a month." },
        { says: "Our accountant handles all that.", meansCheckFor: "Ask how often the business actually sees or discusses the forecast, versus it existing somewhere unseen." }
      ],
      lookFor: ["Whether a forecast document actually exists and is recent", "How confidently financial questions are answered versus estimated", "Whether cash position is discussed as a routine agenda item anywhere"],
      warningSigns: ["Forecasting is described as intuition rather than a process", "No one can say the current cash runway with any confidence", "Financial surprises are described as recurring, not rare"],
      typicalEvidence: ["A rolling forecast document updated on a visible cadence", "A forecast versus actual comparison from a recent month", "Evidence the forecast has actually changed a decision, like delaying a purchase"],
      commonExcuses: [{ excuse: "Cash flow is unpredictable in our business, forecasting doesn't help.", probe: "Ask for a specific recent surprise and whether any leading indicator existed beforehand." }],
      bestPractice: "Businesses with strong cash discipline forecast on a rolling basis, comparing against actuals regularly enough that surprises become rare rather than routine.",
      probingQuestions: ["What's your cash position going to look like in eight weeks, and how confident are you in that number?", "What was the last cash surprise, and could it have been seen coming?"]
    }),
    commercialImpact({
      categories: ["Cash flow", "Risk", "Business growth"],
      narrative: "Without visibility of cash position weeks ahead, decisions get made reactively under pressure — expensive short term borrowing, missed early payment discounts, or growth opportunities turned down simply because the runway wasn't visible in time to say yes."
    }),
    ["Improve profitability", "Reduce business risk", "Prepare for growth", "Sell the business"]
  ),

  knowledgeItem(
    concept({
      name: "Supplier Performance", purpose: "Measure whether supplier reliability is actively managed rather than simply tolerated.",
      category: "Finance and Commercial Control", tags: ["Procurement", "Manufacturing", "Logistics", "Distribution", "ISO 9001"],
      relatedConcepts: ["Stock Accuracy", "Cash Flow Forecasting", "Preventative Maintenance"]
    }),
    {
      question: "How is supplier reliability measured and what happens when a supplier underperforms?",
      supportingQuestions: ["Who owns the supplier relationship day to day?", "Can you show me a recent supplier scorecard or review?"],
      followUpQuestions: ["What happened the last time a key supplier let you down?", "How would a new supplier be assessed before onboarding?"],
      evidenceRequired: ["Supplier scorecards", "Delivery performance data", "Escalation records"],
      observationPoints: [],
      metrics: ["On time in full delivery rate", "Defect or return rate by supplier"],
      frequency: "Reviewed quarterly for key suppliers"
    },
    ["Supplier performance is not tracked.", "Problems are noticed but not formally recorded.", "Basic tracking exists for the most critical suppliers only.", "Performance is tracked and reviewed for most suppliers.", "Performance data drives supplier reviews and decisions.", "Supplier relationships are actively developed based on shared performance data."],
    [
      { recommendation: "Start tracking on time and in full delivery for your highest impact suppliers.", benefitType: "Cost Saving", estimationGuidance: "Estimate cost of the last supplier failure, including any rush freight, downtime or lost sale." },
      { recommendation: "Record supplier issues formally, even in a simple shared document.", benefitType: "Risk Reduction", estimationGuidance: "Estimate exposure if the same issue recurred with no record to challenge the supplier." },
      { recommendation: "Extend basic tracking beyond just the most critical suppliers.", benefitType: "Cost Saving", estimationGuidance: "Estimate the value of leverage gained in the next contract renewal with performance data in hand." },
      { recommendation: "Use tracked data in a regular supplier review conversation.", benefitType: "Cost Saving", estimationGuidance: "Estimate savings from renegotiating terms with an underperforming supplier using their own data." },
      { recommendation: "Let performance data directly inform which suppliers get more or less business.", benefitType: "Efficiency Improvement", estimationGuidance: "Estimate efficiency gained from consolidating spend toward better performing suppliers." },
      { recommendation: "Share performance data with suppliers to drive joint improvement.", benefitType: "Growth Opportunity", estimationGuidance: "Use a strong supplier relationship as a basis for preferential terms during growth." }
    ],
    guidance({
      ifClientSays: [
        { says: "Our suppliers are all reliable, we've used them for years.", meansCheckFor: "Tenure isn't performance — ask for a specific recent example of a supplier letting them down." },
        { says: "We'd know if a supplier was underperforming.", meansCheckFor: "Ask what data that judgement is actually based on." }
      ],
      lookFor: ["Whether any supplier data exists beyond memory or anecdote", "How escalation with a supplier actually happens in practice", "Whether alternative suppliers have ever genuinely been evaluated"],
      warningSigns: ["Supplier issues are described as one-offs even when they recur", "No one owns the supplier relationship formally", "Switching supplier is treated as unthinkable rather than a live option"],
      typicalEvidence: ["A scorecard or simple tracking sheet with real dates and figures", "A specific example of a supplier being challenged or replaced based on data", "Delivery performance figures, even informally tracked"],
      commonExcuses: [{ excuse: "Switching suppliers is too risky, we'll stick with what we know.", probe: "Ask what the actual cost of the last supplier failure was, and compare it to the perceived risk of switching." }],
      bestPractice: "Strong procurement functions treat supplier relationships as actively managed and data driven, not simply as long standing arrangements that are rarely questioned.",
      probingQuestions: ["What's the worst thing a supplier has done to you in the last year, and what changed afterwards?", "How would a new supplier actually get a fair chance to prove themselves?"]
    }),
    commercialImpact({
      categories: ["Reduced profitability", "Risk", "Capacity"],
      narrative: "An unmanaged supplier relationship means the business absorbs someone else's failures — late deliveries, quality issues and price increases pass straight through to cost, capacity and customer promises with no leverage to push back."
    }),
    ["Reduce costs", "Reduce business risk", "Improve operational efficiency"]
  ),

  knowledgeItem(
    concept({
      name: "Recruitment", purpose: "Measure whether recruitment brings in people who succeed in the role, not just people who were available.",
      category: "People and Capability", tags: ["People", "Culture", "Remote Workforce"],
      relatedConcepts: ["Training Effectiveness", "Leadership Communication"]
    }),
    {
      question: "What evidence exists that recruitment brings in the right people rather than just available people?",
      supportingQuestions: ["Who's involved in a hiring decision, beyond the hiring manager?", "Can you show me the process from application to offer?"],
      followUpQuestions: ["What's the most common reason a new starter doesn't work out?", "How is a hiring mistake identified and corrected quickly?"],
      evidenceRequired: ["Recruitment process documentation", "New starter retention data", "Probation pass rate"],
      observationPoints: [],
      metrics: ["Probation pass rate", "12 month retention rate", "Time to hire"],
      frequency: "Reviewed after each hiring round, trends reviewed annually"
    },
    ["No defined recruitment process.", "Recruitment is informal and inconsistent.", "A basic process exists but outcomes aren't tracked.", "A consistent process exists and probation outcomes are tracked.", "Recruitment outcomes are tracked and used to refine the process.", "Recruitment is data led and consistently brings in strong long term hires."],
    [
      { recommendation: "Write down even a basic, repeatable recruitment process.", benefitType: "Cost Saving", estimationGuidance: "Estimate the cost of the last bad hire, including recruitment fees, lost productivity and rehiring." },
      { recommendation: "Make the existing process consistent across every hire.", benefitType: "Risk Reduction", estimationGuidance: "Estimate exposure from inconsistent hiring criteria across different managers." },
      { recommendation: "Start tracking probation pass rate as a simple success signal.", benefitType: "Cost Saving", estimationGuidance: "Estimate savings if probation failure rate were reduced by even a small margin." },
      { recommendation: "Review retention data regularly and feed it back into how you recruit.", benefitType: "Efficiency Improvement", estimationGuidance: "Estimate management time freed up from reduced early-stage turnover." },
      { recommendation: "Use hiring outcome data to refine what you screen for.", benefitType: "Growth Opportunity", estimationGuidance: "Frame improved hire quality as a direct enabler of planned headcount growth." },
      { recommendation: "Maintain the discipline and treat recruitment as a measurable, improvable process.", benefitType: "Growth Opportunity", estimationGuidance: "Use recruitment reliability as a risk mitigant when planning expansion." }
    ],
    guidance({
      ifClientSays: [
        { says: "We just know the right person when we see them.", meansCheckFor: "This usually means no consistent process exists, and outcomes will vary heavily by who's hiring." },
        { says: "We've never really had a bad hire.", meansCheckFor: "Ask about turnover and probation pass rate specifically — memory is unreliable here." }
      ],
      lookFor: ["Whether the recruitment process differs depending on who's doing the hiring", "Any documentation of the actual process, from job description to offer", "Evidence of probation outcomes being tracked at all"],
      warningSigns: ["High turnover explained away as 'the industry is like that'", "No consistent interview structure or criteria", "Hiring decisions made very quickly with no second opinion"],
      typicalEvidence: ["Retention data at 3, 6 and 12 months", "A consistent interview structure used across multiple hires", "A specific example of a hiring process being changed after a bad outcome"],
      commonExcuses: [{ excuse: "Good people are hard to find, we take what we can get.", probe: "Ask what's actually been tried beyond the usual channels, and whether the process itself might be filtering out good candidates." }],
      bestPractice: "Strong recruitment tracks probation and early retention as a feedback loop into the hiring process itself, rather than treating each hire as an isolated event.",
      probingQuestions: ["What's your actual 12 month retention rate for new hires, and is that good or bad compared to last year?", "What's the last thing you changed about how you hire, based on how a previous hire worked out?"]
    }),
    commercialImpact({
      categories: ["Poor productivity", "Reduced profitability", "Time"],
      narrative: "A bad hire costs far more than the recruitment fee — lost productivity, management time, disruption to the team, and the cost of doing it all again, often for the same role within a year."
    }),
    ["Improve staff performance", "Prepare for growth", "Save time"]
  ),

  knowledgeItem(
    concept({
      name: "Training Effectiveness", purpose: "Measure whether training actually changes performance, rather than just being delivered.",
      category: "People and Capability", tags: ["People", "Training", "Culture"],
      relatedConcepts: ["Recruitment", "Leadership Communication", "Customer Complaints"]
    }),
    {
      question: "What evidence shows that training actually improves performance rather than simply being delivered?",
      supportingQuestions: ["Who decides what training is delivered and when?", "Can you show me training records for the last quarter?"],
      followUpQuestions: ["What's an example of training that clearly didn't work?", "How would you know if someone needed retraining before it became a problem?"],
      evidenceRequired: ["Training records", "Before and after performance data", "Manager feedback"],
      observationPoints: [],
      metrics: ["Performance change following training", "Training completion rate"],
      frequency: "Reviewed after major training investment, otherwise annually"
    },
    ["No training takes place.", "Training happens but attendance isn't tracked.", "Attendance is tracked but impact is not.", "Impact is checked informally through manager feedback.", "Impact is measured against a specific performance metric.", "Training investment is prioritised based on proven performance return."],
    [
      { recommendation: "Start with basic training on the highest priority skill gap.", benefitType: "Efficiency Improvement", estimationGuidance: "Estimate current cost of the specific error or delay the skill gap is causing." },
      { recommendation: "Track who has actually attended training, not just what's been offered.", benefitType: "Risk Reduction", estimationGuidance: "Estimate exposure from untracked competency, particularly for safety-critical tasks." },
      { recommendation: "Pick one recent training and check whether performance actually changed.", benefitType: "Cost Saving", estimationGuidance: "Compare training spend against any measurable change in output or error rate." },
      { recommendation: "Ask managers directly whether they've seen a change in performance.", benefitType: "Efficiency Improvement", estimationGuidance: "Estimate time saved if a specific recurring error were eliminated by better training." },
      { recommendation: "Define a metric before training begins so impact can be measured afterwards.", benefitType: "Customer Experience Improvement", estimationGuidance: "Link training impact directly to a customer facing metric where possible, such as complaint rate." },
      { recommendation: "Use measured impact to decide where future training investment goes.", benefitType: "Growth Opportunity", estimationGuidance: "Use demonstrated training ROI to justify a larger capability investment ahead of growth." }
    ],
    guidance({
      ifClientSays: [
        { says: "We do plenty of training.", meansCheckFor: "Volume isn't effectiveness — ask for one example where training clearly changed a performance metric." },
        { says: "Staff seemed to enjoy the training.", meansCheckFor: "Enjoyment is not the same as impact — ask what changed afterwards, not how it felt." }
      ],
      lookFor: ["Whether training records exist beyond attendance sheets", "Any before-and-after comparison for a specific training investment", "Whether managers can describe a specific behaviour change post-training"],
      warningSigns: ["Training is treated as a compliance tick box", "No link is drawn between training spend and business outcomes", "The same skills gaps persist despite repeated training"],
      typicalEvidence: ["A specific metric that moved after a training intervention", "Manager feedback captured systematically, not anecdotally", "A training plan that's clearly targeted at an identified gap, not generic"],
      commonExcuses: [{ excuse: "Training is just a cost of doing business, we don't measure it.", probe: "Ask what it would take to know whether the last training spend was worth it." }],
      bestPractice: "Effective training programmes define what success looks like before training happens, so impact can actually be measured afterwards rather than assumed.",
      probingQuestions: ["What specifically changed in performance after your last significant training investment?", "How would you know if training wasn't working?"]
    }),
    commercialImpact({
      categories: ["Poor productivity", "Customer retention", "Reduced profitability"],
      narrative: "Untargeted or unmeasured training is a cost with no visible return — the same skill gaps persist, the same errors recur, and the business can't tell whether its people investment is actually working or just being repeated on faith."
    }),
    ["Improve staff performance", "Improve customer experience", "Reduce costs"]
  ),

  knowledgeItem(
    concept({
      name: "Sales Conversion", purpose: "Measure whether the sales pipeline reflects sales reality rather than aspiration.",
      category: "Sales and Marketing", tags: ["Sales Team", "Ecommerce", "Commercial Performance", "Data"],
      relatedConcepts: ["Website Credibility", "Cash Flow Forecasting"]
    }),
    {
      question: "How is the sales pipeline tracked, and how confident are you in the numbers in it right now?",
      supportingQuestions: ["Who's accountable for pipeline accuracy?", "Can you show me the pipeline as it stands right now?"],
      followUpQuestions: ["What's the most common reason a deal is lost at the final stage?", "How quickly would a sudden drop in conversion be noticed?"],
      evidenceRequired: ["CRM or pipeline data", "Conversion rate by stage"],
      observationPoints: [],
      metrics: ["Conversion rate by stage", "Pipeline accuracy versus closed outcome"],
      frequency: "Reviewed weekly for active pipeline, monthly for conversion trends"
    },
    ["No pipeline is tracked.", "A pipeline exists but is rarely updated.", "The pipeline is updated but contains stale entries.", "The pipeline is actively maintained and broadly accurate.", "Conversion rate by stage is tracked and used to coach the team.", "Pipeline data reliably predicts revenue and shapes resourcing decisions."],
    [
      { recommendation: "Start recording every active opportunity in one place.", benefitType: "Revenue Opportunity", estimationGuidance: "Estimate enquiries currently going untracked and therefore likely to be forgotten or lost." },
      { recommendation: "Build a habit of updating the pipeline on a fixed schedule.", benefitType: "Revenue Opportunity", estimationGuidance: "Estimate value of opportunities that have stalled simply from lack of follow up." },
      { recommendation: "Remove stale or dead opportunities so the numbers reflect reality.", benefitType: "Efficiency Improvement", estimationGuidance: "Estimate time saved by sales staff no longer chasing dead leads mixed into live ones." },
      { recommendation: "Start tracking conversion rate at each stage, not just overall.", benefitType: "Revenue Opportunity", estimationGuidance: "Identify the weakest conversion stage and estimate revenue recovered by improving it by a small margin." },
      { recommendation: "Use stage conversion data in coaching conversations with the sales team.", benefitType: "Revenue Opportunity", estimationGuidance: "Estimate revenue impact of bringing underperforming team members closer to the best performer's conversion rate." },
      { recommendation: "Use pipeline reliability to inform hiring, targets and resourcing decisions.", benefitType: "Growth Opportunity", estimationGuidance: "Use reliable forecasting as the basis for a confident sales hiring or expansion decision." }
    ],
    guidance({
      ifClientSays: [
        { says: "Our pipeline's pretty healthy.", meansCheckFor: "Ask to see it live — a pipeline that looks healthy on the surface often has stale entries inflating it." },
        { says: "We close most of what we go for.", meansCheckFor: "Ask for an actual conversion rate number, not an impression." }
      ],
      lookFor: ["Entries in the pipeline with no recent activity or updates", "Whether conversion rate is discussed by stage or only as one overall number", "How confidently the sales figures are quoted versus estimated"],
      warningSigns: ["Pipeline value is much higher than what historically converts", "No one can explain why a specific deal was lost", "Forecasting is based on hope rather than stage-based probability"],
      typicalEvidence: ["A CRM or tracking sheet with genuinely current entries", "Conversion rate broken down by stage, not just overall", "A specific example of a process change following a lost deal review"],
      commonExcuses: [{ excuse: "Sales is unpredictable, you can't really forecast it.", probe: "Ask how far off recent forecasts have actually been, and whether that gap is closing or staying constant." }],
      bestPractice: "Disciplined sales functions review stage-by-stage conversion regularly and treat pipeline hygiene as a standing habit, not an occasional clean-up.",
      probingQuestions: ["When did you last remove a dead opportunity from the pipeline?", "What's your actual conversion rate from qualified lead to close, and how has it changed?"]
    }),
    commercialImpact({
      categories: ["Lost revenue", "Business growth"],
      narrative: "A pipeline that doesn't reflect reality means forecasts are guesses, resourcing decisions are made on faith, and real revenue quietly leaks away through stalled opportunities nobody's actively chasing."
    }),
    ["Increase revenue", "Improve conversion", "Increase enquiries"]
  ),

  knowledgeItem(
    concept({
      name: "Environmental Sustainability", purpose: "Measure whether environmental impact is actively managed rather than assumed to be someone else's concern.",
      category: "Risk Compliance and Resilience", tags: ["ISO 14001", "Environmental Compliance", "Manufacturing", "Logistics"],
      relatedConcepts: ["Supplier Performance", "Warehouse Organisation"]
    }),
    {
      question: "How are environmental objectives set, tracked and reviewed across the business?",
      supportingQuestions: ["Who owns environmental performance in the business?", "Can you show me current tracked data against your policy?"],
      followUpQuestions: ["What would happen if a target was clearly being missed?", "How do customers or clients ever ask about this?"],
      evidenceRequired: ["Environmental policy", "Objective tracking data", "Waste or emissions records"],
      observationPoints: [],
      metrics: ["Waste volume trend", "Energy or emissions trend against a baseline"],
      frequency: "Reviewed annually, tracked continuously where possible"
    },
    ["No environmental policy or tracking.", "A policy exists but nothing is tracked against it.", "Basic waste or usage data is tracked informally.", "At least one measurable objective is tracked and reviewed.", "Multiple objectives are tracked and reviewed against a clear baseline.", "Environmental performance is actively improved and reported externally."],
    [
      { recommendation: "Start with a simple written policy stating current intentions.", benefitType: "Risk Reduction", estimationGuidance: "Frame as removing a growing barrier to contracts that now require a stated policy at minimum." },
      { recommendation: "Begin tracking at least one basic measure, such as waste volume.", benefitType: "Cost Saving", estimationGuidance: "Estimate current waste disposal cost and the saving available from even modest reduction." },
      { recommendation: "Set one specific, measurable target against current tracked data.", benefitType: "Cost Saving", estimationGuidance: "Estimate cost saving associated with hitting the chosen target over 12 months." },
      { recommendation: "Review progress against that target on a fixed schedule.", benefitType: "Risk Reduction", estimationGuidance: "Estimate contract value at risk if a customer's own sustainability requirements aren't met." },
      { recommendation: "Extend tracking to a second measure and set a clear baseline.", benefitType: "Growth Opportunity", estimationGuidance: "Frame as strengthening tender responses for customers who score suppliers on sustainability." },
      { recommendation: "Consider external reporting or certification to validate ongoing performance.", benefitType: "Growth Opportunity", estimationGuidance: "Estimate new business made accessible by a recognised certification." }
    ],
    guidance({
      ifClientSays: [
        { says: "We recycle, that's about it, we're a small business.", meansCheckFor: "Ask what's actually measured, since 'we recycle' is usually unquantified." },
        { says: "Sustainability isn't really relevant to us.", meansCheckFor: "Ask about waste, energy, and transport specifically — most businesses have more exposure than they assume." }
      ],
      lookFor: ["Any tracked data at all, even informal", "Visible waste handling practices during a walkthrough", "Whether a policy exists but is clearly never referenced"],
      warningSigns: ["A policy exists purely because a customer or contract required it", "No one can quote a single tracked figure", "Environmental questions are met with a shrug rather than a number"],
      typicalEvidence: ["A specific tracked measure with a baseline and trend", "A target that's actually being reviewed, not just stated once", "Evidence of a supplier or process change made for environmental reasons"],
      commonExcuses: [{ excuse: "We're too small for this to matter.", probe: "Ask whether any customers or contracts have started asking about it — this is increasingly common even for small suppliers." }],
      bestPractice: "Even small businesses benefit from tracking one or two simple measures consistently, since untracked good intentions rarely translate into demonstrable progress.",
      probingQuestions: ["What's the one environmental measure you could start tracking tomorrow with no extra cost?", "Has a customer or contract ever asked about your environmental practices?"]
    }),
    commercialImpact({
      categories: ["Risk", "Reputation", "Business growth"],
      narrative: "Increasingly, environmental performance is a condition of winning and keeping contracts, not just a compliance nicety — the risk isn't a fine, it's being quietly excluded from tenders that now score suppliers on this before price is even discussed."
    }),
    ["Reduce business risk", "Improve online presence", "Prepare for growth"]
  ),

  knowledgeItem(
    concept({
      name: "Fleet Utilisation", purpose: "Measure whether vehicle assets are actively managed for efficiency rather than simply used until they fail.",
      category: "Operations and Process", tags: ["Fleet Management", "Logistics", "Transport Planning"],
      relatedConcepts: ["Preventative Maintenance", "Stock Accuracy"]
    }),
    {
      question: "How is vehicle utilisation and downtime tracked across the fleet?",
      supportingQuestions: ["Who reviews fleet data, and how often?", "Can you show me this month's utilisation figures?"],
      followUpQuestions: ["What's driving the most downtime right now?", "How would a persistently underused vehicle be identified?"],
      evidenceRequired: ["Vehicle tracking data", "Utilisation reports", "Maintenance downtime records"],
      observationPoints: ["Vehicle presentation and condition"],
      metrics: ["Utilisation rate", "Downtime hours per vehicle", "Cost per mile or per job"],
      frequency: "Reviewed monthly"
    },
    ["No tracking of vehicle usage or downtime.", "Downtime is noticed but not formally recorded.", "Basic tracking exists for some vehicles.", "Utilisation is tracked consistently across the fleet.", "Utilisation data drives maintenance and replacement decisions.", "Fleet performance is benchmarked and actively optimised."],
    [
      { recommendation: "Start recording downtime for your highest use vehicles.", benefitType: "Cost Saving", estimationGuidance: "Estimate revenue or capacity lost during the last significant vehicle downtime event." },
      { recommendation: "Record every incident of downtime, even informally, across the fleet.", benefitType: "Cost Saving", estimationGuidance: "Estimate total downtime hours across the fleet in the last quarter, valued at typical job revenue." },
      { recommendation: "Extend tracking to cover the whole fleet consistently.", benefitType: "Efficiency Improvement", estimationGuidance: "Identify the least utilised vehicle and estimate the cost of continuing to run it underused." },
      { recommendation: "Review utilisation data monthly as a standing habit.", benefitType: "Efficiency Improvement", estimationGuidance: "Estimate cost saved by right-sizing the fleet based on actual utilisation data." },
      { recommendation: "Use utilisation trends to inform maintenance scheduling and replacement timing.", benefitType: "Cost Saving", estimationGuidance: "Compare replacement cost against ongoing maintenance cost for the highest downtime vehicle." },
      { recommendation: "Benchmark utilisation against industry norms to find further efficiency.", benefitType: "Growth Opportunity", estimationGuidance: "Use above-benchmark utilisation as capacity available to take on more work without new capital spend." }
    ],
    guidance({
      ifClientSays: [
        { says: "Our drivers know their routes, it all runs fine.", meansCheckFor: "Ask for actual utilisation or downtime figures — 'it runs fine' is rarely backed by data." },
        { says: "We replace vehicles on a fixed cycle regardless.", meansCheckFor: "Ask whether that cycle is based on actual usage data or just convention." }
      ],
      lookFor: ["Vehicle condition and presentation during a walkthrough", "Whether downtime is described as rare or simply not tracked", "Any tracking device or system in use, even basic"],
      warningSigns: ["No one can quote current utilisation or downtime figures", "Vehicle issues are described as surprises rather than anticipated", "Replacement decisions are made reactively after a breakdown"],
      typicalEvidence: ["Utilisation reports with actual figures, not estimates", "A maintenance-linked downtime log", "A specific example of a replacement decision based on data"],
      commonExcuses: [{ excuse: "Tracking systems are expensive and we're not that big.", probe: "Ask what a single serious breakdown or missed delivery actually costs, compared to a basic tracking solution." }],
      bestPractice: "Fleet operators with strong utilisation discipline track downtime by vehicle and use that data to inform both maintenance timing and replacement decisions.",
      probingQuestions: ["What's your fleet's average utilisation rate right now, and how do you know?", "When did a vehicle last let you down unexpectedly, and was there a warning sign beforehand?"]
    }),
    commercialImpact({
      categories: ["Reduced profitability", "Capacity", "Cash flow"],
      narrative: "An underutilised or unpredictable fleet ties up capital in vehicles that aren't earning, while unplanned downtime directly removes capacity exactly when it's needed most."
    }),
    ["Reduce costs", "Improve operational efficiency", "Reduce business risk"]
  ),

  knowledgeItem(
    concept({
      name: "Warehouse Organisation", purpose: "Measure whether warehouse layout supports efficient, safe operation rather than historical accident.",
      category: "Operations and Process", tags: ["Warehouse", "Logistics", "Distribution", "Manufacturing"],
      relatedConcepts: ["Stock Accuracy", "Preventative Maintenance", "Environmental Sustainability"], observation: true
    }),
    {
      question: "How is warehouse layout reviewed for efficiency rather than left as it's always been?",
      supportingQuestions: ["Who last reviewed the warehouse layout, and when?", "Can you walk me through the pick path for your top selling line?"],
      followUpQuestions: ["What's the biggest source of wasted time in the current layout?", "How would a change in product mix affect this layout?"],
      evidenceRequired: [],
      observationPoints: ["Warehouse organisation", "Labelling", "Storage", "Pick path efficiency", "Housekeeping and safety"],
      metrics: ["Average pick time", "Travel distance for top moving lines"],
      frequency: "Reviewed annually or after significant volume change"
    },
    ["Layout is disorganised with no clear logic.", "Layout has some logic but is inconsistently followed.", "Layout is functional but has never been reviewed for efficiency.", "Layout has been reviewed at least once against actual pick patterns.", "Layout is optimised for current top moving lines.", "Layout is continuously reviewed and adjusted as demand changes."],
    [
      { recommendation: "Address the most obvious organisation and safety issues first.", benefitType: "Risk Reduction", estimationGuidance: "Estimate cost exposure from a safety incident linked directly to warehouse disorganisation." },
      { recommendation: "Apply the existing logic consistently across the whole warehouse.", benefitType: "Efficiency Improvement", estimationGuidance: "Estimate time lost per shift to inconsistent storage logic across pickers." },
      { recommendation: "Walk the pick path for your top five moving lines and note friction points.", benefitType: "Efficiency Improvement", estimationGuidance: "Estimate labour cost of current pick time against a realistic improved target." },
      { recommendation: "Reorganise based on that walk through, prioritising the biggest win first.", benefitType: "Efficiency Improvement", estimationGuidance: "Estimate labour hours saved per week from the single biggest layout friction point." },
      { recommendation: "Review layout each time volume or product mix changes materially.", benefitType: "Capacity", estimationGuidance: "Frame as protecting throughput capacity as volume grows, without added headcount." },
      { recommendation: "Treat layout as a continuously improving system, not a fixed decision.", benefitType: "Growth Opportunity", estimationGuidance: "Use proven layout efficiency as spare capacity available to absorb growth without new space." }
    ],
    guidance({
      ifClientSays: [
        { says: "We've always laid it out this way, it works.", meansCheckFor: "'Always' is a red flag for never having been reviewed — ask when it was last changed and why." },
        { says: "Our pickers know where everything is.", meansCheckFor: "This is a single point of failure — ask what happens with a new or temporary picker." }
      ],
      lookFor: ["Physical evidence during a walkthrough: labelling, aisle clarity, obstruction", "Whether high-velocity items are stored efficiently or randomly", "Signs of recent reorganisation versus long-term stagnation"],
      warningSigns: ["Layout hasn't changed despite a change in product mix or volume", "Staff describe workarounds rather than a designed process", "Housekeeping issues visible on a casual walkthrough"],
      typicalEvidence: ["Pick time data before and after a layout change", "A specific example of a reorganisation driven by data, not instinct", "A clear, followed logic to where products are stored"],
      commonExcuses: [{ excuse: "We don't have time to reorganise, we're too busy operating.", probe: "Ask how much time is currently lost to inefficient picking, even roughly, to reframe reorganisation as time saved." }],
      bestPractice: "Well run warehouses treat layout as something to be reviewed periodically against actual pick data, not a one-time decision left untouched for years.",
      probingQuestions: ["When was the layout last changed, and what prompted it?", "If I asked a picker to fetch your top five selling items right now, how long would that take?"]
    }),
    commercialImpact({
      categories: ["Poor productivity", "Capacity", "Risk"],
      narrative: "A layout that's never been tested against real pick data quietly costs labour hours every single shift, and often masks a growing safety exposure that only surfaces once something actually goes wrong."
    }),
    ["Improve operational efficiency", "Reduce costs", "Prepare for growth"]
  ),

  knowledgeItem(
    concept({
      name: "Food Safety Practice", purpose: "Measure whether food safety standards hold up during live service, not just at inspection.",
      category: "Risk Compliance and Resilience", tags: ["Hospitality", "Food Hygiene", "Kitchen Operations"],
      relatedConcepts: ["Training Effectiveness", "Guest Experience Recovery"]
    }),
    {
      question: "What evidence shows food safety standards are followed consistently during service, not just at inspection?",
      supportingQuestions: ["Who's responsible for food safety compliance day to day?", "Can you show me today's temperature log?"],
      followUpQuestions: ["What's the last near miss or issue identified during service?", "How would a lapse be caught before it reached a customer?"],
      evidenceRequired: ["Temperature logs", "Cleaning schedules", "Staff training records"],
      observationPoints: ["Kitchen cleanliness and organisation during live service"],
      metrics: ["Temperature log completion rate", "Internal audit score"],
      frequency: "Checked daily, formally reviewed monthly"
    },
    ["No food safety records kept.", "Records exist but are inconsistently completed.", "Records are mostly complete but rarely reviewed.", "Records are complete and reviewed regularly.", "Records are complete, reviewed, and used to correct issues quickly.", "Food safety practice is proactively audited and consistently exemplary."],
    [
      { recommendation: "Start with basic, consistent temperature logging.", benefitType: "Risk Reduction", estimationGuidance: "Frame in terms of the reputational and legal cost of a single reportable food safety incident." },
      { recommendation: "Make log completion a checked daily habit, not an occasional one.", benefitType: "Risk Reduction", estimationGuidance: "Estimate insurance or compliance exposure reduced by consistent, complete records." },
      { recommendation: "Introduce a regular review of completed logs, even weekly.", benefitType: "Risk Reduction", estimationGuidance: "Frame as catching a developing issue before it becomes a reportable incident." },
      { recommendation: "Act visibly and quickly whenever a review identifies an issue.", benefitType: "Customer Experience Improvement", estimationGuidance: "Estimate reputational cost avoided by resolving an issue before a customer ever experiences it." },
      { recommendation: "Use trends in the data to prevent issues before they occur.", benefitType: "Risk Reduction", estimationGuidance: "Estimate the value of insurance premium or audit outcome improvement from a strong track record." },
      { recommendation: "Maintain the standard and use it as the benchmark for other sites if multi site.", benefitType: "Growth Opportunity", estimationGuidance: "Use as a proof point when opening or franchising further sites." }
    ],
    guidance({
      ifClientSays: [
        { says: "We've never had an issue.", meansCheckFor: "Absence of a known issue isn't the same as good practice — ask to see today's actual records, not a description." },
        { says: "Everyone knows the rules here.", meansCheckFor: "Ask how that's verified, not just assumed — knowledge and consistent practice are different things." }
      ],
      lookFor: ["Whether today's log is actually complete, not yesterday's or last week's", "Kitchen organisation and cleanliness during live service specifically", "Staff confidence when asked to explain a specific procedure"],
      warningSigns: ["Logs exist but have visible gaps", "Records are completed in a batch after the fact rather than in real time", "Staff give inconsistent answers about the same procedure"],
      typicalEvidence: ["A complete, real-time temperature log with no gaps", "A specific example of an issue being caught and corrected before it reached a customer", "Consistent staff answers when asked separately about the same procedure"],
      commonExcuses: [{ excuse: "We're too busy during service to fill things in properly.", probe: "Ask what happens instead — batch-filling logs afterwards defeats their purpose and is worth surfacing directly." }],
      bestPractice: "Strong food safety practice shows up as real-time, consistently completed records and staff who can explain procedures confidently and consistently, not just compliant paperwork.",
      probingQuestions: ["Can I see this morning's temperature log right now, as it stands?", "If I asked two different staff members the same food safety question, would I get the same answer?"]
    }),
    commercialImpact({
      categories: ["Risk", "Reputation", "Customer retention"],
      narrative: "A single food safety failure can close a site, trigger a public health notice, and end a reputation built over years — the risk here is disproportionate to almost anything else in a hospitality business."
    }),
    ["Reduce business risk", "Improve customer experience"]
  ),

  knowledgeItem(
    concept({
      name: "Guest Experience Recovery", purpose: "Measure whether a poor guest experience can be recovered in the moment, not just apologised for afterwards.",
      category: "Customer Experience", tags: ["Hospitality", "Reservations", "Guest Experience"],
      relatedConcepts: ["Customer Complaints", "Leadership Communication", "Training Effectiveness"]
    }),
    {
      question: "Describe how a below par guest experience is identified and recovered while the guest is still present.",
      supportingQuestions: ["Who's empowered to resolve a guest issue without escalation?", "Can you walk me through a recent example of recovery in action?"],
      followUpQuestions: ["What's the most common reason recovery doesn't happen in the moment?", "How would you know if recovery attempts were actually working?"],
      evidenceRequired: ["Service recovery examples", "Staff empowerment policy"],
      observationPoints: [],
      metrics: ["Recovery rate for flagged issues", "Repeat visit rate following a complaint"],
      frequency: "Reviewed as incidents occur, trends reviewed quarterly"
    },
    ["Issues are only addressed after the guest has left, if at all.", "Staff notice issues but have no way to act on them.", "Some staff can act, but recovery is inconsistent.", "Staff are generally empowered to resolve issues on the spot.", "Recovery is consistent and tracked for effectiveness.", "Recovery consistently turns a poor experience into a loyal guest."],
    [
      { recommendation: "Give frontline staff at least one simple gesture they can offer without approval.", benefitType: "Customer Experience Improvement", estimationGuidance: "Estimate the value of one retained customer using average lifetime spend." },
      { recommendation: "Clarify explicitly what staff are allowed to do without asking a manager.", benefitType: "Efficiency Improvement", estimationGuidance: "Estimate time and escalation cost saved per incident when staff can resolve it directly." },
      { recommendation: "Make that empowerment consistent across all staff, not just experienced ones.", benefitType: "Customer Experience Improvement", estimationGuidance: "Estimate variance in outcomes currently caused by inconsistent staff authority." },
      { recommendation: "Start tracking how often in the moment recovery is actually used.", benefitType: "Customer Experience Improvement", estimationGuidance: "Use tracked recovery rate to identify where training or authority gaps remain." },
      { recommendation: "Review recovery outcomes regularly to refine what works best.", benefitType: "Customer Retention", estimationGuidance: "Estimate repeat visit uplift among guests who experienced a successful recovery." },
      { recommendation: "Treat recovered guests as a source of loyalty and word of mouth, and track it.", benefitType: "Growth Opportunity", estimationGuidance: "Estimate referral value generated from guests who had a negative experience turned around." }
    ],
    guidance({
      ifClientSays: [
        { says: "Our staff always sort it out.", meansCheckFor: "Ask what staff are actually authorised to do without checking with a manager — this often reveals the opposite." },
        { says: "We rarely have unhappy guests.", meansCheckFor: "Ask how they'd know, if there's no system for capturing dissatisfaction that isn't voiced as a formal complaint." }
      ],
      lookFor: ["Whether frontline staff can describe a specific recovery they've made without approval", "How quickly a visibly unhappy guest is noticed and approached", "Whether recovery gestures are consistent or dependent on which staff member is on shift"],
      warningSigns: ["All recovery requires manager sign-off, slowing response", "Recovery is described as rare because problems are rare, not because recovery works well", "Different staff describe very different levels of authority"],
      typicalEvidence: ["A specific example of an empowered, in-the-moment recovery", "Consistent staff answers about what they're allowed to do unassisted", "Any tracking of recovery outcomes, even informal"],
      commonExcuses: [{ excuse: "We can't let staff make those calls, they might give too much away.", probe: "Ask what the actual cost has been of a slow, escalated recovery versus a small in-the-moment gesture." }],
      bestPractice: "The strongest guest experience operations empower frontline staff with clear, bounded authority to recover a bad moment immediately, rather than routing every recovery through management.",
      probingQuestions: ["What's the last thing a staff member did to save a bad guest experience, without asking permission first?", "What exactly is a server allowed to do on their own if a guest is unhappy?"]
    }),
    commercialImpact({
      categories: ["Customer retention", "Reputation", "Lost revenue"],
      narrative: "A poor experience left unrecovered doesn't just lose one visit — it loses every future visit, every referral that guest would have made, and increasingly ends up as a public review shaping other people's decisions too."
    }),
    ["Improve customer retention", "Improve customer experience"]
  )
];

// All concept names in the Knowledge Base, for selecting which BPIs a
// Consultancy Hypothesis is actually about.
export const conceptNames = knowledgeBase.map((k) => k.concept.name);

// Controlled lists used to drive the Business Profile step in Client
// Onboarding. These are the entry points into the tag space — selecting an
// industry, capability or regulation just adds that name as an active tag.
// The single source of truth for a client's industry — used both for
// display and for matching Industry-tagged concepts. Previously there were
// two separate industry fields (a free-text display label and this
// controlled list), which could silently disagree with each other. Only
// the first five have dedicated Knowledge Base content today; the rest
// behave like "Other" until industry-specific modules are written for
// them, same honest pattern as everywhere else in this library.
export const industryOptions = [
  "Logistics", "Manufacturing", "Retail", "Hospitality", "Professional Services",
  "Construction", "Healthcare", "Education", "Technology and IT", "Agriculture",
  "Financial Services", "Real Estate", "Automotive", "Energy and Utilities",
  "Creative and Media", "Non-Profit and Charity", "Wholesale and Distribution",
  "Leisure and Recreation", "Public Sector", "Other"
];
export const capabilityOptions = [
  "Warehouse", "Fleet Management", "Field Service", "Manufacturing", "Customer Support",
  "Call Centre", "Sales Team", "Project Delivery", "Procurement", "Exporting", "Importing",
  "Ecommerce", "Subscriptions", "Franchises", "Multi Site Operations", "Remote Workforce"
];
export const regulatoryOptions = [
  "ISO 9001", "ISO 14001", "ISO 27001", "ISO 45001", "CQC", "FCA", "GDPR",
  "Food Hygiene", "Construction Design and Management", "Environmental Compliance", "Medical Device Regulations"
];

// Escalation Flags — for findings serious enough that they shouldn't wait
// for a report to reach someone senior.
export const escalationFlagOptions = [
  "Immediate Risk", "Legal Concern", "Financial Concern", "Safeguarding",
  "Health and Safety", "Fraud Concern", "Reputational Risk"
];

// Business Objectives — what the client is actually trying to achieve.
// Selected during onboarding, these become the primary driver of what gets
// prioritised in the assessment and how the report is framed. They do NOT
// gate which BPIs appear (tags and dependencies still decide that) — an
// objective changes emphasis and ordering, not inclusion.
export const businessObjectiveOptions = [
  "Increase revenue", "Improve profitability", "Reduce costs", "Increase enquiries",
  "Improve conversion", "Improve customer retention", "Improve operational efficiency",
  "Save time", "Prepare for growth", "Expand locations", "Sell the business",
  "Reduce business risk", "Improve staff performance", "Improve customer experience",
  "Improve online presence"
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
