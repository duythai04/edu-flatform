import React, { useState, useEffect, useCallback, useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Users,
  ClipboardList,
  ArrowLeft,
  MoreVertical,
  Megaphone,
  Copy,
  Plus,
  Info,
  LayoutGrid,
  Bell,
  CheckCircle,
  Pencil,
  Trash2,
  Clock,
  BookOpen,
  AlertCircle,
} from "lucide-react";
import "./ClassDetail.scss";
import { AuthContext } from "../../contexts/AuthContext";

// Import các Modal
import CreateAssignmentModal from "../CreateAssignmentModal/CreateAssignmentModal";
import EditAssignmentModal from "../EditAssignmentModal/EditAssignmentModal";

/* ─────────────────────────────────────────────
   Helper: badge trạng thái nộp bài (học sinh)
───────────────────────────────────────────── */
const SubmissionBadge = ({ status }) => {
  const map = {
    submitted: {
      icon: <CheckCircle size={14} />,
      label: "Đã nộp",
      cls: "badge-submitted",
    },
    late: {
      icon: <AlertCircle size={14} />,
      label: "Nộp muộn",
      cls: "badge-late",
    },
    missing: {
      icon: <Clock size={14} />,
      label: "Chưa nộp",
      cls: "badge-missing",
    },
  };
  const item = map[status] ?? map.missing;
  return (
    <span className={`submission-badge ${item.cls}`}>
      {item.icon} {item.label}
    </span>
  );
};

/* ─────────────────────────────────────────────
   GIAO DIỆN GIÁO VIÊN – Stream
───────────────────────────────────────────── */
const TeacherStream = ({
  classData,
  announcements,
  user,
  id,
  headers,
  onAnnouncementPosted,
}) => {
  const [newPost, setNewPost] = useState("");
  const [isExpanding, setIsExpanding] = useState(false);

  const handlePost = async () => {
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
      onAnnouncementPosted(data);
      setNewPost("");
      setIsExpanding(false);
    }
  };

  return (
    <div className="tab-stream fade-in">
      <div
        className="stream-banner"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,0.5)), url('https://www.gstatic.com/classroom/themes/img_read.jpg')`,
        }}
      >
        <div className="banner-footer">
          <div className="code-badge">
            Mã lớp: <strong>{classData.classCode}</strong>
            <Copy
              size={14}
              onClick={() => navigator.clipboard.writeText(classData.classCode)}
              style={{ marginLeft: 8, cursor: "pointer" }}
            />
          </div>
          <span className="teacher-badge">Giáo viên</span>
        </div>
      </div>

      <div className="stream-feed-container">
        <div className={`composer-box ${isExpanding ? "active" : ""}`}>
          {!isExpanding ? (
            <div className="placeholder" onClick={() => setIsExpanding(true)}>
              <div className="avatar-mini">{user?.name?.charAt(0)}</div>
              <span>Thông báo nội dung nào đó cho lớp học...</span>
            </div>
          ) : (
            <div className="active-area">
              <textarea
                placeholder="Thông báo nội dung..."
                autoFocus
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
              />
              <div className="actions">
                <button
                  className="btn-text"
                  onClick={() => setIsExpanding(false)}
                >
                  Hủy
                </button>
                <button
                  className="btn-filled"
                  disabled={!newPost.trim()}
                  onClick={handlePost}
                >
                  Đăng
                </button>
              </div>
            </div>
          )}
        </div>
        <FeedList classData={classData} announcements={announcements} />
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   GIAO DIỆN HỌC SINH – Stream
───────────────────────────────────────────── */
const StudentStream = ({ classData, announcements }) => (
  <div className="tab-stream fade-in">
    <div
      className="stream-banner"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,0.5)), url('https://www.gstatic.com/classroom/themes/img_read.jpg')`,
      }}
    >
      <div className="banner-footer">
        <span className="student-banner-info">
          <BookOpen size={16} /> {classData.name}
        </span>
      </div>
    </div>
    <div className="stream-feed-container">
      <FeedList classData={classData} announcements={announcements} />
    </div>
  </div>
);

/* ─────────────────────────────────────────────
   Feed chung
───────────────────────────────────────────── */
const FeedList = ({ classData, announcements }) => (
  <div className="feed-list">
    {announcements.map((ann) => (
      <div key={ann.id} className="feed-item announcement">
        <div className="item-header">
          <div className="icon-circle">
            <Megaphone size={18} />
          </div>
          <div className="meta">
            <span className="author">{classData.teacherName}</span>
            <span className="time">
              {new Date(ann.createdAt).toLocaleDateString("vi-VN")}
            </span>
          </div>
          <button className="btn-more">
            <MoreVertical size={18} />
          </button>
        </div>
        <div className="item-content">
          <p>{ann.content}</p>
        </div>
      </div>
    ))}

    {classData.assignments?.map((asm) => (
      <Link
        key={asm.id}
        to={`/assignment/${asm.id}`}
        className="feed-item assignment-link"
      >
        <div className="item-header">
          <div className="icon-circle assignment">
            <ClipboardList size={18} />
          </div>
          <div className="meta">
            <span className="author">
              <strong>{classData.teacherName}</strong> đã đăng một bài tập:{" "}
              {asm.title}
            </span>
            <span className="time">
              {new Date(asm.dueDate).toLocaleDateString("vi-VN")}
            </span>
          </div>
        </div>
      </Link>
    ))}
  </div>
);

