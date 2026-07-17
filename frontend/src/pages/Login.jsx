import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Activity } from "lucide-react";
const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      // FastAPI OAuth2PasswordRequestForm expects form data.
      const body = new URLSearchParams();
      body.append("username", form.email);
      body.append("password", form.password);

      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Login failed");
      }

      localStorage.setItem("access_token", data.access_token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-logo"><Activity size={28} /></div>
        <h1>Welcome back</h1>
        <p className="muted">Sign in to manage your health records.</p>

        {error && <p className="error">{error}</p>}

        <form onSubmit={handleSubmit}>
          <label>
            Email
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </label>

          <label>
            Password
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </label>

          <button className="primary" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="auth-footer">
          No account? <Link to="/register">Create one</Link>
        </p>
      </section>
    </main>
  );
}
