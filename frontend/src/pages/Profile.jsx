import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../api";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    age: "",
    blood_group: "",
    height: "",
    weight: "",
    allergies: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();

  // Fetch the current user and their profile on mount
  useEffect(() => {
    async function fetchData() {
      // Run both requests at the same time for speed
      const [userData, profileData] = await Promise.allSettled([
        apiRequest("/users/me"),
        apiRequest("/profile"),
      ]);

      if (userData.status === "fulfilled") {
        setUser(userData.value);
      }

      if (profileData.status === "fulfilled") {
        const data = profileData.value;
        setProfile(data);
        setForm({
          age: data.age ?? "",
          blood_group: data.blood_group ?? "",
          height: data.height ?? "",
          weight: data.weight ?? "",
          allergies: data.allergies ?? "",
        });
      } else if (!profileData.reason?.message?.includes("Profile not found")) {
        setError(profileData.reason?.message || "Failed to load profile");
      }

      setLoading(false);
    }
    fetchData();
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    // Convert numeric fields from string to number (or null if empty)
    const payload = {
      age: form.age !== "" ? Number(form.age) : null,
      blood_group: form.blood_group || null,
      height: form.height !== "" ? Number(form.height) : null,
      weight: form.weight !== "" ? Number(form.weight) : null,
      allergies: form.allergies || null,
    };

    try {
      const data = await apiRequest("/profile", {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      setProfile(data);
      setSuccess("Profile saved successfully!");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteAccount() {
    if (!window.confirm("Are you sure you want to delete your account? This action cannot be undone and will delete all your medical records, appointments, and medicines.")) {
      return;
    }
    setDeleting(true);
    try {
      await apiRequest("/users/me", { method: "DELETE" });
      localStorage.removeItem("access_token");
      navigate("/login");
    } catch (err) {
      setError(err.message);
      setDeleting(false);
    }
  }

  if (loading) return <div className="page"><p className="muted">Loading your profile…</p></div>;

  return (
    <main className="page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">ACCOUNT</p>
          <h1>Health Profile</h1>
          <p className="muted">View and update your personal health information.</p>
        </div>
      </div>

      <div className="content-grid">
        {/* Left panel: current profile summary */}
        <div className="panel">
          {user && (
            <div className="profile-user-header">
              <div className="profile-avatar">{user.name.charAt(0).toUpperCase()}</div>
              <div>
                <h2 style={{ margin: 0 }}>{user.name}</h2>
                <p className="muted" style={{ margin: "4px 0 0" }}>{user.email}</p>
              </div>
            </div>
          )}
          <h3 style={{ marginTop: "24px", marginBottom: "12px" }}>Health Details</h3>
          {profile ? (
            <dl className="profile-dl">
              <div className="profile-row">
                <dt>Age</dt>
                <dd>{profile.age ?? <span className="muted">—</span>}</dd>
              </div>
              <div className="profile-row">
                <dt>Blood Group</dt>
                <dd>{profile.blood_group ?? <span className="muted">—</span>}</dd>
              </div>
              <div className="profile-row">
                <dt>Height</dt>
                <dd>{profile.height != null ? `${profile.height} cm` : <span className="muted">—</span>}</dd>
              </div>
              <div className="profile-row">
                <dt>Weight</dt>
                <dd>{profile.weight != null ? `${profile.weight} kg` : <span className="muted">—</span>}</dd>
              </div>
              {profile.height && profile.weight && (() => {
                const bmi = (profile.weight / Math.pow(profile.height / 100, 2)).toFixed(1);
                const category =
                  bmi < 18.5 ? "Underweight" :
                  bmi < 25   ? "Normal weight" :
                  bmi < 30   ? "Overweight" : "Obese";
                return (
                  <div className="profile-row">
                    <dt>BMI</dt>
                    <dd>{bmi} <span className="muted">({category})</span></dd>
                  </div>
                );
              })()}
              <div className="profile-row">
                <dt>Allergies</dt>
                <dd>{profile.allergies ?? <span className="muted">None listed</span>}</dd>
              </div>
            </dl>
          ) : (
            <p className="muted">No profile saved yet. Fill out the form to create one!</p>
          )}

          <div style={{ marginTop: "32px", borderTop: "1px solid var(--border)", paddingTop: "24px" }}>
            <h3 style={{ color: "var(--danger, #dc2626)", marginBottom: "12px" }}>Danger Zone</h3>
            <p className="muted" style={{ marginBottom: "16px", fontSize: "0.9rem" }}>
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
            <button 
              className="danger" 
              style={{ backgroundColor: "var(--danger, #dc2626)", color: "white", padding: "8px 16px", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "500" }} 
              onClick={handleDeleteAccount} 
              disabled={deleting}
            >
              {deleting ? "Deleting…" : "Delete Account"}
            </button>
          </div>
        </div>

        {/* Right panel: edit form */}
        <div className="panel">
          <h2>{profile ? "Update Profile" : "Create Profile"}</h2>

          {error && <p className="error">{error}</p>}
          {success && <p className="success">{success}</p>}

          <form onSubmit={handleSubmit}>
            <label>
              Age
              <input
                type="number"
                name="age"
                min="0"
                max="150"
                placeholder="e.g. 28"
                value={form.age}
                onChange={handleChange}
              />
            </label>

            <label>
              Blood Group
              <select name="blood_group" value={form.blood_group} onChange={handleChange} className="select-input">
                <option value="">Select blood group</option>
                {BLOOD_GROUPS.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </label>

            <label>
              Height (cm)
              <input
                type="number"
                name="height"
                min="0"
                step="0.1"
                placeholder="e.g. 170"
                value={form.height}
                onChange={handleChange}
              />
            </label>

            <label>
              Weight (kg)
              <input
                type="number"
                name="weight"
                min="0"
                step="0.1"
                placeholder="e.g. 65"
                value={form.weight}
                onChange={handleChange}
              />
            </label>

            <label>
              Allergies
              <textarea
                name="allergies"
                rows={3}
                placeholder="e.g. Penicillin, Peanuts"
                value={form.allergies}
                onChange={handleChange}
              />
            </label>

            <button className="primary" disabled={saving}>
              {saving ? "Saving…" : profile ? "Update Profile" : "Create Profile"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
