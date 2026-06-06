import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { Menu, Plus, Bell, Grid, Search } from "lucide-react";
import { AuthContext } from "../../../contexts/AuthContext";
import "./Navbar.scss";

const getInitials = (name) => {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  return parts.length === 1
    ? parts[0][0].toUpperCase()
    : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const Navbar = ({ onToggleSidebar }) => {
  const { user } = useContext(AuthContext);
  const fullName = user?.fullName || localStorage.getItem("user_name") || "";
  const initials = getInitials(fullName);

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <button className="icon-btn sidebar-toggle" onClick={onToggleSidebar}>
          <Menu size={24} />
        </button>

        <Link to="/" className="navbar-logo">
          <div className="logo-icon">E</div>
          <span className="logo-text">EduClass</span>
        </Link>
      </div>

      <div className="navbar-middle">
        <div className="search-bar">
          <Search size={20} className="search-icon" />
          <input type="text" placeholder="Tìm kiếm lớp học..." />
        </div>
      </div>

      <div className="navbar-right">
        <button className="icon-btn">
          <Grid size={22} />
        </button>

        <Link to="auth" className="navbar-profile" title={fullName}>
          {initials}
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
