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
import "./Home.scss";
import { API_BASE_URL } from "../../config/api";


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
    hour: "2-digit",
    minute: "2-digit",
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
  return `Hết hạn ${date.toLocaleDateString("vi-VN")}`;
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
  const [showAll, setShowAll] = useState(false);

  const isGlobalTeacher = user?.role === "Teacher";
  const userName = user?.Fullname || user?.fullname || "Người dùng";
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  // 1. Tải danh sách lớp
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/classroom/my`, { headers });
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

  // Khi có lớp → tải feed (announcement + assignment) + deadline
  useEffect(() => {
    if (!myClasses.length) return;

    const classIds = myClasses.map((c) => c.id).filter(Boolean);

    //Feed: gộp Announcement + Assignment
    const fetchFeed = async () => {
      setLoadingFeed(true);
      try {
        const [annResults, asgResults] = await Promise.all([
          Promise.all(
            classIds.map((id) =>
              fetch(`${API_BASE_URL}/announcement/class/${id}`, { headers })
                .then((r) => r.json())
                .then((data) =>
                  (Array.isArray(data) ? data : []).map((item) => ({
                    id: item.id,
                    type: "announcement",
                    className:
                      myClasses.find((c) => c.id === id)?.name || "Lớp học",
                    title: item.title,
                    preview: item.content,
                    createdAt: item.createdAt,
                  })),
                )
                .catch(() => []),
            ),
          ),
          // Tải tất cả bài tập
          Promise.all(
            classIds.map((id) =>
              fetch(`${API_BASE_URL}/assignment/class/${id}/upcoming`, { headers })
                .then((r) => r.json())
                .then((data) =>
                  (Array.isArray(data) ? data : []).map((item) => ({
                    id: item.id,
                    type: "assignment",
                    className:
                      myClasses.find((c) => c.id === id)?.name || "Lớp học",
                    title: item.title,
                    preview: item.description,
                    dueDate: item.dueDate,
                    createdAt: item.createdAt,
                  })),
                )
                .catch(() => []),
            ),
          ),
        ]);

        // Gộp 2 mảng, sắp xếp mới nhất lên đầu
        const merged = [...annResults.flat(), ...asgResults.flat()].sort(
          (a, b) => {
            const dateA = new Date(
              a.createdAt.endsWith("Z") ? a.createdAt : a.createdAt + "Z",
            );
            const dateB = new Date(
              b.createdAt.endsWith("Z") ? b.createdAt : b.createdAt + "Z",
            );
            return dateB - dateA;
          },
        );

        setFeedItems(merged);
      } finally {
        setLoadingFeed(false);
      }
    };

    //  Deadline
    const fetchDeadlines = async () => {
      setLoadingDead(true);
      try {
        const results = await Promise.all(
          classIds.map((id) =>
            fetch(`${API_BASE_URL}/assignment/class/${id}/upcoming`, { headers })
              .then((r) => r.json())
              .then((data) =>
                (Array.isArray(data) ? data : []).map((item) => ({
                  ...item,
                  className:
                    myClasses.find((c) => c.id === id)?.name || "Lớp học",
                })),
              )
              .catch(() => []),
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

  const visibleFeed = showAll ? feedItems : feedItems.slice(0, 4);

  return (
    <div className="modern-home">
      <main className="main-content">
        {/* Hero */}
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
          {/* Cột trái - Danh sách lớp */}
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

          {/* Cột phải */}
          <div className="right-column">
            {/* Widget: Thông báo (feed gộp) */}
            <section className="side-card">
              <div className="side-header">
                <h3>
                  <Bell size={18} /> Thông báo
                </h3>
                {feedItems.length > 4 && (
                  <Link to="/notifications" className="btn-text">
                    Xem tất cả
                  </Link>
                )}
              </div>

              <div className="side-scroll">
                {loadingFeed && (
                  <div className="activity-item">
                    <div className="dot blue"></div>
                    <div className="text">
                      <p>Đang tải thông báo...</p>
                    </div>
                  </div>
                )}

                {!loadingFeed && feedItems.length === 0 && (
                  <div className="activity-item">
                    <div className="dot"></div>
                    <div className="text">
                      <p>Chưa có thông báo nào.</p>
                    </div>
                  </div>
                )}

                {!loadingFeed &&
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
                          {item.type === "assignment" ? (
                            <span>
                              <FileText
                                size={12}
                                style={{
                                  marginRight: 3,
                                  verticalAlign: "middle",
                                }}
                              />
                              Bài tập mới: {item.title}
                            </span>
                          ) : (
                            <span>
                              <Megaphone
                                size={12}
                                style={{
                                  marginRight: 3,
                                  verticalAlign: "middle",
                                }}
                              />
                              {item.title}
                            </span>
                          )}
                        </p>

                        {item.preview && (
                          <p className="ann-preview">
                            {item.preview.length > 60
                              ? item.preview.slice(0, 60) + "..."
                              : item.preview}
                          </p>
                        )}

                        {item.type === "assignment" && item.dueDate && (
                          <p
                            className="ann-preview"
                            style={{ color: "#f59e0b" }}
                          >
                            <Clock
                              size={11}
                              style={{
                                marginRight: 3,
                                verticalAlign: "middle",
                              }}
                            />
                            {formatDeadline(item.dueDate)}
                          </p>
                        )}

                        <span>{timeAgo(item.createdAt)}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </section>

            <section className="side-card">
              <div className="side-header">
                <h3>
                  <Clock size={18} /> Sắp hết hạn
                </h3>
              </div>

              <div className="side-scroll">
                {loadingDead && (
                  <div className="deadline-box">
                    <Calendar size={20} />
                    <div className="info">
                      <h4>Đang tải...</h4>
                    </div>
                  </div>
                )}

                {!loadingDead && deadlines.length === 0 && (
                  <div className="deadline-box">
                    <Calendar size={20} />
                    <div className="info">
                      <h4>Không có bài tập sắp hết hạn</h4>
                    </div>
                  </div>
                )}

                {!loadingDead &&
                  deadlines.map((d) => (
                    <div
                      key={d.id}
                      className={`deadline-box ${deadlineUrgency(d.dueDate)}`}
                    >
                      {deadlineUrgency(d.dueDate) === "urgent" ? (
                        <AlertCircle size={20} />
                      ) : (
                        <Calendar size={20} />
                      )}
                      <div className="info">
                        <h4>{d.title}</h4>
                        <p className="deadline-class">{d.className}</p>
                        <p>{formatDeadline(d.dueDate)}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
