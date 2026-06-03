import React, { useContext, useState, useEffect } from "react";
import {
  Plus,
  Users,
  Clock,
  ClipboardList,
  UserCheck,
  GraduationCap,
  LogIn,
  Calendar,
  ArrowRight,
  BookOpen,
  Bell,
  AlertCircle,
  FileText,
  Megaphone,
} from "lucide-react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import { API_BASE_URL } from "../../config/api";
import { safeFetch } from "../../config/fetchHelper";
import "./Home.scss";

// ── Helpers ───────────────────────────────────────────────────────────────────

const getBannerColor = (index) => {
  const colors = [
    "#1a73e8", // Blue
    "#0d9488", // Teal
    "#7c3aed", // Purple
    "#ea580c", // Orange
    "#db2777", // Pink
    "#16a34a", // Green
  ];
  return colors[index % colors.length];
};

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const normalized = dateStr.endsWith("Z") ? dateStr : dateStr + "Z";
  const date = new Date(normalized);
  const seconds = Math.floor((Date.now() - date) / 1000);
  if (seconds < 5) return "Vừa xong";
  if (seconds < 60) return `${seconds} giây trước`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)} phút trước`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} giờ trước`;
  if (seconds < 86400 * 2)
    return (
      "Hôm qua, " +
      date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
    );
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatDeadline(dateStr) {
  const date = new Date(dateStr);
  const hours = (date - new Date()) / 3600000;
  if (hours < 0) return "Đã hết hạn";
  if (hours < 1) return "Hết hạn trong ít phút";
  if (hours < 24)
    return `Hết hạn lúc ${date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} hôm nay`;
  if (hours < 48)
    return `Hết hạn lúc ${date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} ngày mai`;
  return `Hạn: ${date.toLocaleDateString("vi-VN")}`;
}

function deadlineUrgency(dateStr) {
  const hours = (new Date(dateStr) - new Date()) / 3600000;
  if (hours < 0) return "expired";
  if (hours < 24) return "urgent";
  if (hours < 72) return "soon";
  return "normal";
}

