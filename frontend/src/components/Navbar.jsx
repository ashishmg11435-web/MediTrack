import { Activity, CalendarDays, FileHeart, LogOut, Pill, User, Sparkles } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("access_token");

  function logout() {
    localStorage.removeItem("access_token");
    navigate("/login");
  }

  if (!token) return null;

  return (
    <header className="navbar">
      <NavLink className="brand" to="/dashboard">
        <Activity size={25} />
        <span>MediTrack</span>
      </NavLink>

      <nav>
        <NavLink to="/records">
          <FileHeart size={18} /> Records
        </NavLink>
        <NavLink to="/medicines">
          <Pill size={18} /> Medicines
        </NavLink>
        <NavLink to="/appointments">
          <CalendarDays size={18} /> Appointments
        </NavLink>
        <NavLink to="/profile">
          <User size={18} /> Profile
        </NavLink>
        <NavLink to="/insights" style={{ color: '#2563eb' }}>
          <Sparkles size={18} /> AI Assistant
        </NavLink>
        <button className="nav-button" onClick={logout}>
          <LogOut size={18} /> Logout
        </button>
      </nav>
    </header>
  );
}
