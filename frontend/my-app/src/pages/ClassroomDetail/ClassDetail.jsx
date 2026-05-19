import React, { useState, useEffect, useCallback, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Users,
  Calendar,
  ClipboardList,
  ArrowLeft,
  MoreVertical,
  LayoutGrid,
  Megaphone,
  Send,
  Copy,
  Clock,
  GraduationCap,
  Plus,
  X,
  Award,
  BookOpen,
} from "lucide-react";
import "./ClassDetail.scss";

import { AuthContext } from "../../contexts/AuthContext";

const ClassDetail = () => {
  const { id } = useParams();
  const { user, token } = useContext(AuthContext);
  const userRole = user?.role?.toLowerCase();

  const [classData, setClassData] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newPost, setNewPost] = useState("");
  const [isAsmModalOpen, setIsAsmModalOpen] = useState(false);
  const [asmData, setAsmData] = useState({
    title: "",
    description: "",
    dueDate: "",
    maxScore: 100,
  });

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const fetchData = useCallback(async () => {
    if (!token) return;
    try {
      const [classRes, announceRes] = await Promise.all([
        fetch(`http://localhost:5187/api/classroom/${id}`, { headers }),
        fetch(`http://localhost:5187/api/announcement/class/${id}`, {
          headers,
        }),
      ]);
      if (classRes.ok) setClassData(await classRes.json());
      if (announceRes.ok) setAnnouncements(await announceRes.json());
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [id, token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePostAnnouncement = async () => {
    if (!newPost.trim()) return;
    const res = await fetch(`http://localhost:5187/api/announcement`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        title: "Thông báo lớp",
        content: newPost,
        classroomId: id,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setAnnouncements([data, ...announcements]);
      setNewPost("");
    }
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    const res = await fetch(`http://localhost:5187/api/assignment`, {
      method: "POST",
      headers,
      body: JSON.stringify({ ...asmData, classroomId: id }),
    });
    if (res.ok) {
      setIsAsmModalOpen(false);
      setAsmData({ title: "", description: "", dueDate: "", maxScore: 100 });
      fetchData();
    }
  };

  if (loading)
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <span>Đang chuẩn bị lớp học...</span>
      </div>
    );
  if (!classData)
    return (
      <div className="error-state">Lớp học không tồn tại hoặc đã bị xóa.</div>
    );

  return (
    <div className="class-detail-container">
      {/* Header Navigation */}
      <header className="class-header-nav">
        <Link to="/home" className="back-btn">
          <ArrowLeft size={20} />
          <span>Quay lại</span>
        </Link>
        <div className="nav-title">{classData.name}</div>
        <div className="nav-actions">
          <button className="icon-btn">
            <Users size={20} />
          </button>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="class-hero-banner">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <div className="class-info">
            <span className="category-tag">EduPlatform • Education</span>
            <h1>{classData.name}</h1>
            <p className="description">
              {classData.description ||
                "Hào hứng cùng những kiến thức mới mỗi ngày."}
            </p>
          </div>
          <div className="hero-widgets">
            <div className="teacher-card">
              <div className="avatar-circle">
                {classData.teacherName?.charAt(0)}
              </div>
              <div className="info">
                <span className="label">Giảng viên</span>
                <span className="name">{classData.teacherName}</span>
              </div>
            </div>
            <div
              className="code-card"
              onClick={() => navigator.clipboard.writeText(classData.classCode)}
            >
              <div className="info">
                <span className="label">Mã lớp</span>
                <span className="code">{classData.classCode}</span>
              </div>
              <Copy size={18} className="copy-icon" />
            </div>
          </div>
        </div>
      </section>

      <main className="class-main-content">
        <div className="stream-layout">
          {/* Post Creation (Teacher Only) */}
          {userRole === "teacher" && (
            <div className="create-post-card">
              <div className="post-input-wrapper">
                <div className="user-avatar">
                  {classData.teacherName?.charAt(0)}
                </div>
                <textarea
                  placeholder="Thông báo nội dung mới cho lớp học..."
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                />
              </div>
              <div className="post-actions">
                <button
                  className="btn-secondary"
                  onClick={() => setIsAsmModalOpen(true)}
                >
                  <Plus size={18} /> Giao bài tập
                </button>
                <button
                  className={`btn-primary ${!newPost.trim() ? "disabled" : ""}`}
                  onClick={handlePostAnnouncement}
                >
                  <Send size={16} /> Đăng tin
                </button>
              </div>
            </div>
          )}

          <div className="feed-header">
            <LayoutGrid size={18} />
            <h2>Bảng tin lớp học</h2>
          </div>

          <div className="activity-feed">
            {/* Announcements */}
            {announcements.map((ann) => (
              <article key={ann.id} className="feed-card announcement">
                <div className="card-icon">
                  <Megaphone size={20} />
                </div>
                <div className="card-content">
                  <header>
                    <h3>{ann.title}</h3>
                    <time>
                      {new Date(ann.createdAt).toLocaleDateString("vi-VN")}
                    </time>
                  </header>
                  <p>{ann.content}</p>
                </div>
              </article>
            ))}

            {/* Assignments */}
            {classData.assignments?.map((asm) => (
              <article key={asm.id} className="feed-card assignment">
                <div className="card-icon">
                  <ClipboardList size={20} />
                </div>
                <div className="card-content">
                  <header>
                    <div className="title-group">
                      <h3>Bài tập: {asm.title}</h3>
                      <span className="status-pill">Mới</span>
                    </div>
                    <button className="more-btn">
                      <MoreVertical size={18} />
                    </button>
                  </header>
                  <div className="meta-info">
                    <span className="due-date">
                      <Clock size={14} />
                      Hạn nộp: {new Date(asm.dueDate).toLocaleString("vi-VN")}
                    </span>
                    <span className="score-badge">
                      <Award size={14} /> {asm.maxScore} điểm
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="class-sidebar">
          <div className="sidebar-widget stats-widget">
            <h3>Tổng quan</h3>
            <div className="stat-item">
              <Users size={18} />
              <span>{classData.studentCount} Học viên</span>
            </div>
            <div className="stat-item">
              <BookOpen size={18} />
              <span>{classData.assignments?.length || 0} Bài học</span>
            </div>
            <div className="stat-item">
              <Calendar size={18} />
              <span>3 buổi/tuần</span>
            </div>
          </div>

          <div className="sidebar-widget help-widget">
            <div className="illustration">🎓</div>
            <h4>Học tập hiệu quả</h4>
            <p>Đừng quên kiểm tra các bài tập sắp đến hạn nộp nhé!</p>
          </div>
        </aside>
      </main>

      {/* Modal Assignment */}
      {isAsmModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <header className="modal-header">
              <h2>Tạo bài tập mới</h2>
              <button
                className="close-btn"
                onClick={() => setIsAsmModalOpen(false)}
              >
                <X size={24} />
              </button>
            </header>
            <form onSubmit={handleCreateAssignment} className="modal-form">
              <div className="form-group">
                <label>Tiêu đề bài tập</label>
                <input
                  required
                  placeholder="Ví dụ: Bài tập về nhà Tuần 1"
                  value={asmData.title}
                  onChange={(e) =>
                    setAsmData({ ...asmData, title: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Hướng dẫn</label>
                <textarea
                  placeholder="Mô tả chi tiết yêu cầu..."
                  value={asmData.description}
                  onChange={(e) =>
                    setAsmData({ ...asmData, description: e.target.value })
                  }
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Ngày hết hạn</label>
                  <input
                    type="datetime-local"
                    required
                    value={asmData.dueDate}
                    onChange={(e) =>
                      setAsmData({ ...asmData, dueDate: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Điểm tối đa</label>
                  <input
                    type="number"
                    value={asmData.maxScore}
                    onChange={(e) =>
                      setAsmData({ ...asmData, maxScore: e.target.value })
                    }
                  />
                </div>
              </div>
              <footer className="modal-footer">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setIsAsmModalOpen(false)}
                >
                  Hủy bỏ
                </button>
                <button type="submit" className="btn-primary">
                  Tạo bài tập
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassDetail;
