import React from "react";
import { Link } from "react-router-dom";
import {
  Home,
  Bell,
  Calendar,
  Plus,
  LayoutGrid,
  ClipboardCheck,
  Users,
} from "lucide-react";
import "./Sidebar.scss";

export default function Sidebar({ isOpen }) {
  if (!isOpen) return null;

  return (
    <aside className="sidebar">
      <div className="sidebar-group">
        <div className="sidebar-wrapper">
          <div className="nav-item active">
            <Link className="nav-item-content">
              <Home size={20} />
              <span className="nav-label">Trang chủ</span>
            </Link>
          </div>

          <div className="nav-item">
            <div className="nav-item-content">
              <Bell size={20} />
              <span className="nav-label">Thông báo</span>
            </div>
            <span className="nav-badge">3</span>
          </div>

          <div className="nav-item">
            <div className="nav-item-content">
              <Calendar size={20} />
              <span className="nav-label">Lịch học</span>
            </div>
          </div>
        </div>
      </div>

      <div className="sidebar-divider" />

      <div className="sidebar-group">
        <div className="section-header">
          <h4 className="section-title">LỚP HỌC CỦA TÔI</h4>
          <Link to="/create-class" className="btn-add-class">
            <Plus size={16} />
          </Link>
        </div>

        {[
          { letter: "T", name: "Toán giải tích 12", color: "#7c3aed" },
          { letter: "V", name: "Vật lý nâng cao", color: "#0d9488" },
          { letter: "H", name: "Hóa học hữu cơ", color: "#ea580c" },
        ].map((cls) => (
          <div key={cls.name} className="class-item">
            <div
              className="class-avatar"
              style={{ backgroundColor: cls.color }}
            >
              {cls.letter}
            </div>
            <span className="class-name">{cls.name}</span>
          </div>
        ))}
      </div>

      {/* Khối Công cụ - Mapping trực tiếp trong return */}
      <div className="sidebar-group tools-section">
        <h4 className="section-title">CÔNG CỤ</h4>
        {[
          { icon: <LayoutGrid size={20} />, label: "Chấm điểm & đánh giá" },
          {
            icon: <ClipboardCheck size={20} />,
            label: "Bài tập & đề kiểm tra",
          },
          { icon: <Users size={20} />, label: "Học sinh của tôi" },
        ].map((tool) => (
          <div key={tool.label} className="nav-item">
            <div className="nav-item-content">
              <span className="nav-icon">{tool.icon}</span>
              <span className="nav-label">{tool.label}</span>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
