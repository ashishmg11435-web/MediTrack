import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { apiRequest } from "../api";

export default function Medicines() {
  const [medicines, setMedicines] = useState([]);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    dosage: "",
    frequency: "",
    start_date: "",
    end_date: "",
  });

  async function loadMedicines() {
    try {
      setMedicines(await apiRequest("/medicines"));
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadMedicines();
  }, []);

  async function addMedicine(event) {
    event.preventDefault();

    try {
      await apiRequest("/medicines", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setForm({ name: "", dosage: "", frequency: "", start_date: "", end_date: "" });
      loadMedicines();
    } catch (err) {
      setError(err.message);
    }
  }

  async function deleteMedicine(id) {
    try {
      await apiRequest(`/medicines/${id}`, { method: "DELETE" });
      loadMedicines();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className="page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">MEDICINE TRACKER</p>
          <h1>Medicines</h1>
          <p className="muted">Track medicine schedules and dosage information.</p>
        </div>
      </div>

      {error && <p className="error">{error}</p>}

      <section className="content-grid">
        <form className="panel" onSubmit={addMedicine}>
          <h2>Add medicine</h2>
          <label>Medicine name<input required value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} /></label>
          <label>Dosage<input required placeholder="500 mg" value={form.dosage} onChange={(e) => setForm({...form, dosage: e.target.value})} /></label>
          <label>Frequency<input required placeholder="Twice daily" value={form.frequency} onChange={(e) => setForm({...form, frequency: e.target.value})} /></label>
          <label>Start date<input type="date" required value={form.start_date} onChange={(e) => setForm({...form, start_date: e.target.value})} /></label>
          <label>End date<input type="date" required value={form.end_date} onChange={(e) => setForm({...form, end_date: e.target.value})} /></label>
          <button className="primary">Add medicine</button>
        </form>

        <section className="panel">
          <h2>Current medicines</h2>
          <div className="item-list">
            {medicines.length === 0 && <p className="muted">No medicines added.</p>}
            {medicines.map((medicine) => (
              <article className="list-item" key={medicine.id}>
                <div>
                  <h3>{medicine.name}</h3>
                  <p>{medicine.dosage} · {medicine.frequency}</p>
                  <p className="muted">{medicine.start_date} to {medicine.end_date}</p>
                </div>
                <button className="icon-button" onClick={() => deleteMedicine(medicine.id)} aria-label="Delete medicine">
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
