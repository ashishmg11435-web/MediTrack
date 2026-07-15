import { useEffect, useState } from "react";
import { CalendarDays, FileHeart, Pill, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { apiRequest } from "../api";

export default function Dashboard() {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    async function loadSummary() {
      try {
        setSummary(await apiRequest("/dashboard/summary"));
      } catch (err) {
        console.error("Failed to load dashboard summary", err);
      }
    }
    loadSummary();
  }, []);
  return (
    <main className="page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">PATIENT DASHBOARD</p>
          <h1>Your health, organized.</h1>
          <p className="muted">Manage records, medicines, and appointments in one place.</p>
        </div>
      </div>

      <section className="dashboard-grid">
        <Link className="feature-card" to="/records">
          <FileHeart size={28} />
          <h2>Medical Records</h2>
          <p>Store diagnoses and visit notes.</p>
          {summary && <p className="muted"><strong>{summary.total_medical_records}</strong> total</p>}
          <span>View records →</span>
        </Link>

        <Link className="feature-card" to="/medicines">
          <Pill size={28} />
          <h2>Medicines</h2>
          <p>Keep track of medicines and dosages.</p>
          {summary && <p className="muted"><strong>{summary.active_medicines}</strong> active</p>}
          <span>View medicines →</span>
        </Link>

        <Link className="feature-card" to="/appointments">
          <CalendarDays size={28} />
          <h2>Appointments</h2>
          <p>Book and manage doctor appointments.</p>
          {summary && <p className="muted"><strong>{summary.upcoming_appointments}</strong> upcoming</p>}
          <span>View appointments →</span>
        </Link>

        <Link className="feature-card" to="/insights" style={{ border: '2px solid #bfdbfe', background: '#eff6ff' }}>
          <Sparkles size={28} color="#3b82f6" />
          <h2 style={{ color: '#1d4ed8' }}>AI Assistant</h2>
          <p style={{ color: '#1e40af' }}>Ask questions based on your health profile.</p>
          <span style={{ color: '#2563eb' }}>Chat now →</span>
        </Link>
      </section>
    </main>
  );
}
