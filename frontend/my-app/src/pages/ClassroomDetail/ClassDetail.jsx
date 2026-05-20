import React, { useState, useEffect, useCallback, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Users,
  Calendar,
  ClipboardList,
  ArrowLeft,
  MoreVertical,
  Megaphone,
  Send,
  Copy,
  Clock,
  Plus,
  X,
  Award,
  BookOpen,
  Layout,
} from "lucide-react";
import "./ClassDetail.scss";
import CreateAssignmentModal from "../CreateAssignmentModal/CreateAssignmentModal";

import { AuthContext } from "../../contexts/AuthContext";

const ClassDetail = () => {
  const { id } = useParams();
  const { user, token } = useContext(AuthContext);
  const userRole = user?.role?.toLowerCase();

  const [classData, setClassData] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newPost, setNewPost] = useState("");
  const [activeTab, setActiveTab] = useState("stream");
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
      <div className="edu-loading">
        <div className="edu-spinner"></div>
      </div>
    );

  if (!classData)
    return <div className="edu-error">Không tìm thấy lớp học.</div>;

  return (
    <div className="edu-layout">
      {/* NÚT QUAY LẠI LƠ LỬNG BÊN TRÁI */}
      <Link to="/home" className="floating-back-btn" title="Quay lại">
        <ArrowLeft size={22} />
        <span>Quay lại</span>
      </Link>

      <main className="edu-main-container">
        <section className="edu-hero-card">
          <div className="hero-inner">
            <div className="hero-text">
              <span className="hero-badge">Mã lớp: {classData.classCode}</span>
              <h1>{classData.name}</h1>
              <p>
                {classData.description || "Chào mừng bạn đến với khóa học."}
              </p>
            </div>
            <button
              className="btn-copy-code"
              onClick={() => navigator.clipboard.writeText(classData.classCode)}
            >
              <Copy size={18} />
              <span>{classData.classCode}</span>
            </button>
          </div>
        </section>

        <div className="edu-content-grid">
          <aside className="edu-sidebar">
            <div className="sidebar-card menu-card">
              <button
                className={`menu-item ${activeTab === "stream" ? "active" : ""}`}
                onClick={() => setActiveTab("stream")}
              >
                <Layout size={18} />
                <span>Bảng tin</span>
              </button>
              <button
                className={`menu-item ${activeTab === "docs" ? "active" : ""}`}
                onClick={() => setActiveTab("docs")}
              >
                <BookOpen size={18} />
                <span>Tài liệu</span>
              </button>
              <button
                className={`menu-item ${activeTab === "members" ? "active" : ""}`}
                onClick={() => setActiveTab("members")}
              >
                <Users size={18} />
                <span>Thành viên</span>
              </button>
            </div>

            <div className="sidebar-card upcoming-card">
              <h3>Sắp đến hạn</h3>
              <p className="no-data">Không có bài tập nào sắp đến hạn.</p>
              <Link to="#" className="view-link">
                Xem tất cả
              </Link>
            </div>

            <div className="sidebar-card stats-card">
              <div className="stat-line">
                <Users size={18} className="icon-blue" />
                <span>{classData.studentCount} Học viên</span>
              </div>
              <div className="stat-line">
                <BookOpen size={18} className="icon-purple" />
                <span>{classData.assignments?.length || 0} Bài học</span>
              </div>
            </div>
          </aside>

          <section className="edu-stream">
            {userRole === "teacher" && (
              <div className="edu-composer">
                <div className="composer-top">
                  <div className="avatar-circle">
                    {classData.teacherName?.charAt(0)}
                  </div>
                  <textarea
                    placeholder="Thông báo nội dung mới cho lớp học..."
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                  />
                </div>
                {newPost.trim() && (
                  <div className="composer-bottom">
                    <button
                      className="btn-secondary"
                      onClick={() => setIsAsmModalOpen(true)}
                    >
                      <Plus size={18} /> Giao bài tập
                    </button>
                    <div className="btn-group">
                      <button
                        className="btn-ghost"
                        onClick={() => setNewPost("")}
                      >
                        Hủy
                      </button>
                      <button
                        className="btn-primary"
                        onClick={handlePostAnnouncement}
                      >
                        Đăng tin
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="edu-feed-list">
              {announcements.map((ann) => (
                <article key={ann.id} className="feed-card announcement">
                  <div className="card-icon">
                    <Megaphone size={20} />
                  </div>
                  <div className="card-content">
                    <header>
                      <div className="info">
                        <span className="author">{classData.teacherName}</span>
                        <span className="date">
                          {new Date(ann.createdAt).toLocaleDateString("vi-VN")}
                        </span>
                      </div>
                      <MoreVertical size={16} className="opt-btn" />
                    </header>
                    <p>{ann.content}</p>
                  </div>
                </article>
              ))}

              {classData.assignments?.map((asm) => (
                <Link
                  key={asm.id}
                  to={`/assignment/${asm.id}`}
                  className="feed-card-link" 
                  style={{ textDecoration: "none" }}
                >
                  <article className="feed-card assignment">
                    <div className="card-icon">
                      <ClipboardList size={20} />
                    </div>
                    <div className="card-content">
                      <header>
                        <div className="info">
                          <span className="author">
                            {classData.teacherName} đã đăng bài mới
                          </span>
                          <span className="date">
                            {new Date(asm.dueDate).toLocaleDateString("vi-VN")}
                          </span>
                        </div>
          
                        <div className="opt-btn-wrap">
                          <MoreVertical size={16} className="opt-btn" />
                        </div>
                      </header>
                      <div className="body">
                        <h4>{asm.title}</h4>
                        <div className="meta-footer">
                          <span className="due">
                            <Clock size={14} /> Hạn chót:{" "}
                            {new Date(asm.dueDate).toLocaleDateString("vi-VN")}
                          </span>
                          <span className="points">
                            <Award size={14} /> {asm.maxScore} điểm
                          </span>
                        </div>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* Modal tạo bài tập */}
      <div>
        <CreateAssignmentModal
          isOpen={isAsmModalOpen}
          onClose={() => setIsAsmModalOpen(false)}
          classroomId={id}
          onRefresh={fetchData}
        />
      </div>
    </div>
  );
};

export default ClassDetail;
