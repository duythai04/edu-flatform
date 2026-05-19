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
  Calendar,
  ArrowRight,
  BookOpen,
  Bell,
} from "lucide-react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import "./Home.scss";

const Home = () => {
  const { user } = useContext(AuthContext);
  const [myClasses, setMyClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  const isGlobalTeacher = user?.role === "Teacher";
  const userName = user?.Fullname || user?.fullname || "Người dùng";

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5187/api/classroom/my", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setMyClasses(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, []);

  return (
    <div className="modern-home">
      {/* Sidebar Layout Style Container */}
      <main className="main-content">
        {/* Top Banner / Hero Section */}
        <section className="hero-section">
          <div className="hero-content">
            <span className="date-badge">
              {new Date().toLocaleDateString("vi-VN", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </span>
            <h1>Chào buổi sáng, {userName}! </h1>
            <p>
              {isGlobalTeacher
                ? "Hệ thống đã sẵn sàng. Bạn có 3 tiết dạy trong hôm nay."
                : "Tiếp tục hành trình học tập của bạn. Bạn có bài tập cần hoàn thành!"}
            </p>
          </div>
          <div className="hero-actions">
            {isGlobalTeacher ? (
              <Link to="/create-class" className="btn-glass">
                <Plus size={20} /> <span>Tạo lớp học</span>
              </Link>
            ) : (
              <Link to="/join-class" className="btn-glass">
                <LogIn size={20} /> <span>Tham gia lớp</span>
              </Link>
            )}
          </div>
        </section>

        <div className="dashboard-grid">
          {/* CỘT TRÁI - DANH SÁCH LỚP HỌC */}
          <div className="left-column">
            <div className="section-header">
              <div className="title-group">
                <BookOpen size={20} className="icon-blue" />
                <h2>Lớp học của tôi</h2>
              </div>
              <span className="count-badge">{myClasses.length} lớp</span>
            </div>

            <div className="scrollable-grid">
              {loading ? (
                <div className="skeleton-loader">Đang tải lớp học...</div>
              ) : myClasses.length === 0 ? (
                <div className="empty-card">
                  <p>Chưa có dữ liệu lớp học.</p>
                </div>
              ) : (
                myClasses.map((cls, index) => (
                  <div key={cls.id || index} className="modern-class-card">
                    <div
                      className="card-banner"
                      style={{
                        background: `linear-gradient(135deg, ${getBannerColor(index)}, ${getBannerColor(index + 1)})`,
                      }}
                    >
                      <span className="class-code">{cls.classCode}</span>
                      <div className="role-tag">
                        {cls.role === "Teacher" ? (
                          <GraduationCap size={14} />
                        ) : (
                          <UserCheck size={14} />
                        )}
                        {cls.role === "Teacher" ? "Giáo viên" : "Học sinh"}
                      </div>
                    </div>
                    <div className="card-body">
                      <h3>{cls.name}</h3>
                      <p>
                        {cls.description ||
                          "Khám phá kiến thức mới mỗi ngày..."}
                      </p>
                      <div className="card-footer">
                        <div className="meta">
                          <span>
                            <Users size={14} /> 0
                          </span>
                          <span>
                            <ClipboardList size={14} /> 0
                          </span>
                        </div>
                        <Link
                          to={`/class/${cls.id}`}
                          className="btn-enter-arrow"
                        >
                          Vào lớp <ArrowRight size={16} />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* CỘT PHẢI - TIN TỨC & DEADLINE */}
          <div className="right-column">
            <section className="side-card">
              <div className="side-header">
                <h3>
                  <Bell size={18} /> Thông báo
                </h3>
                <button className="btn-text">Xem tất cả</button>
              </div>
              <div className="side-scroll">
                <div className="activity-item">
                  <div className="dot blue"></div>
                  <div className="text">
                    <p>
                      <strong>Toán học 12</strong>: Bài tập mới đã được đăng.
                    </p>
                    <span>2 giờ trước</span>
                  </div>
                </div>
                {/* Thêm nhiều activity-item ở đây */}
              </div>
            </section>

            <section className="side-card">
              <div className="side-header">
                <h3>
                  <Clock size={18} /> Sắp hết hạn
                </h3>
              </div>
              <div className="side-scroll">
                <div className="deadline-box urgent">
                  <Calendar size={20} />
                  <div className="info">
                    <h4>Kiểm tra giữa kỳ Lý</h4>
                    <p>Hết hạn lúc 23:59 hôm nay</p>
                  </div>
                </div>
                {/* Thêm nhiều deadline-box ở đây */}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

const getBannerColor = (index) => {
  const colors = [
    "#4f46e5",
    "#0ea5e9",
    "#10b981",
    "#f59e0b",
    "#8b5cf6",
    "#ec4899",
  ];
  return colors[index % colors.length];
};

export default Home;
