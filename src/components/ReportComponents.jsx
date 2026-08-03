import BusinessDNA from "./BusinessDNA.jsx";
import { categoryScores } from "../utils/scoring.js";

export function ReportPreview({ client, score }) {
  return (
    <pre className="report-box">{`KIST Business Performance Report

Client: ${client?.name || "Client"}
Overall score: ${score ?? client?.score ?? 0}/100

Executive Summary:
This report summarises the KIST assessment findings, key risks, opportunities and recommended 90 day action plan.

Recommendations:
1. Confirm ownership of priority actions.
2. Improve KPI visibility.
3. Develop a 90 day improvement roadmap.`}</pre>
  );
}

export function PresentationMode({ client, score, answers }) {
  return (
    <div className="presentation">
      <h1>{client?.name}</h1>
      <strong>{score ?? client?.score ?? 0}/100</strong>
      <p>Business Performance Score</p>
      <BusinessDNA scores={categoryScores(answers || []).map((c) => c.score)} />
    </div>
  );
}
