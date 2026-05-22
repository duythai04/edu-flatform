import React, { useState, useEffect, useContext, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FileText,
  Paperclip,
  Send,
  ChevronLeft,
  MoreVertical,
  ExternalLink,
  Loader2,
  AlertCircle,
  MoreHorizontal,
  UploadCloud,
  X,
  CheckCircle2,
  Clock,
  RefreshCcw,
  Users,
} from "lucide-react";
import "./AssignmentDetail.scss";
import { AuthContext } from "../../contexts/AuthContext";

// Cấu hình URL cơ sở để dễ quản lý và sửa lỗi Port
const API_BASE_URL = "http://localhost:5187";

const formatFileSize = (bytes) => {
  if (!bytes) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const StatusBadge = ({ isSubmitted, isLate }) => {
  if (isSubmitted && isLate)
    return (
      <span className="status-badge late">
        <Clock size={13} /> Nộp muộn
      </span>
    );
  if (isSubmitted)
    return (
      <span className="status-badge submitted">
        <CheckCircle2 size={13} /> Đã nộp
      </span>
    );
  return <span className="status-badge assigned">Đã giao</span>;
};

const StudentSidebar = ({ data, assignmentId, token, onRefresh }) => {
  const [uploading, setUploading] = useState(false);
  const [unsubmitting, setUnsubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileRef = useRef(null);

  const isLate =
    data.isSubmitted &&
    data.mySubmission?.submittedAt &&
    new Date(data.mySubmission.submittedAt) > new Date(data.dueDate);

  const handleFileChange = (e) => {
    if (e.target.files[0]) setSelectedFile(e.target.files[0]);
  };

  const handleSubmit = async () => {
    if (!selectedFile) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("assignmentId", assignmentId);
      const res = await fetch(`${API_BASE_URL}/api/submission`, {
        method: "POST",
        headers: { Authorization: "Bearer " + token },
        body: formData,
      });
      if (res.ok) {
        setSelectedFile(null);
        onRefresh();
      }
    } catch (err) {
      console.error("Lỗi nộp bài:", err);
    } finally {
      setUploading(false);
    }
  };

  const handleUnsubmit = async () => {
    if (!window.confirm("Bạn có chắc muốn hủy nộp bài?")) return;
    setUnsubmitting(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/submission/` + data.mySubmission?.id,
        { method: "DELETE", headers: { Authorization: "Bearer " + token } },
      );
      if (res.ok) onRefresh();
    } catch (err) {
      console.error("Lỗi hủy nộp:", err);
    } finally {
      setUnsubmitting(false);
    }
  };

  return (
    <div className="sidebar-card work-card">
      <div className="card-header">
        <h2>Bài tập của bạn</h2>
        <StatusBadge isSubmitted={data.isSubmitted} isLate={isLate} />
      </div>
      <div className="card-content">
        {data.isSubmitted ? (
          <div className="submitted-view">
            {data.mySubmission?.fileUrl && (
              <a
                href={
                  data.mySubmission.fileUrl.startsWith("http")
                    ? data.mySubmission.fileUrl
                    : `${API_BASE_URL}${data.mySubmission.fileUrl}`
                }
                target="_blank"
                rel="noreferrer"
                className="submitted-file-row"
              >
                <FileText size={18} />
                <span>{data.mySubmission.fileName || "Tệp đã nộp"}</span>
                <ExternalLink size={14} />
              </a>
            )}
            {data.mySubmission?.score != null ? (
              <div className="grade-display">
                <span className="score">{data.mySubmission.score}</span>
                <span className="total">/ {data.maxScore} điểm</span>
              </div>
            ) : (
              <p className="grade-pending">Chờ chấm điểm...</p>
            )}
            <button
              className="btn-unsubmit"
              onClick={handleUnsubmit}
              disabled={unsubmitting}
            >
              {unsubmitting ? (
                <Loader2 size={14} className="spin" />
              ) : (
                <RefreshCcw size={14} />
              )}
              {unsubmitting ? "Đang hủy..." : "Hủy nộp bài"}
            </button>
          </div>
        ) : (
          <div className="empty-view">
            <input
              ref={fileRef}
              type="file"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
            {selectedFile ? (
              <div className="selected-file-row">
                <FileText size={16} />
                <span className="sf-name">{selectedFile.name}</span>
                <button
                  className="btn-remove-file"
                  onClick={() => setSelectedFile(null)}
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button
                className="btn-add-work"
                onClick={() => fileRef.current && fileRef.current.click()}
              >
                <UploadCloud size={18} /> Thêm hoặc tạo
              </button>
            )}
            <button
              className="btn-mark-done"
              disabled={!selectedFile || uploading}
              onClick={handleSubmit}
            >
              {uploading ? (
                <>
                  <Loader2 size={14} className="spin" /> Đang nộp...
                </>
              ) : (
                "Nộp bài"
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const TeacherSidebar = ({ data, assignmentId, navigate }) => {
  const totalStudents = data.totalStudents || 0;
  const submittedCount = data.submissionCount || 0;
  const missingCount = Math.max(0, totalStudents - submittedCount);
  const percent =
    totalStudents > 0 ? Math.round((submittedCount / totalStudents) * 100) : 0;

  return (
    <div className="sidebar-card stats-card">
      <h2 className="stats-title">Tổng quan</h2>
      <div className="stats-row">
        <div
          className="stat-item clickable"
          onClick={() => navigate(`/assignment/${assignmentId}/submissions`)}
        >
          <span className="count submitted-count">{submittedCount}</span>
          <span className="label">Đã nộp</span>
        </div>
        <div className="stat-divider" />
        <div className="stat-item">
          <span className="count missing-count">{missingCount}</span>
          <span className="label">Chưa nộp</span>
        </div>
      </div>
      <div className="progress-bar-wrap">
        <div className="progress-bar-fill" style={{ width: percent + "%" }} />
      </div>
      <button
        className="btn-view-all"
        onClick={() => navigate(`/assignment/${assignmentId}/submissions`)}
      >
        <Users size={15} /> Xem bài nộp <ExternalLink size={13} />
      </button>
    </div>
  );
};

const AssignmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useContext(AuthContext);
  const isTeacher = user?.role?.toLowerCase() === "teacher";

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [privateComment, setPrivateComment] = useState("");

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/assignment/${id}/detail`, {
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json",
        },
      });
      if (res.ok) {
        setData(await res.json());
      } else {
        setError("Không thể tải thông tin bài tập.");
      }
    } catch (err) {
      setError("Lỗi kết nối đến máy chủ.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchDetail();
  }, [id, token]);

  const handleSendComment = async () => {
    if (!privateComment.trim()) return;
    try {
      await fetch(`${API_BASE_URL}/api/assignment/${id}/comment`, {
        method: "POST",
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: privateComment }),
      });
      setPrivateComment("");
    } catch (e) {
      console.error(e);
    }
  };

  if (loading)
    return (
      <div className="gc-loading">
        <Loader2 className="spin" />
      </div>
    );
  if (error || !data)
    return (
      <div className="gc-error">
        <AlertCircle />
        <p>{error || "Dữ liệu không tồn tại"}</p>
        <button onClick={() => navigate(-1)}>Quay lại</button>
      </div>
    );

  return (
    <div
      className={`gc-assignment-page ${isTeacher ? "role-teacher" : "role-student"}`}
    >
      <nav className="gc-assign-nav">
        <div className="nav-left">
          <button className="btn-icon" onClick={() => navigate(-1)}>
            <ChevronLeft size={24} />
          </button>
          <div className="nav-titles">
            <span className="class-name">{data.classroomName}</span>
            <span className="assign-title">{data.title}</span>
          </div>
        </div>
      </nav>

      <main className="gc-assign-container">
        <div className="gc-assign-content-grid">
          <section className="gc-assign-main">
            <header className="main-header">
              <div className="header-icon">
                <FileText size={32} />
              </div>
              <div className="header-text">
                <h1>{data.title}</h1>
                <div className="sub-info">
                  <span>{data.teacherName}</span>
                  <span className="dot">•</span>
                  <span>
                    Đã đăng:{" "}
                    {new Date(data.createdAt).toLocaleDateString("vi-VN")}
                  </span>
                </div>
                <div className="score-due-row">
                  <span className="points">{data.maxScore} điểm</span>
                  <span className="due-date">
                    Hạn chót: {new Date(data.dueDate).toLocaleString("vi-VN")}
                  </span>
                </div>
              </div>
            </header>

            <div className="main-divider" />
            <div className="instructions-section">
              <p className="desc-text">
                {data.description || "Không có hướng dẫn chi tiết."}
              </p>
            </div>

            {data.files && data.files.length > 0 && (
              <div className="attachments-section">
                <div className="attachment-grid">
                  {data.files.map((file) => (
                    <a
                      key={file.id}
                      // Kiểm tra xem URL đã có http chưa để tránh nối chuỗi sai
                      href={
                        file.fileUrl.startsWith("http")
                          ? file.fileUrl
                          : `${API_BASE_URL}${file.fileUrl}`
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="file-card"
                    >
                      <div className="file-thumb">
                        <Paperclip size={24} />
                      </div>
                      <div className="file-info">
                        <span className="file-name">{file.fileName}</span>
                        <span className="file-type">
                          {formatFileSize(file.fileSize)}
                        </span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </section>

          <aside className="gc-assign-sidebar">
            {isTeacher ? (
              <TeacherSidebar
                data={data}
                assignmentId={id}
                navigate={navigate}
              />
            ) : (
              <StudentSidebar
                data={data}
                assignmentId={id}
                token={token}
                onRefresh={fetchDetail}
              />
            )}
          </aside>
        </div>
      </main>
    </div>
  );
};

export default AssignmentDetail;
