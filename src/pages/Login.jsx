import { useState } from "react";

export default function Login({ onLogin }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await onLogin(password);
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="login-screen">
      <form className="login-card" onSubmit={handleSubmit}>
        <div className="brand">
          <div className="bars"><span /><span /><span /></div>
          <div><h1>KIST ONE</h1><p>SIGN IN</p></div>
        </div>
        <label>
          Password
          <input
            type="password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
          />
        </label>
        {error && <p className="login-error">{error}</p>}
        <button className="primary" type="submit" disabled={submitting || !password}>
          {submitting ? "Signing in…" : "Sign In"}
        </button>
      </form>
    </div>
  );
}
