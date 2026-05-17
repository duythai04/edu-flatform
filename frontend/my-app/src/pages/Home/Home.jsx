import React from "react";
import {
  Plus,
  Users,
  FileText,
  BarChart3,
  Clock,
  MoreVertical,
  MessageSquare,
  ClipboardList,
} from "lucide-react";
import { Link } from "react-router-dom";
import "./Home.scss";

const Home = () => {
  const stats = [
    { label: "Lớp đang dạy", value: "3", color: "blue" },
    { label: "Học sinh", value: "84", sub: "+5 tuần này", color: "green" },
    { label: "Bài chờ chấm", value: "3", sub: "Cần xử lý", color: "orange" },
    { label: "Điểm TB chung", value: "7.8", color: "purple" },
  ];

  const activities = [
    {
      id: 1,
      user: "Lê Thị Thu",
      action: 'nộp bài "Bài tập tích phân"',
      class: "Toán giải tích 12",
      time: "10 phút trước",
      type: "submit",
    },
    {
      id: 2,
      user: "Nguyễn Văn Bình",
      action: "đặt câu hỏi trong lớp",
      class: "Vật lý nâng cao",
      time: "25 phút trước",
      type: "question",
    },
    {
      id: 3,
      user: "Trần Quốc Anh",
      action: "nộp bài tập muộn",
      class: "Hóa hữu cơ",
      time: "1 giờ trước",
      status: "Cần chú ý",
      type: "late",
    },
    {
      id: 4,
      user: "5 học sinh mới",
      action: "tham gia lớp Vật lý",
      class: "Vật lý nâng cao",
      time: "2 giờ trước",
      type: "new",
    },
  ];

  const myClasses = [
    {
      id: 1,
      name: "Toán giải tích 12",
      code: "TOAN12A",
      students: 34,
      assignments: 8,
      posts: 12,
      color: "#7c3aed",
      status: "Đang học",
      update: "10p trước",
    },
    {
      id: 2,
      name: "Vật lý nâng cao",
      code: "VATLY11",
      students: 28,
      assignments: 5,
      posts: 0,
      color: "#0d9488",
      status: "Đang học",
      update: "25p trước",
    },
  ];

  return (
    <div className="home-container">
      {/* HEADER */}
      <header className="home-header">
        <div className="welcome-text">
          <h1>Xin chào, Thầy Nguyễn Minh Khoa</h1>
          <p>Bạn có 3 bài cần chấm điểm hôm nay</p>
        </div>
        <Link to="/create-class" className="btn-primary-outline">
          <Plus size={18} />
          <span>Tạo lớp học mới</span>
        </Link>
      </header>

      {/* STATS GRID */}
      <div className="stats-grid">
        {stats.map((stat, i) => (
          <div key={i} className="stat-card">
            <span className="stat-value">{stat.value}</span>
            <span className="stat-label">{stat.label}</span>
            {stat.sub && <span className="stat-sub">{stat.sub}</span>}
          </div>
        ))}
      </div>

      <div className="home-content-layout">
        {/* LEFT COLUMN */}
        <div className="content-column-left">
          {/* HOẠT ĐỘNG GẦN ĐÂY */}
          <section className="card-section">
            <div className="section-header">
              <h2>Hoạt động gần đây</h2>
              <button className="text-link">Xem tất cả</button>
            </div>
            <div className="activity-list">
              {activities.map((act) => (
                <div key={act.id} className={`activity-item ${act.type}`}>
                  <div className="activity-dot"></div>
                  <div className="activity-info">
                    <p>
                      <strong>{act.user}</strong> {act.action}
                    </p>
                    <span>
                      {act.class} · {act.time}{" "}
                      {act.status && (
                        <strong className="warning">· {act.status}</strong>
                      )}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* BÀI TẬP SẮP ĐẾN HẠN */}
          <section className="card-section">
            <div className="section-header">
              <h2>Bài tập sắp đến hạn</h2>
            </div>
            <div className="deadline-list">
              <div className="deadline-card urgent">
                <div className="deadline-icon">
                  <Clock size={20} />
                </div>
                <div className="deadline-info">
                  <h3>Kiểm tra chương 3 — Toán GT 12</h3>
                  <div className="deadline-meta">
                    <span className="tag-urgent">Hôm nay</span>
                    <p>Hạn nộp: Hôm nay 23:59 · 28/34 đã nộp</p>
                  </div>
                </div>
              </div>

              <div className="deadline-card normal">
                <div className="deadline-icon">
                  <FileText size={20} />
                </div>
                <div className="deadline-info">
                  <h3>Bài tập dao động cơ học — Vật lý</h3>
                  <div className="deadline-meta">
                    <span className="tag-normal">2 ngày nữa</span>
                    <p>Hạn nộp: 20/05 · 15/28 đã nộp</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN */}
        <div className="content-column-right">
          <section className="card-section">
            <div className="section-header">
              <h2>Lớp học của tôi</h2>
              <button className="text-link">+ Tạo lớp</button>
            </div>
            <div className="class-cards-list">
              {myClasses.map((cls) => (
                <div key={cls.id} className="class-summary-card">
                  <div
                    className="class-card-top"
                    style={{ backgroundColor: cls.color }}
                  >
                    <span className="class-code-badge">MÃ: {cls.code}</span>
                    <div className="class-avatar">{cls.name.charAt(0)}</div>
                    <div className="class-title">
                      <h3>{cls.name}</h3>
                      <p>{cls.students} học sinh</p>
                    </div>
                  </div>
                  <div className="class-card-bottom">
                    <div className="class-stats">
                      <span>
                        <Users size={14} /> {cls.students} HS
                      </span>
                      <span>
                        <ClipboardList size={14} /> {cls.assignments} bài
                      </span>
                      <span>
                        <MessageSquare size={14} /> {cls.posts} đăng
                      </span>
                    </div>
                    <div className="class-footer">
                      <span className="status-tag">Đang học</span>
                      <span className="update-time">Cập nhật {cls.update}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Home;