/* ─────────────────────────────────────────────
   GIAO DIỆN GIÁO VIÊN – Classwork (Cập nhật Sửa/Xóa)
───────────────────────────────────────────── */
const TeacherClasswork = ({
  classData,
  onCreateClick,
  onEditClick,
  onDeleteClick,
}) => (
  <div className="tab-classwork fade-in">
    <div className="classwork-top">
      <button className="btn-create" onClick={onCreateClick}>
        <Plus size={20} /> Tạo bài tập
      </button>
    </div>
    <div className="asm-list">
      {classData.assignments?.map((asm) => (
        <div key={asm.id} className="asm-card-row">
          <Link to={`/assignment/${asm.id}`} className="asm-card teacher-card">
            <div className="asm-icon">
              <ClipboardList size={22} />
            </div>
            <div className="asm-info">
              <h4>{asm.title}</h4>
              <span>
                Đã đăng {new Date(asm.dueDate).toLocaleDateString("vi-VN")}
              </span>
            </div>
            <div className="asm-meta-right">
              <div className="asm-due">
                Hạn: {new Date(asm.dueDate).toLocaleDateString("vi-VN")}
              </div>
              <div className="submission-stats">
                <span className="stat submitted">
                  {asm.submittedCount ?? 0} đã nộp
                </span>
                <span className="stat missing">
                  {asm.missingCount ?? 0} chưa nộp
                </span>
              </div>
            </div>
          </Link>
          <div className="asm-actions-overlay">
            <button
              className="btn-icon-action edit"
              title="Chỉnh sửa"
              onClick={(e) => {
                e.preventDefault();
                onEditClick(asm);
              }}
            >
              <Pencil size={18} />
            </button>
            <button
              className="btn-icon-action delete"
              title="Xóa"
              onClick={(e) => {
                e.preventDefault();
                onDeleteClick(asm.id);
              }}
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

/* ─────────────────────────────────────────────
   GIAO DIỆN HỌC SINH – Classwork
───────────────────────────────────────────── */
const StudentClasswork = ({ classData }) => (
  <div className="tab-classwork fade-in">
    <div className="classwork-top student-classwork-header">
      <h2>Bài tập của bạn</h2>
    </div>
    <div className="asm-list">
      {classData.assignments?.length === 0 && (
        <div className="empty-state">
          <BookOpen size={40} />
          <p>Chưa có bài tập nào.</p>
        </div>
      )}
      {classData.assignments?.map((asm) => {
        const status = asm.submissionStatus ?? "missing";
        const isOverdue =
          new Date(asm.dueDate) < new Date() && status === "missing";
        return (
          <Link
            to={`/assignment/${asm.id}`}
            key={asm.id}
            className={`asm-card student-card ${isOverdue ? "overdue" : ""}`}
          >
            <div className="asm-icon">
              <ClipboardList size={22} />
            </div>
            <div className="asm-info">
              <h4>{asm.title}</h4>
              <span className="asm-posted">
                Đã đăng {new Date(asm.dueDate).toLocaleDateString("vi-VN")}
              </span>
            </div>
            <div className="asm-meta-right">
              <div className="asm-due">
                Hạn: {new Date(asm.dueDate).toLocaleDateString("vi-VN")}
              </div>
              <SubmissionBadge status={status} />
              {asm.grade != null && (
                <span className="grade-badge">Điểm: {asm.grade}</span>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  </div>
);

/* ─────────────────────────────────────────────
   GIAO DIỆN PEOPLE (Rút gọn để tiết kiệm không gian)
───────────────────────────────────────────── */
const TeacherPeople = ({ classData }) => (
  <div className="tab-people fade-in">
    <section className="people-section">
      <h2>Giáo viên</h2>
      <div className="person-row">
        <div className="avatar-circle teacher">
          {classData.teacherName?.charAt(0)}
        </div>
        <span>{classData.teacherName}</span>
      </div>
    </section>
    <section className="people-section">
      <div className="section-header">
        <h2>Học sinh</h2>
        <span>{classData.studentCount} sinh viên</span>
      </div>
      {classData.students?.map((s) => (
        <div key={s.id} className="person-row">
          <div className="avatar-circle">{s.name?.charAt(0)}</div>
          <span>{s.name}</span>
        </div>
      ))}
    </section>
  </div>
);

const StudentPeople = ({ classData, currentUserId }) => (
  <div className="tab-people fade-in">
    <section className="people-section">
      <h2>Giáo viên</h2>
      <div className="person-row">
        <div className="avatar-circle teacher">
          {classData.teacherName?.charAt(0)}
        </div>
        <span>{classData.teacherName}</span>
      </div>
    </section>
    <section className="people-section">
      <div className="section-header">
        <h2>Bạn cùng lớp</h2>
        <span>{classData.studentCount} sinh viên</span>
      </div>
      {classData.students?.map((s) => (
        <div
          key={s.id}
          className={`person-row ${s.id === currentUserId ? "me" : ""}`}
        >
          <div className="avatar-circle">{s.name?.charAt(0)}</div>
          <span>{s.name}</span>
          {s.id === currentUserId && (
            <span className="role-tag me-tag">Bạn</span>
          )}
        </div>
      ))}
    </section>
  </div>
);

/* ═══════════════════════════════════════════════════════
   COMPONENT CHÍNH
══════════════════════════════════════════════════════════ */
const ClassDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useContext(AuthContext);

  const isTeacher = user?.role?.toLowerCase() === "teacher";

  const [classData, setClassData] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("stream");

  // States cho Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);

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

  const handleDeleteAssignment = async (asmId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bài tập này không?")) return;
    try {
      const res = await fetch(`http://localhost:5187/api/assignment/${asmId}`, {
        method: "DELETE",
        headers,
      });
      if (res.ok) fetchData();
      else alert("Không thể xóa bài tập.");
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditClick = (asm) => {
    setSelectedAssignment(asm);
    setIsEditModalOpen(true);
  };

  if (loading)
    return (
      <div className="gc-loading-screen">
        <div className="loader"></div>
      </div>
    );
  if (!classData)
    return (
      <div className="gc-error-state">
        <h2>Lớp học không tồn tại</h2>
        <Link to="/home">Quay lại</Link>
      </div>
    );

  return (
    <div
      className={`gc-dashboard-root ${isTeacher ? "role-teacher" : "role-student"}`}
    >
      <header className="gc-top-nav">
        <div className="nav-left">
          <button className="btn-circle" onClick={() => navigate("/home")}>
            <ArrowLeft size={20} />
          </button>
          <div className="mini-info">
            <span className="name">{classData.name}</span>
            <span
              className={`role-chip ${isTeacher ? "chip-teacher" : "chip-student"}`}
            >
              {isTeacher ? "Giáo viên" : "Học sinh"}
            </span>
          </div>
        </div>
        <div className="nav-right">
          <button className="btn-circle">
            <Bell size={20} />
          </button>
          <button className="btn-circle">
            <Info size={20} />
          </button>
          <div className="user-avatar">{user?.name?.charAt(0)}</div>
        </div>
      </header>

      <div className="gc-main-layout">
        <aside className="gc-sidebar">
          <div className="sidebar-header">
            <h1>{classData.name}</h1>
            <p>{classData.description || "Niên khóa 2023-2024"}</p>
            {isTeacher && (
              <div className="sidebar-class-code">
                <span>Mã lớp:</span>
                <strong>{classData.classCode}</strong>
                <Copy
                  size={13}
                  style={{ cursor: "pointer", marginLeft: 4 }}
                  onClick={() =>
                    navigator.clipboard.writeText(classData.classCode)
                  }
                />
              </div>
            )}
          </div>
          <nav className="vertical-tabs">
            <button
              className={`tab-link ${activeTab === "stream" ? "active" : ""}`}
              onClick={() => setActiveTab("stream")}
            >
              <LayoutGrid size={20} /> <span>Bảng tin</span>
            </button>
            <button
              className={`tab-link ${activeTab === "classwork" ? "active" : ""}`}
              onClick={() => setActiveTab("classwork")}
            >
              <ClipboardList size={20} /> <span>Bài tập</span>
            </button>
            <button
              className={`tab-link ${activeTab === "people" ? "active" : ""}`}
              onClick={() => setActiveTab("people")}
            >
              <Users size={20} /> <span>Mọi người</span>
            </button>
          </nav>
        </aside>

        <main className="gc-content-area">
          {activeTab === "stream" &&
            (isTeacher ? (
              <TeacherStream
                classData={classData}
                announcements={announcements}
                user={user}
                id={id}
                headers={headers}
                onAnnouncementPosted={(n) =>
                  setAnnouncements([n, ...announcements])
                }
              />
            ) : (
              <StudentStream
                classData={classData}
                announcements={announcements}
              />
            ))}
          {activeTab === "classwork" &&
            (isTeacher ? (
              <TeacherClasswork
                classData={classData}
                onCreateClick={() => setIsCreateModalOpen(true)}
                onEditClick={handleEditClick}
                onDeleteClick={handleDeleteAssignment}
              />
            ) : (
              <StudentClasswork classData={classData} />
            ))}
          {activeTab === "people" &&
            (isTeacher ? (
              <TeacherPeople classData={classData} />
            ) : (
              <StudentPeople classData={classData} currentUserId={user?.id} />
            ))}
        </main>
      </div>

      {/* Modals */}
      <CreateAssignmentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        classroomId={id}
        onRefresh={fetchData}
      />
      {selectedAssignment && (
        <EditAssignmentModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedAssignment(null);
          }}
          assignment={selectedAssignment}
          onRefresh={fetchData}
        />
      )}
    </div>
  );
};

export default ClassDetail;
