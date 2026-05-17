import React from "react";
import { Link } from "react-router-dom";
import { Menu, Plus, Bell, Grid, Search } from "lucide-react";
import "./Navbar.scss";

const Navbar = ({ onToggleSidebar }) => {
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
        {/* Nút tạo lớp học chuyển hướng sang trang Create Class */}
        <Link to="/create-class" className="icon-btn" title="Tạo lớp học mới">
          <Plus size={24} />
        </Link>

        <button className="icon-btn">
          <Grid size={22} />
        </button>

        <button className="icon-btn">
          <Bell size={22} />
        </button>

        <Link to="auth" className="navbar-profile"></Link>
      </div>
    </nav>
  );
};

export default Navbar;
