import React, { useContext, useRef, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, Plus, Bell, Grid, Search, LogOut } from "lucide-react";
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
  const { user, logout } = useContext(AuthContext);
  const fullName = user?.fullName || localStorage.getItem("user_name") || "";
  const initials = getInitials(fullName);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

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

        <div className="profile-wrapper" ref={dropdownRef}>
          <button
            className="navbar-profile"
            title={fullName}
            onClick={() => setOpen((prev) => !prev)}
          >
            {initials}
          </button>

          {open && (
            <div className="profile-dropdown">
              <div className="dropdown-header">
                <div className="dropdown-avatar">{initials}</div>
                <div>
                  <p className="dropdown-name">{fullName || "Người dùng"}</p>
                  <p className="dropdown-email">{user?.email || ""}</p>
                </div>
              </div>
              <div className="dropdown-divider" />
              <button className="dropdown-item logout" onClick={handleLogout}>
                <LogOut size={15} />
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
