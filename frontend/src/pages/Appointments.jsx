import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { apiRequest } from "../api";

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    doctor_name: "",
    appointment_date: "",
    reason: "",
  });

  async function loadAppointments() {
    try {
      setAppointments(await apiRequest("/appointments"));
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadAppointments();
  }, []);

  async function bookAppointment(event) {
    event.preventDefault();

    try {
      await apiRequest("/appointments", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setForm({ doctor_name: "", appointment_date: "", reason: "" });
      loadAppointments();
    } catch (err) {
      setError(err.message);
    }
  }

  async function cancelAppointment(id) {
    try {
      await apiRequest(`/appointments/${id}/cancel`, { method: "PATCH" });
      loadAppointments();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className="page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">CARE SCHEDULE</p>
          <h1>Appointments</h1>
          <p className="muted">Book and manage your doctor visits.</p>
        </div>
      </div>

      {error && <p className="error">{error}</p>}

      <section className="content-grid">
        <form className="panel" onSubmit={bookAppointment}>
          <h2>Book appointment</h2>
          <label>Doctor name<input required value={form.doctor_name} onChange={(e) => setForm({...form, doctor_name: e.target.value})} /></label>
          <label>Date and time<input type="datetime-local" required value={form.appointment_date} onChange={(e) => setForm({...form, appointment_date: e.target.value})} /></label>
          <label>Reason<textarea rows="4" required value={form.reason} onChange={(e) => setForm({...form, reason: e.target.value})} /></label>
          <button className="primary">Book appointment</button>
        </form>

        <section className="panel">
          <h2>Your appointments</h2>
          <div className="item-list">
            {appointments.length === 0 && <p className="muted">No appointments booked.</p>}
            {appointments.map((appointment) => (
              <article className="list-item" key={appointment.id}>
                <div>
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {appointment.doctor_name}
                    {appointment.status === "CANCELLED" && (
                      <span style={{ fontSize: '0.7rem', padding: '2px 6px', background: '#fee2e2', color: '#ef4444', borderRadius: '4px' }}>
                        CANCELLED
                      </span>
                    )}
                  </h3>
                  <p>{new Date(appointment.appointment_date).toLocaleString()}</p>
                  <p className="muted">{appointment.reason}</p>
                </div>
                {appointment.status !== "CANCELLED" && (
                  <button className="icon-button" onClick={() => cancelAppointment(appointment.id)} aria-label="Cancel appointment">
                    <X size={18} />
                  </button>
                )}
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
