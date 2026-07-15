import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { apiRequest } from "../api";

export default function Records() {
  const [records, setRecords] = useState([]);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    diagnosis: "",
    doctor_name: "",
    visit_date: "",
    notes: "",
  });

  async function loadRecords() {
    try {
      setRecords(await apiRequest("/records"));
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadRecords();
  }, []);

  async function addRecord(event) {
    event.preventDefault();

    try {
      await apiRequest("/records", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setForm({ diagnosis: "", doctor_name: "", visit_date: "", notes: "" });
      loadRecords();
    } catch (err) {
      setError(err.message);
    }
  }

  async function deleteRecord(id) {
    try {
      await apiRequest(`/records/${id}`, { method: "DELETE" });
      loadRecords();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className="page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">HEALTH HISTORY</p>
          <h1>Medical Records</h1>
          <p className="muted">Keep your visit history in one place.</p>
        </div>
      </div>

      {error && <p className="error">{error}</p>}

      <section className="content-grid">
        <form className="panel" onSubmit={addRecord}>
          <h2>Add a record</h2>
          <label>Diagnosis<input required value={form.diagnosis} onChange={(e) => setForm({...form, diagnosis: e.target.value})} /></label>
          <label>Doctor name<input required value={form.doctor_name} onChange={(e) => setForm({...form, doctor_name: e.target.value})} /></label>
          <label>Visit date<input type="date" required value={form.visit_date} onChange={(e) => setForm({...form, visit_date: e.target.value})} /></label>
          <label>Notes<textarea rows="4" value={form.notes} onChange={(e) => setForm({...form, notes: e.target.value})} /></label>
          <button className="primary">Save record</button>
        </form>

        <section className="panel">
          <h2>Your records</h2>
          <div className="item-list">
            {records.length === 0 && <p className="muted">No records yet.</p>}
            {records.map((record) => (
              <article className="list-item" key={record.id}>
                <div>
                  <h3>{record.diagnosis}</h3>
                  <p>{record.doctor_name} · {record.visit_date}</p>
                  <p className="muted">{record.notes}</p>
                </div>
                <button className="icon-button" onClick={() => deleteRecord(record.id)} aria-label="Delete record">
                  <Trash2 size={18} />
                </button>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
