import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Users,
  Calendar,
  ClipboardList,
  ArrowLeft,
  GraduationCap,
  Clock,
  Copy,
  MoreVertical,
  LayoutGrid,
} from "lucide-react";
import "./ClassroomDetail.scss";

const ClassDetail = () => {
  const { id } = useParams();
  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:5187/api/classroom/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setClassData(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  if (loading)
    return (
      <div className="loading-screen">
        <span>Đang tải không gian học tập...</span>
      </div>
    );
  if (!classData)
    return <div className="error-screen">Không tìm thấy lớp học.</div>;

  return (
    <div className="modern-class-detail">
      {/* Nút quay lại bay lơ lửng */}
      <Link to="/home" className="floating-back">
        <ArrowLeft size={20} />
      </Link>

      {/* Hero Banner Section */}
      <section className="class-hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <div className="badge">Lớp học trực tuyến</div>
          <h1>{classData.name}</h1>
          <p>
            {classData.description ||
              "Hành trình chinh phục tri thức cùng EduPlatform."}
          </p>

          <div className="hero-footer">
            <div className="teacher-pill">
              <div className="avatar">{classData.teacherName?.charAt(0)}</div>
              <span>{classData.teacherName}</span>
            </div>
            <div className="code-pill">
              Mã lớp: <strong>{classData.classCode}</strong>
              <Copy size={14} className="copy-icon" />
            </div>
          </div>
        </div>
      </section>

      <div className="main-layout">
        {/* Cột trái: Luồng hoạt động & Bài tập */}
        <div className="stream-column">
          <div className="section-header">
            <div className="title">
              <LayoutGrid size={20} />
              <h2>Bảng tin học tập</h2>
            </div>
            <button className="btn-filter">Mới nhất</button>
          </div>

          <div className="assignment-feed">
            {classData.assignments?.length > 0 ? (
              classData.assignments.map((asm) => (
                <div key={asm.id} className="modern-asm-card">
                  <div className="asm-type-icon">
                    <ClipboardList size={22} />
                  </div>
                  <div className="asm-body">
                    <div className="asm-header">
                      <h4>{asm.title}</h4>
                      <MoreVertical size={16} className="more-btn" />
                    </div>
                    <div className="asm-meta">
                      <span className="due-date">
                        <Calendar size={14} /> Hạn nộp:{" "}
                        {new Date(asm.dueDate).toLocaleDateString("vi-VN")}
                      </span>
                      <span className="status">Chưa nộp</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-data">Lớp học hiện chưa có bài tập nào.</div>
            )}
          </div>
        </div>

        {/* Cột phải: Thông tin bổ trợ */}
        <aside className="sidebar-column">
          <div className="side-widget stats-widget">
            <h3>Tổng quan</h3>
            <div className="stat-row">
              <div className="stat-item">
                <Users size={18} />
                <span>{classData.studentCount} Học viên</span>
              </div>
              <div className="stat-item">
                <Clock size={18} />
                <span>Hoạt động</span>
              </div>
            </div>
          </div>

          <div className="side-widget intro-widget">
            <h3>Giới thiệu</h3>
            <p>
              Chào mừng bạn đến với lớp {classData.name}. Hãy kiểm tra bảng tin
              thường xuyên để cập nhật bài tập mới nhất.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default ClassDetail;
