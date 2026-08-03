import { useState, useEffect } from "react";
import PageHeader from "../components/PageHeader.jsx";
import AssessmentPanel from "../components/AssessmentPanel.jsx";
import { getClientAssessment, setClientAssessment } from "../utils/scoring.js";

export default function Assessments({ data, setData, selectedClient, setSelectedClient }) {
  const [clientId, setClientId] = useState(selectedClient || data.clients[0]?.id || "");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const client = data.clients.find((c) => c.id === clientId) || data.clients[0];
  const answers = getClientAssessment(data, client.id);

  useEffect(() => { setCurrentQuestion(0); }, [clientId]);

  function setAnswers(next) { setClientAssessment(data, setData, client.id, next); }
  function chooseClient(id) { setClientId(id); if (setSelectedClient) setSelectedClient(id); }

  return (
    <section>
      <PageHeader title="Assessment Engine" subtitle="250 questions restored with 11 category navigation." action={<button className="primary">Save Assessment</button>} />
      <div className="card"><label>Client<select value={clientId} onChange={(e) => chooseClient(e.target.value)}>{data.clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label></div>
      <AssessmentPanel answers={answers} setAnswers={setAnswers} currentQuestion={currentQuestion} setCurrentQuestion={setCurrentQuestion} />
    </section>
  );
}
