import { CheckCircle2 } from "lucide-react";
import PageHeader from "../components/PageHeader.jsx";
import { featureRegister } from "../data/seedData.js";

export default function Foundation() {
  return (
    <section>
      <PageHeader title="Foundation" subtitle="Protected feature register and build rules." />
      <div className="card protected">
        <h2>Master Build Rule</h2>
        <p className="muted">No existing feature is removed unless you specifically ask for it to be removed. Future releases must pass this register before a build is provided.</p>
      </div>
      <div className="card">
        <h2>Feature Register</h2>
        <div className="checklist">
          {featureRegister.map((item) => <div className="check-item" key={item}><CheckCircle2 size={18} />{item}</div>)}
        </div>
      </div>
    </section>
  );
}
