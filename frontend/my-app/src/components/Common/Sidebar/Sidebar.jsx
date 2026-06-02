import React, { useState, useEffect, useContext } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  Home,
  Bell,
  Calendar,
  Plus,
  LayoutGrid,
  ClipboardCheck,
  Users,
} from "lucide-react";
import { AuthContext } from "../../../contexts/AuthContext";
import "./Sidebar.scss";
import { API_BASE_URL } from "../../../config/api";


const getColorFromName = (name) => {
  const colors = [
    "#7c3aed",
    "#0d9488",
    "#ea580c",
    "#2563eb",
    "#db2777",
    "#16a34a",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

export default function Sidebar({ isOpen }) {
  const { user } = useContext(AuthContext);
  const [myClasses, setMyClasses] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const token = localStorage.getItem("token");

  // Logic phân quyền
  const isTeacher = (user?.role || user?.Role) === "Teacher";
  const classActionPath = isTeacher ? "/create-class" : "/join-class";

  const fetchData = async () => {
    if (!token) return;
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const classRes = await fetch(`${API_BASE_URL}/classroom/my`, { headers });
      const classesData = await classRes.json();

      if (Array.isArray(classesData)) {
        setMyClasses(classesData);

        // Tính toán Badge thông báo mới
        const classIds = classesData.map((c) => c.id);
        const notifyRequests = classIds.flatMap((id) => [
          fetch(`${API_BASE_URL}/announcement/class/${id}`, { headers }).then((r) =>
            r.json(),
          ),
          fetch(`${API_BASE_URL}/assignment/class/${id}/upcoming`, { headers }).then(
            (r) => r.json(),
          ),
        ]);

        const results = await Promise.all(notifyRequests);
        const lastRead = localStorage.getItem("lastReadNotifications");
        const lastReadDate = lastRead ? new Date(lastRead) : new Date(0);

        const totalUnread = results.reduce((acc, curr) => {
          if (!Array.isArray(curr)) return acc;
          const newItems = curr.filter(
            (item) => new Date(item.createdAt) > lastReadDate,
          );
          return acc + newItems.length;
        }, 0);

        setUnreadCount(totalUnread);
      }
    } catch (err) {
      console.error("Sidebar Error:", err);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    fetchData();

    // Lắng nghe sự kiện để xóa badge khi xem thông báo
    window.addEventListener("notificationsRead", fetchData);
    return () => window.removeEventListener("notificationsRead", fetchData);
  }, [isOpen, token]);

  if (!isOpen) return null;

  const navLinkClass = ({ isActive }) =>
    isActive ? "nav-item active" : "nav-item";

  return (
    <aside className="sidebar">
      <div className="sidebar-group">
        <NavLink to="/" className={navLinkClass}>
          <div className="nav-item-content">
            <Home size={20} />
            <span className="nav-label">Trang chủ</span>
          </div>
        </NavLink>

        <NavLink to="/notifications" className={navLinkClass}>
          <div className="nav-item-content">
            <Bell size={20} />
            <span className="nav-label">Thông báo</span>
          </div>
          {unreadCount > 0 && (
            <span className="nav-badge">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </NavLink>

        <NavLink to="/calendar" className={navLinkClass}>
          <div className="nav-item-content">
            <Calendar size={20} />
            <span className="nav-label">Lịch học</span>
          </div>
        </NavLink>
      </div>

      <div className="sidebar-divider" />

      <div className="sidebar-group">
        <div className="section-header">
          <h4 className="section-title">LỚP HỌC CỦA TÔI</h4>
          <Link
            to={classActionPath}
            className="btn-add-class"
            title={isTeacher ? "Tạo lớp" : "Tham gia lớp"}
          >
            <Plus size={16} />
          </Link>
        </div>

        {myClasses.map((cls) => (
          <NavLink
            key={cls.id}
            to={`/class/${cls.id}`}
            className={navLinkClass}
          >
            <div className="class-item-inner">
              <div
                className="class-avatar"
                style={{ backgroundColor: getColorFromName(cls.name) }}
              >
                {cls.name.charAt(0).toUpperCase()}
              </div>
              <span className="class-name">{cls.name}</span>
            </div>
          </NavLink>
        ))}
        {myClasses.length === 0 && <p className="empty-msg">Chưa có lớp học</p>}
      </div>

      <div className="sidebar-divider" />

      <div className="sidebar-group tools-section">
        <h4 className="section-title">CÔNG CỤ</h4>
        {[
          {
            icon: <LayoutGrid size={20} />,
            label: "Chấm điểm",
            path: "/grading",
          },
          {
            icon: <ClipboardCheck size={20} />,
            label: "Bài tập",
            path: "/assignments",
          },
          { icon: <Users size={20} />, label: "Học sinh", path: "/students" },
        ].map((tool) => (
          <NavLink key={tool.label} to={tool.path} className={navLinkClass}>
            <div className="nav-item-content">
              <span className="nav-icon">{tool.icon}</span>
              <span className="nav-label">{tool.label}</span>
            </div>
          </NavLink>
        ))}
      </div>
    </aside>
  );
}
