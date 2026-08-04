import { useState, useEffect } from "react";
import BusinessDNA from "../components/BusinessDNA.jsx";
import {
  getClientAssessment, categoryScores, calculateOverall,
  topCategories, bottomCategories, reviewHypothesis, buildRoadmap
} from "../utils/scoring.js";

export default function Presentation({ data, selectedClient, setPage }) {
  const client = data.clients.find((c) => c.id === selectedClient) || data.clients[0];
  const answers = getClientAssessment(data, client.id);
  const catScores = categoryScores(answers);
  const overall = calculateOverall(answers);
  const strengths = topCategories(catScores, 3);
  const improvements = bottomCategories(catScores, 3);
  const objectives = client.profile?.objectives || [];
  const hypothesis = client.profile?.hypothesis;
  const hypothesisReview = reviewHypothesis(answers, hypothesis);
  const roadmap = buildRoadmap(answers);
  const [slide, setSlide] = useState(0);

  const slides = [
    { key: "title" },
    ...(objectives.length > 0 ? [{ key: "objectives" }] : []),
    ...(hypothesis?.statement ? [{ key: "hypothesis" }] : []),
    { key: "score" },
    { key: "findings" },
    { key: "roadmap" }
  ];
  const total = slides.length;

  useEffect(() => {
    function handleKey(e) {
      if (e.key === "ArrowRight" || e.key === " ") setSlide((s) => Math.min(s + 1, total - 1));
      else if (e.key === "ArrowLeft") setSlide((s) => Math.max(s - 1, 0));
      else if (e.key === "Escape") setPage("visits");
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [total, setPage]);

  function enterFullscreen() {
    document.documentElement.requestFullscreen?.().catch(() => {});
  }

  const current = slides[slide].key;

  return (
    <div className="presentation-shell">
      <div className="presentation-controls no-print">
        <button className="secondary" onClick={() => setPage("visits")}>Exit Presentation</button>
        <button className="secondary" onClick={enterFullscreen}>Enter Full Screen</button>
        <span className="presentation-slide-counter">Slide {slide + 1} of {total}</span>
      </div>

      <div className="presentation-slide">
        {current === "title" && (
          <div className="presentation-content presentation-title-slide">
            <div className="presentation-brand"><div className="bars"><span /><span /><span /></div><span>KIST ONE</span></div>
            <h1>{client.name}</h1>
            <p>Business Performance Review</p>
          </div>
        )}

        {current === "objectives" && (
          <div className="presentation-content">
            <h2>What You Told Us You Want to Achieve</h2>
            <div className="presentation-chip-row">
              {objectives.map((o) => <span className="presentation-chip" key={o}>{o}</span>)}
            </div>
            {client.profile?.threeProblems && <p className="presentation-quote">"{client.profile.threeProblems}"</p>}
          </div>
        )}

        {current === "hypothesis" && (
          <div className="presentation-content">
            <h2>Our Working Theory</h2>
            <p className="presentation-quote">"{hypothesis.statement}"</p>
            {hypothesisReview && hypothesisReview.status !== "Not Yet Tested" && (
              <span className={`presentation-hypothesis-badge presentation-hypothesis-${hypothesisReview.status.replace(/\s+/g, "-").toLowerCase()}`}>
                {hypothesisReview.status} by the evidence
              </span>
            )}
          </div>
        )}

        {current === "score" && (
          <div className="presentation-content presentation-score-slide">
            <h2>Business Performance Score</h2>
            <strong className="presentation-score">{overall}</strong>
            <span className="presentation-score-label">out of 100</span>
            <BusinessDNA scores={catScores.map((c) => c.score)} />
            <p className="presentation-footnote">This score is the evidence behind the story — not the point of it.</p>
          </div>
        )}

        {current === "findings" && (
          <div className="presentation-content presentation-two-col">
            <div>
              <h3>Strongest Areas</h3>
              <ul>{strengths.map((c) => <li key={c.category}>{c.category} — {c.score}/100</li>)}</ul>
            </div>
            <div>
              <h3>Priority Improvement Areas</h3>
              <ul>{improvements.map((c) => <li key={c.category}>{c.category} — {c.score}/100</li>)}</ul>
            </div>
          </div>
        )}

        {current === "roadmap" && (
          <div className="presentation-content presentation-roadmap-slide">
            <h2>The 90 Day Roadmap</h2>
            <div className="presentation-roadmap-cols">
              {[["Next 30 Days", roadmap.thirty], ["31 to 60 Days", roadmap.sixty], ["61 to 90 Days", roadmap.ninety]].map(([label, items]) => (
                <div key={label}>
                  <h4>{label}</h4>
                  <ul>{items.length ? items.map((i) => <li key={i.id}>{i.concept}</li>) : <li className="presentation-muted">Nothing yet</li>}</ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="presentation-nav no-print">
        <button className="secondary" disabled={slide === 0} onClick={() => setSlide(slide - 1)}>← Previous</button>
        <button className="secondary" disabled={slide === total - 1} onClick={() => setSlide(slide + 1)}>Next →</button>
      </div>
    </div>
  );
}
