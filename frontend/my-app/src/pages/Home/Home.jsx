import React, { useContext, useState, useEffect } from "react";
import {
  Plus,
  Users,
  Clock,
  ClipboardList,
  UserCheck,
  MoreVertical,
  GraduationCap,
  LogIn,
  FileText,
  MessageSquare,
  AlertCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";

import "./Home.scss";

const Home = () => {
  const { user } = useContext(AuthContext);
  console.log("Thông tin user hiện tại:", user);
  const [myClasses, setMyClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Giả định Role global từ AuthContext: 1 là Giáo viên, 2 là Học sinh (hoặc dùng string)
  // Bạn hãy điều chỉnh user.Role theo đúng logic Backend của bạn
  const isGlobalTeacher = user?.Role === "Teacher" || user?.role === "Teacher";

  const getBannerColor = (index) => {
    const colors = [
      "#4f46e5",
      "#0891b2",
      "#059669",
      "#d97706",
      "#7c3aed",
      "#db2777",
    ];
    return colors[index % colors.length];
  };

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Vui lòng đăng nhập để tiếp tục.");
          return;
        }

        const res = await fetch("http://localhost:5187/api/classroom/my", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Không thể tải danh sách lớp học.");
        const data = await res.json();
        setMyClasses(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, []);

  // --- LOGIC PHÂN QUYỀN CHO STATS ---
  const stats = isGlobalTeacher
    ? [
        {
          label: "Tổng số lớp dạy",
          value: myClasses.length,
          sub: "Đang quản lý",
        },
        { label: "Bài tập cần chấm", value: "12", sub: "Trên tất cả lớp" },
        { label: "Học sinh hoạt động", value: "150+", sub: "Tuần này" },
        { label: "Yêu cầu tham gia", value: "5", sub: "Chưa duyệt" },
      ]
    : [
        {
          label: "Lớp đang học",
          value: myClasses.length,
          sub: "Đang tham gia",
        },
        { label: "Bài tập cần nộp", value: "3", sub: "Hạn trong tuần" },
        { label: "Điểm trung bình", value: "8.5", sub: "Học kỳ này" },
        { label: "Tài liệu mới", value: "10+", sub: "Chưa xem" },
      ];

  const userName = user?.Fullname || user?.fullname || "Người dùng";

  return (
    <div className="home-container">
      {/* HEADER: Thay đổi nút dựa trên quyền */}
      <header className="home-header">
        <div className="welcome-text">
          <h1>
            Xin chào, {isGlobalTeacher ? "Thầy/Cô" : "Bạn"} {userName}
          </h1>
          <p>
            {isGlobalTeacher
              ? "Hôm nay bạn có lịch dạy 3 tiết và 12 bài tập cần chấm."
              : "Bạn có 2 bài tập sắp đến hạn nộp. Hãy kiểm tra nhé!"}
          </p>
        </div>
        <div className="header-actions">
          {isGlobalTeacher ? (
            <Link to="/create-class" className="btn-primary-outline">
              <Plus size={18} />
              <span>Tạo lớp học mới</span>
            </Link>
          ) : (
            <Link to="/join-class" className="btn-primary-outline">
              <LogIn size={18} />
              <span>Tham gia lớp học</span>
            </Link>
          )}
        </div>
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
        {/* LEFT COLUMN: Hiển thị nội dung dựa trên quyền */}
        <div className="content-column-left">
          <section className="card-section">
            <div className="section-header">
              <h2>
                {isGlobalTeacher ? "Hoạt động của học sinh" : "Thông báo mới"}
              </h2>
              <button className="text-link">Xem tất cả</button>
            </div>
            {/* Logic render activity list ở đây (như code cũ của bạn) */}
          </section>

          <section className="card-section">
            <div className="section-header">
              <h2>{isGlobalTeacher ? "Bài tập cần chấm" : "Lịch nộp bài"}</h2>
            </div>
            <div className="deadline-list">
              {/* Hiển thị danh sách deadline ưu tiên */}
              <div className="deadline-card urgent">
                <div className="deadline-icon">
                  <Clock size={20} />
                </div>
                <div className="deadline-info">
                  <h3>
                    {isGlobalTeacher
                      ? "Chấm bài: Kiểm tra Lý 10"
                      : "Nộp bài: Toán GT 12"}
                  </h3>
                  <div className="deadline-meta">
                    <span className="tag-urgent">Hôm nay</span>
                    <p>
                      {isGlobalTeacher ? "25/40 đã nộp" : "Hạn cuối: 23:59"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: Lớp học của tôi */}
        <div className="content-column-right">
          <section className="card-section">
            <div className="section-header">
              <h2>Lớp học của tôi</h2>
            </div>

            {loading ? (
              <p>Đang tải...</p>
            ) : myClasses.length === 0 ? (
              <div className="empty-state">
                <p>Bạn chưa tham gia lớp học nào.</p>
                {isGlobalTeacher ? (
                  <Link to="/create-class">Tạo lớp ngay</Link>
                ) : (
                  <Link to="/join-class">Nhập mã tham gia</Link>
                )}
              </div>
            ) : (
              <div className="class-cards-list">
                {myClasses.map((cls, index) => {
                  const roleInClass = cls.Role || cls.role; // Lấy role cụ thể trong lớp này
                  const isTeacherInClass = roleInClass === "Teacher";

                  return (
                    <div
                      key={cls.Id || cls.id || index}
                      className="class-summary-card"
                    >
                      <div
                        className="class-card-top"
                        style={{ backgroundColor: getBannerColor(index) }}
                      >
                        <div className="class-card-header-meta">
                          <span className="class-code-badge">
                            MÃ: {cls.ClassCode || cls.classCode}
                          </span>
                          {/* Badge hiển thị vai trò trong lớp */}
                          <span
                            className={`role-badge ${isTeacherInClass ? "teacher" : "member"}`}
                          >
                            {isTeacherInClass ? (
                              <GraduationCap size={12} />
                            ) : (
                              <UserCheck size={12} />
                            )}
                            {isTeacherInClass ? "Giáo viên" : "Học sinh"}
                          </span>
                        </div>

                        <div className="class-avatar">
                          {(cls.Name || cls.name || "L")
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div className="class-title">
                          <h3>{cls.Name || cls.name}</h3>
                          <p className="class-description-text">
                            {cls.Description ||
                              cls.description ||
                              "Không có mô tả"}
                          </p>
                        </div>
                      </div>

                      <div className="class-card-bottom">
                        <div className="class-stats">
                          <span>
                            <Users size={14} /> 0 HS
                          </span>
                          <span>
                            <ClipboardList size={14} /> 0 bài
                          </span>
                        </div>

                        {/* CHỨC NĂNG RIÊNG TRÊN CARD */}
                        <div className="class-card-actions">
                          <Link
                            to={`/class/${cls.Id || cls.id}`}
                            className="btn-enter"
                          >
                            Vào lớp
                          </Link>
                          {isTeacherInClass && (
                            <button
                              className="btn-icon-only"
                              title="Cài đặt lớp"
                            >
                              <MoreVertical size={18} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default Home;
