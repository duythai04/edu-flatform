import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FileText,
  Calendar,
  Clock,
  Paperclip,
  Send,
  ChevronLeft,
  MoreVertical,
  Download,
  ExternalLink,
  Loader2,
  AlertCircle,
  Trophy,
} from "lucide-react";
import "./AssignmentDetail.scss";

const AssignmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Lấy Role từ localStorage (giả định bạn lưu khi đăng nhập)
  const userRole = localStorage.getItem("role");

  useEffect(() => {
    fetchAssignmentDetail();
  }, [id]);

  const fetchAssignmentDetail = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      // Gọi đúng API /detail chúng ta vừa viết ở Backend
      const response = await fetch(
        `http://localhost:5187/api/assignment/${id}/detail`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.ok) {
        const result = await response.json();
        setData(result);
      } else {
        setError("Không thể tải thông tin bài tập. Vui lòng thử lại.");
      }
    } catch (err) {
      setError("Lỗi kết nối đến máy chủ.");
    } finally {
      setLoading(false);
    }
  };

  // Hàm hỗ trợ format dung lượng file
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (loading)
    return (
      <div className="asd-state-wrap">
        <Loader2 className="asd-spin" size={40} />
        <p>Đang tải bài tập...</p>
      </div>
    );

  if (error)
    return (
      <div className="asd-state-wrap asd-error">
        <AlertCircle size={48} />
        <p>{error}</p>
        <button onClick={() => navigate(-1)}>Quay lại</button>
      </div>
    );

  return (
    <div className="asd-root">
      <nav className="asd-nav">
        <button className="asd-back-btn" onClick={() => navigate(-1)}>
          <ChevronLeft size={20} />
          <span>Quay lại</span>
        </button>
      </nav>

      <div className="asd-container">
        {/* CỘT TRÁI: THÔNG TIN BÀI TẬP */}
        <main className="asd-main">
          <header className="asd-header">
            <div className="asd-header__icon">
              <FileText size={26} />
            </div>
            <div className="asd-header__info">
              <h1>{data.title}</h1>
              <div className="asd-meta">
                <span>
                  Giáo viên: <strong>{data.teacherName}</strong>
                </span>
                <span className="asd-meta__sep">•</span>
                <span>
                  Lớp: <strong>{data.classroomName}</strong>
                </span>
              </div>
            </div>
          </header>

          <div className="asd-score-deadline">
            <div className="asd-info-chip">
              <Trophy size={16} />
              <span>Tối đa: {data.maxScore} điểm</span>
            </div>
            <div className="asd-info-chip asd-info-chip--danger">
              <Calendar size={16} />
              <span>
                Hạn chót: {new Date(data.dueDate).toLocaleString("vi-VN")}
              </span>
            </div>
          </div>

          <div className="asd-section">
            <h3>Hướng dẫn</h3>
            <div className="asd-description">
              {data.description || "Không có mô tả chi tiết."}
            </div>
          </div>

          {data.files && data.files.length > 0 && (
            <div className="asd-section">
              <h3>Tài liệu đính kèm ({data.files.length})</h3>
              <div className="asd-file-grid">
                {data.files.map((file) => (
                  <div key={file.id} className="asd-file-card">
                    <div className="asd-file-card__icon">
                      <Paperclip size={18} />
                    </div>
                    <div className="asd-file-card__info">
                      <p className="name">{file.fileName}</p>
                      <p className="size">{formatFileSize(file.fileSize)}</p>
                    </div>
                    <a
                      href={`http://localhost:5187${file.fileUrl}`}
                      target="_blank"
                      rel="noreferrer"
                      className="asd-file-card__dl"
                    >
                      <Download size={16} />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>

        {/* CỘT PHẢI: TRẠNG THÁI NỘP BÀI */}
        <aside className="asd-side">
          {userRole === "Student" ? (
            <div className="asd-card asd-card--submit">
              <div className="asd-card__head">
                <h2>Bài làm của bạn</h2>
                <span
                  className={`asd-badge ${data.isSubmitted ? "asd-badge--success" : "asd-badge--warn"}`}
                >
                  {data.isSubmitted ? "Đã nộp" : "Chưa nộp"}
                </span>
              </div>

              {data.isSubmitted ? (
                <div className="asd-submitted-info">
                  <div className="asd-sub-row">
                    <Clock size={14} />
                    <span>
                      Nộp lúc:{" "}
                      {new Date(data.mySubmission.submittedAt).toLocaleString(
                        "vi-VN",
                      )}
                    </span>
                  </div>
                  {data.mySubmission.score !== null && (
                    <div className="asd-grade-box">
                      <span className="label">Điểm số:</span>
                      <span className="value">
                        {data.mySubmission.score} / {data.maxScore}
                      </span>
                    </div>
                  )}
                  <button className="asd-btn-secondary">Hủy nộp bài</button>
                </div>
              ) : (
                <div className="asd-empty-submit">
                  <p>Bạn chưa thêm tệp nào cho bài tập này.</p>
                  <button className="asd-btn-primary">
                    <Send size={16} />
                    Nộp bài ngay
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Giao diện dành cho Giáo viên */
            <div className="asd-card asd-card--teacher">
              <h2>Thống kê lớp học</h2>
              <div className="asd-stats">
                <div className="asd-stats__item">
                  <span className="num">{data.submissionCount}</span>
                  <span className="lab">Đã nộp</span>
                </div>
              </div>
              <button
                className="asd-btn-primary asd-btn-full"
                onClick={() => navigate(`/assignment/${id}/submissions`)}
              >
                Xem danh sách bài nộp
                <ExternalLink size={16} />
              </button>
            </div>
          )}

          <div className="asd-card asd-card--comment">
            <h2>Nhận xét riêng tư</h2>
            <div className="asd-comment-box">
              <input type="text" placeholder="Gửi nhận xét cho giáo viên..." />
              <button>
                <Send size={14} />
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default AssignmentDetail;
