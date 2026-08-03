import PageHeader from "../components/PageHeader.jsx";

export default function Actions({ data, setData }) {
  function complete(id) {
    setData({ ...data, actions: data.actions.map((a) => (a.id === id ? { ...a, status: "Complete" } : a)) });
  }
  return (
    <section>
      <PageHeader title="Actions" subtitle="90 day actions and follow ups." />
      <div className="card">
        <h2>Open Actions</h2>
        {data.actions.map((a) => (
          <div className="row" key={a.id}>
            <span><strong>{a.title}</strong><small>{a.client} · {a.owner} · Due {a.due}</small></span>
            <b>{a.status}</b>
            <button className="secondary" onClick={() => complete(a.id)}>Complete</button>
          </div>
        ))}
      </div>
    </section>
  );
}
