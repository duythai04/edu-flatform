import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  FileText,
  ExternalLink,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Clock,
  Users,
  Award,
  X,
  Save,
  Search,
  Filter,
} from "lucide-react";
import "./SubmissionList.scss";
import { AuthContext } from "../../contexts/AuthContext";

const API_BASE_URL = "http://localhost:5187";

// Grade Modal
const GradeModal = ({ submission, maxScore, token, onClose, onGraded }) => {
  const [score, setScore] = useState(
    submission.score != null ? String(submission.score) : "",
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleSave = async () => {
    const parsed = parseFloat(score);
    if (isNaN(parsed) || parsed < 0 || parsed > maxScore) {
      setError(`Điểm phải từ 0 đến ${maxScore}.`);
      return;
    }

    setSaving(true);
    setError(null);
    try {
      // POST /api/submission/{id}/grade
      const res = await fetch(
        `${API_BASE_URL}/api/submission/${submission.id}/grade`,
        {
          method: "POST",
          headers: {
            Authorization: "Bearer " + token,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ score: parsed }),
        },
      );

      if (res.ok) {
        const updated = await res.json();
        onGraded(updated);
        onClose();
      } else {
        setError("Chấm điểm thất bại. Vui lòng thử lại.");
      }
    } catch {
      setError("Lỗi kết nối.");
    } finally {
      setSaving(false);
    }
  };

  const isLate =
    submission.submittedAt &&
    submission.dueDate &&
    new Date(submission.submittedAt) > new Date(submission.dueDate);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="grade-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-header-info">
            <div className="student-avatar">
              {submission.studentName?.charAt(0)?.toUpperCase() || "?"}
            </div>
            <div>
              <h2>{submission.studentName}</h2>
              <p className="submitted-time">
                Nộp lúc:{" "}
                {new Date(submission.submittedAt).toLocaleString("vi-VN")}
                {isLate && <span className="late-tag"> • Nộp muộn</span>}
              </p>
            </div>
          </div>
          <button className="btn-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* File đã nộp */}
        <div className="modal-body">
          {submission.fileUrl ? (
            <a
              href={
                submission.fileUrl.startsWith("http")
                  ? submission.fileUrl
                  : `${API_BASE_URL}${submission.fileUrl}`
              }
              target="_blank"
              rel="noreferrer"
              className="file-preview-row"
            >
              <div className="file-icon-wrap">
                <FileText size={22} />
              </div>
              <div className="file-meta">
                <span className="file-name-text">
                  {submission.fileName || "Tệp đã nộp"}
                </span>
                <span className="file-open-hint">Nhấn để mở file</span>
              </div>
              <ExternalLink size={16} className="ext-icon" />
            </a>
          ) : submission.content ? (
            <div className="content-preview">
              <p className="content-label">Nội dung bài làm:</p>
              <p className="content-text">{submission.content}</p>
            </div>
          ) : (
            <p className="no-file">Học sinh không đính kèm file.</p>
          )}

          {/* Chấm điểm */}
          <div className="grade-section">
            <label className="grade-label">
              <Award size={16} /> Điểm số
            </label>
            <div className="grade-input-row">
              <input
                type="number"
                min={0}
                max={maxScore}
                step={0.5}
                value={score}
                onChange={(e) => {
                  setScore(e.target.value);
                  setError(null);
                }}
                placeholder="Nhập điểm..."
                className="grade-input"
              />
              <span className="grade-max">/ {maxScore}</span>
            </div>
            {error && (
              <p className="grade-error">
                <AlertCircle size={13} /> {error}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>
            Hủy
          </button>
          <button
            className="btn-save-grade"
            onClick={handleSave}
            disabled={saving || score === ""}
          >
            {saving ? (
              <Loader2 size={15} className="spin" />
            ) : (
              <Save size={15} />
            )}
            {saving ? "Đang lưu..." : "Lưu điểm"}
          </button>
        </div>
      </div>
    </div>
  );
};

//Main Page
const SubmissionList = () => {
  const { id: assignmentId } = useParams(); // /assignment/:id/submissions
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);

  const [submissions, setSubmissions] = useState([]);
  const [assignmentInfo, setAssignmentInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null); // submission đang chấm
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // all | graded | ungraded

  // GET /api/assignment/{id}/detail  — lấy thông tin bài tập
  const fetchAssignment = async () => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/assignment/${assignmentId}/detail`,
        { headers: { Authorization: "Bearer " + token } },
      );
      if (res.ok) setAssignmentInfo(await res.json());
    } catch {}
  };

  // GET /api/submission/assignment/{assignmentId}  — danh sách bài nộp
  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/submission/assignment/${assignmentId}`,
        { headers: { Authorization: "Bearer " + token } },
      );
      if (res.ok) {
        setSubmissions(await res.json());
      } else {
        setError("Không thể tải danh sách bài nộp.");
      }
    } catch {
      setError("Lỗi kết nối đến máy chủ.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchAssignment();
      fetchSubmissions();
    }
  }, [assignmentId, token]);

  // Cập nhật điểm local sau khi chấm (không cần fetch lại toàn bộ)
  const handleGraded = (updated) => {
    setSubmissions((prev) =>
      prev.map((s) =>
        s.id === updated.id ? { ...s, score: updated.score } : s,
      ),
    );
  };

  // Filter + search
  const filtered = submissions.filter((s) => {
    const matchSearch = s.studentName
      ?.toLowerCase()
      .includes(search.toLowerCase());
    const matchFilter =
      filter === "all"
        ? true
        : filter === "graded"
          ? s.score != null
          : s.score == null;
    return matchSearch && matchFilter;
  });

  const gradedCount = submissions.filter((s) => s.score != null).length;
  const ungradedCount = submissions.length - gradedCount;
  const maxScore = assignmentInfo?.maxScore ?? 100;

  // ── Loading / Error ──────────────────────────────────────────────────────
  if (loading)
    return (
      <div className="sl-loading">
        <Loader2 className="spin" size={32} />
      </div>
    );

  if (error)
    return (
      <div className="sl-error">
        <AlertCircle size={32} />
        <p>{error}</p>
        <button onClick={() => navigate(-1)}>Quay lại</button>
      </div>
    );

  return (
    <div className="sl-page">
      {/* Nav */}
      <nav className="sl-nav">
        <button className="btn-back" onClick={() => navigate(-1)}>
          <ChevronLeft size={22} />
        </button>
        <div className="sl-nav-titles">
          <span className="sl-class-name">
            {assignmentInfo?.classroomName || "Lớp học"}
          </span>
          <span className="sl-assign-title">
            {assignmentInfo?.title || "Bài tập"}
          </span>
        </div>
      </nav>

      <div className="sl-container">
        {/* Stats bar */}
        <div className="sl-stats-bar">
          <div className="stat-chip total">
            <Users size={16} />
            <span>{submissions.length} bài nộp</span>
          </div>
          <div className="stat-chip graded">
            <CheckCircle2 size={16} />
            <span>{gradedCount} đã chấm</span>
          </div>
          <div className="stat-chip ungraded">
            <Clock size={16} />
            <span>{ungradedCount} chờ chấm</span>
          </div>
          <div className="stat-chip maxscore">
            <Award size={16} />
            <span>Thang {maxScore} điểm</span>
          </div>
        </div>

        {/* Toolbar */}
        <div className="sl-toolbar">
          <div className="search-wrap">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Tìm tên học sinh..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="filter-tabs">
            {[
              { key: "all", label: "Tất cả" },
              { key: "ungraded", label: "Chờ chấm" },
              { key: "graded", label: "Đã chấm" },
            ].map((tab) => (
              <button
                key={tab.key}
                className={`filter-tab ${filter === tab.key ? "active" : ""}`}
                onClick={() => setFilter(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        {filtered.length === 0 ? (
          <div className="sl-empty">
            <Users size={40} />
            <p>Không có bài nộp nào.</p>
          </div>
        ) : (
          <div className="sl-table-wrap">
            <table className="sl-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Học sinh</th>
                  <th>File đã nộp</th>
                  <th>Thời gian nộp</th>
                  <th>Trạng thái</th>
                  <th>Điểm</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, idx) => {
                  const isLate =
                    assignmentInfo?.dueDate &&
                    new Date(s.submittedAt) > new Date(assignmentInfo.dueDate);
                  const isGraded = s.score != null;

                  return (
                    <tr
                      key={s.id}
                      className={isGraded ? "row-graded" : "row-pending"}
                    >
                      <td className="col-idx">{idx + 1}</td>

                      {/* Tên học sinh */}
                      <td className="col-student">
                        <div className="student-cell">
                          <div className="avatar-sm">
                            {s.studentName?.charAt(0)?.toUpperCase()}
                          </div>
                          <span>{s.studentName}</span>
                        </div>
                      </td>

                      {/* File */}
                      <td className="col-file">
                        {s.fileUrl ? (
                          <a
                            href={
                              s.fileUrl.startsWith("http")
                                ? s.fileUrl
                                : `${API_BASE_URL}${s.fileUrl}`
                            }
                            target="_blank"
                            rel="noreferrer"
                            className="file-link"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <FileText size={14} />
                            <span>{s.fileName || "Xem file"}</span>
                            <ExternalLink size={12} />
                          </a>
                        ) : s.content ? (
                          <span className="text-submission">Văn bản</span>
                        ) : (
                          <span className="no-file-text">—</span>
                        )}
                      </td>

                      {/* Thời gian */}
                      <td className="col-time">
                        <div className="time-cell">
                          <span>
                            {new Date(s.submittedAt).toLocaleString("vi-VN")}
                          </span>
                          {isLate && (
                            <span className="late-badge">
                              <Clock size={11} /> Muộn
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Trạng thái */}
                      <td className="col-status">
                        {isGraded ? (
                          <span className="badge-graded">
                            <CheckCircle2 size={13} /> Đã chấm
                          </span>
                        ) : (
                          <span className="badge-pending">Chờ chấm</span>
                        )}
                      </td>

                      {/* Điểm */}
                      <td className="col-score">
                        {isGraded ? (
                          <span className="score-display">
                            <strong>{s.score}</strong>
                            <span className="score-max">/{maxScore}</span>
                          </span>
                        ) : (
                          <span className="score-empty">—</span>
                        )}
                      </td>

                      {/* Nút chấm */}
                      <td className="col-action">
                        <button
                          className={`btn-grade ${isGraded ? "btn-regrade" : ""}`}
                          onClick={() =>
                            setSelected({
                              ...s,
                              dueDate: assignmentInfo?.dueDate,
                            })
                          }
                        >
                          <Award size={14} />
                          {isGraded ? "Sửa điểm" : "Chấm điểm"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Grade Modal */}
      {selected && (
        <GradeModal
          submission={selected}
          maxScore={maxScore}
          token={token}
          onClose={() => setSelected(null)}
          onGraded={handleGraded}
        />
      )}
    </div>
  );
};

export default SubmissionList;