const Home = () => {
  const { user } = useContext(AuthContext);
  const [myClasses, setMyClasses] = useState([]);
  const [feedItems, setFeedItems] = useState([]);
  const [deadlines, setDeadlines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingFeed, setLoadingFeed] = useState(false);
  const [loadingDead, setLoadingDead] = useState(false);

  const isGlobalTeacher = user?.role === "Teacher";
  const userName = user?.Fullname || user?.fullname || "Người dùng";
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  // 1. Tải danh sách lớp
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const { ok, data } = await safeFetch(
          `${API_BASE_URL}/api/classroom/my`,
          { headers },
        );
        setMyClasses(ok && Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, []);

  // 2. Khi có lớp → tải feed + deadline
  useEffect(() => {
    if (!myClasses.length) return;
    const classIds = myClasses.map((c) => c.id).filter(Boolean);

    const fetchFeed = async () => {
      setLoadingFeed(true);
      try {
        const [annResults, asgResults] = await Promise.all([
          Promise.all(
            classIds.map((id) =>
              safeFetch(`${API_BASE_URL}/api/announcement/class/${id}`, {
                headers,
              }).then(({ ok, data }) =>
                (ok && Array.isArray(data) ? data : []).map((item) => ({
                  id: item.id,
                  type: "announcement",
                  className:
                    myClasses.find((c) => c.id === id)?.name || "Lớp học",
                  title: item.title,
                  preview: item.content,
                  createdAt: item.createdAt,
                })),
              ),
            ),
          ),
          Promise.all(
            classIds.map((id) =>
              safeFetch(`${API_BASE_URL}/api/assignment/class/${id}/upcoming`, {
                headers,
              }).then(({ ok, data }) =>
                (ok && Array.isArray(data) ? data : []).map((item) => ({
                  id: item.id,
                  type: "assignment",
                  className:
                    myClasses.find((c) => c.id === id)?.name || "Lớp học",
                  title: item.title,
                  preview: item.description,
                  dueDate: item.dueDate,
                  createdAt: item.createdAt,
                })),
              ),
            ),
          ),
        ]);

        const merged = [...annResults.flat(), ...asgResults.flat()].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
        );
        setFeedItems(merged);
      } finally {
        setLoadingFeed(false);
      }
    };

    const fetchDeadlines = async () => {
      setLoadingDead(true);
      try {
        const results = await Promise.all(
          classIds.map((id) =>
            safeFetch(`${API_BASE_URL}/api/assignment/class/${id}/upcoming`, {
              headers,
            }).then(({ ok, data }) =>
              (ok && Array.isArray(data) ? data : []).map((item) => ({
                ...item,
                className:
                  myClasses.find((c) => c.id === id)?.name || "Lớp học",
              })),
            ),
          ),
        );
        const upcoming = results
          .flat()
          .filter((a) => a.dueDate && new Date(a.dueDate) > new Date())
          .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
          .slice(0, 5);
        setDeadlines(upcoming);
      } finally {
        setLoadingDead(false);
      }
    };

    fetchFeed();
    fetchDeadlines();
  }, [myClasses]);

  const visibleFeed = feedItems.slice(0, 4);

  return (
    <div className="modern-home">
      <main className="main-content">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-content">
            <span className="date-badge">
              {new Date().toLocaleDateString("vi-VN", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </span>
            <h1>Chào buổi sáng, {userName}!</h1>
            <p>
              {isGlobalTeacher
                ? "Hệ thống đã sẵn sàng. Bạn có thể quản lý các lớp học và bài tập của mình tại đây."
                : "Tiếp tục hành trình học tập của bạn. Đừng quên kiểm tra các bài tập sắp tới!"}
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
          {/* Cột trái - Lớp học */}
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
                <div className="skeleton-loader">
                  Đang tải danh sách lớp học...
                </div>
              ) : myClasses.length === 0 ? (
                <div className="empty-card">
                  <p>Bạn chưa tham gia lớp học nào.</p>
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
                          "Khám phá kiến thức mới mỗi ngày cùng lớp học này..."}
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

          {/* Cột phải - Widgets */}
          <div className="right-column">
            {/* Widget Thông báo */}
            <section className="side-card">
              <div className="side-header">
                <h3>
                  <Bell size={18} /> Thông báo mới
                </h3>
                {feedItems.length > 4 && (
                  <Link to="/notifications" className="btn-text">
                    Xem tất cả
                  </Link>
                )}
              </div>

              <div className="side-scroll">
                {loadingFeed ? (
                  <div className="activity-item">
                    <div className="text">
                      <p>Đang tải...</p>
                    </div>
                  </div>
                ) : visibleFeed.length === 0 ? (
                  <div className="activity-item">
                    <div className="text">
                      <p>Chưa có thông báo.</p>
                    </div>
                  </div>
                ) : (
                  visibleFeed.map((item) => (
                    <div
                      key={`${item.type}-${item.id}`}
                      className="activity-item"
                    >
                      <div
                        className={`dot ${item.type === "assignment" ? "orange" : "blue"}`}
                      ></div>
                      <div className="text">
                        <p>
                          <strong>{item.className}</strong>:{" "}
                          {item.type === "assignment"
                            ? "Bài tập mới"
                            : item.title}
                        </p>
                        <p className="ann-preview">{item.preview}</p>
                        <span>{timeAgo(item.createdAt)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* Widget Deadline */}
            <section className="side-card">
              <div className="side-header">
                <h3>
                  <Clock size={18} /> Sắp hết hạn
                </h3>
              </div>
              <div className="side-scroll">
                {loadingDead ? (
                  <p className="empty-msg">Đang tải...</p>
                ) : deadlines.length === 0 ? (
                  <div className="deadline-box">
                    <div className="info">
                      <h4>Tuyệt vời! Không có bài tập nào sắp đến hạn.</h4>
                    </div>
                  </div>
                ) : (
                  deadlines.map((d) => (
                    <div
                      key={d.id}
                      className={`deadline-box ${deadlineUrgency(d.dueDate)}`}
                    >
                      {deadlineUrgency(d.dueDate) === "urgent" ? (
                        <AlertCircle size={18} />
                      ) : (
                        <Calendar size={18} />
                      )}
                      <div className="info">
                        <h4>{d.title}</h4>
                        <p className="deadline-class">{d.className}</p>
                        <p>{formatDeadline(d.dueDate)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
