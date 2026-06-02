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
  LayoutGrid,
  Bell,
  CheckCircle,
  Pencil,
  Trash2,
  Clock,
  BookOpen,
  AlertCircle,
  MessageSquare,
} from "lucide-react";
import "./ClassDetail.scss";
import { AuthContext } from "../../contexts/AuthContext";
import { API_BASE_URL } from "../../config/api";

import CreateAssignmentModal from "../CreateAssignmentModal/CreateAssignmentModal";
import EditAssignmentModal from "../EditAssignmentModal/EditAssignmentModal";
import CommentSection from "../CommentSection/CommentSection";

// helpers
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

// feed list
const FeedList = ({ classData, announcements, classroomId }) => {
  const [openComments, setOpenComments] = useState({});
  const [commentCounts, setCommentCounts] = useState({});
  const { token } = useContext(AuthContext); // ← thêm

  // fetch count cho tất cả announcements và assignments ngay khi load
  useEffect(() => {
    if (!classroomId || !token) return;

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    const fetchCount = async (id, type) => {
      try {
        const params = new URLSearchParams();
        if (type === "announcement") params.append("announcementId", id);
        if (type === "assignment") params.append("assignmentId", id);

        const res = await fetch(
          `${API_BASE_URL}/api/classrooms/${classroomId}/comments?${params}`,
          { headers },
        );
        if (!res.ok) return;
        const data = await res.json();
        const total = data.reduce(
          (sum, c) => sum + 1 + (c.replies?.length ?? 0),
          0,
        );
        setCommentCounts((prev) => ({ ...prev, [id]: total }));
      } catch (_) {}
    };

    // fetch cho từng announcement
    announcements.forEach((ann) => fetchCount(ann.id, "announcement"));

    // fetch cho từng assignment
    classData?.assignments?.forEach((asm) => fetchCount(asm.id, "assignment"));
  }, [classroomId, announcements, classData?.assignments, token]);

  const toggleComments = (itemId) =>
    setOpenComments((prev) => ({ ...prev, [itemId]: !prev[itemId] }));

  if (!classData) return null;

  return (
    <div className="feed-list">
      {announcements.map((ann) => (
        <div key={ann.id} className="feed-item announcement">
          <div className="item-header">
            <div className="icon-circle">
              <Megaphone size={18} />
            </div>
            <div className="meta">
              <span className="author">{classData?.teacherName}</span>
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

          <div className="item-footer">
            <button
              className="btn-toggle-comment"
              onClick={() => toggleComments(ann.id)}
            >
              <MessageSquare size={16} />
              {openComments[ann.id]
                ? "Ẩn nhận xét"
                : commentCounts[ann.id] > 0
                  ? `${commentCounts[ann.id]} nhận xét lớp học`
                  : "Thêm nhận xét lớp học"}
            </button>
          </div>

          {openComments[ann.id] && (
            <div className="item-comment-area fade-in">
              <CommentSection
                classroomId={classroomId}
                announcementId={ann.id}
                onCountChange={(count) =>
                  setCommentCounts((prev) => ({
                    ...prev,
                    [ann.id]: count > 0 ? count : (prev[ann.id] ?? 0),
                  }))
                }
              />
            </div>
          )}
        </div>
      ))}

      {classData?.assignments?.map((asm) => (
        <div key={asm.id} className="feed-item assignment-feed-item">
          <Link
            to={`/assignment/${asm.id}`}
            className="assignment-link-wrapper"
          >
            <div className="item-header">
              <div className="icon-circle assignment">
                <ClipboardList size={18} />
              </div>
              <div className="meta">
                <span className="author">
                  <strong>{classData?.teacherName}</strong> đã đăng một bài tập
                  mới: {asm.title}
                </span>
                <span className="time">
                  Hạn nộp: {new Date(asm.dueDate).toLocaleDateString("vi-VN")}
                </span>
              </div>
            </div>
          </Link>

          <div className="item-footer">
            <button
              className="btn-toggle-comment"
              onClick={() => toggleComments(asm.id)}
            >
              <MessageSquare size={16} />
              {openComments[asm.id]
                ? "Ẩn nhận xét"
                : commentCounts[asm.id] > 0
                  ? `${commentCounts[asm.id]} nhận xét lớp học`
                  : "Thêm nhận xét lớp học"}
            </button>
          </div>

          {openComments[asm.id] && (
            <div className="item-comment-area fade-in">
              <CommentSection
                classroomId={classroomId}
                assignmentId={asm.id}
                onCountChange={(count) =>
                  setCommentCounts((prev) => ({
                    ...prev,
                    [asm.id]: count > 0 ? count : (prev[asm.id] ?? 0),
                  }))
                }
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// teacher stream
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
    const res = await fetch(`${API_BASE_URL}/api/announcement`, {
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
            Mã lớp: <strong>{classData?.classCode}</strong>
            <Copy
              size={14}
              onClick={() =>
                navigator.clipboard.writeText(classData?.classCode)
              }
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
        <FeedList
          classData={classData}
          announcements={announcements}
          classroomId={id}
        />
      </div>
    </div>
  );
};

// student stream
const StudentStream = ({ classData, announcements, id }) => (
  <div className="tab-stream fade-in">
    <div
      className="stream-banner"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,0.5)), url('https://www.gstatic.com/classroom/themes/img_read.jpg')`,
      }}
    >
      <div className="banner-footer">
        <span className="student-banner-info">
          <BookOpen size={16} /> {classData?.name}
        </span>
      </div>
    </div>
    <div className="stream-feed-container">
      <FeedList
        classData={classData}
        announcements={announcements}
        classroomId={id}
      />
    </div>
  </div>
);

// teacher classwork
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
      {classData?.assignments?.map((asm) => (
        <div key={asm.id} className="asm-card-row">
          <Link to={`/assignment/${asm.id}`} className="asm-card teacher-card">
            <div className="asm-icon">
              <ClipboardList size={22} />
            </div>
            <div className="asm-info">
              <h4>{asm.title}</h4>
              <span>
                Hạn: {new Date(asm.dueDate).toLocaleDateString("vi-VN")}
              </span>
            </div>
          </Link>
          <div className="asm-actions-overlay">
            <button
              onClick={(e) => {
                e.preventDefault();
                onEditClick(asm);
              }}
            >
              <Pencil size={18} />
            </button>
            <button
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

// student classwork
const StudentClasswork = ({ classData }) => (
  <div className="tab-classwork fade-in">
    <div className="classwork-top">
      <h2>Bài tập của bạn</h2>
    </div>
    <div className="asm-list">
      {classData?.assignments?.map((asm) => (
        <Link
          to={`/assignment/${asm.id}`}
          key={asm.id}
          className="asm-card student-card"
        >
          <div className="asm-icon">
            <ClipboardList size={22} />
          </div>
          <div className="asm-info">
            <h4>{asm.title}</h4>
          </div>
          <div className="asm-meta-right">
            <SubmissionBadge status={asm.submissionStatus} />
          </div>
        </Link>
      ))}
    </div>
  </div>
);

// people
const TeacherPeople = ({ classData }) => (
  <div className="tab-people fade-in">
    <h3>Giáo viên</h3>
    <div className="person-row">{classData?.teacherName}</div>
    <h3>Học sinh ({classData?.studentCount})</h3>
    {classData?.students?.map((s) => (
      <div key={s.id} className="person-row">
        {s.name}
      </div>
    ))}
  </div>
);

const StudentPeople = ({ classData, currentUserId }) => (
  <div className="tab-people fade-in">
    <h3>Giáo viên</h3>
    <div className="person-row">{classData?.teacherName}</div>
    <h3>Bạn cùng lớp</h3>
    {classData?.students?.map((s) => (
      <div
        key={s.id}
        className={`person-row ${s.id === currentUserId ? "me" : ""}`}
      >
        {s.name} {s.id === currentUserId && "(Bạn)"}
      </div>
    ))}
  </div>
);

// component chính
const ClassDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useContext(AuthContext);

  const isTeacher = user?.role?.toLowerCase() === "teacher";

  const [classData, setClassData] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("stream");

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
        fetch(`${API_BASE_URL}/api/classroom/${id}`, { headers }),
        fetch(`${API_BASE_URL}/api/announcement/class/${id}`, {
          headers,
        }),
      ]);
      if (classRes.ok) setClassData(await classRes.json());
      if (announceRes.ok) setAnnouncements(await announceRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id, token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDeleteAssignment = async (asmId) => {
    if (!window.confirm("Xóa bài tập này?")) return;
    const res = await fetch(`${API_BASE_URL}/api/assignment/${asmId}`, {
      method: "DELETE",
      headers,
    });
    if (res.ok) fetchData();
  };

  //  loading screen
  if (loading)
    return (
      <div className="gc-loading-screen">
        <div className="loader"></div>
      </div>
    );

  //  guard: classData null sau khi load xong
  if (!classData)
    return (
      <div className="gc-error-state">
        <h2>Không thể tải lớp học</h2>
        <button onClick={() => navigate("/home")}>Quay lại</button>
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
          </div>
        </div>
        <div className="nav-right">
          <Bell size={20} />
          <div className="user-avatar">{user?.name?.charAt(0)}</div>
        </div>
      </header>

      <div className="gc-main-layout">
        <aside className="gc-sidebar">
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
                id={id}
              />
            ))}

          {activeTab === "classwork" &&
            (isTeacher ? (
              <TeacherClasswork
                classData={classData}
                onCreateClick={() => setIsCreateModalOpen(true)}
                onEditClick={(asm) => {
                  setSelectedAssignment(asm);
                  setIsEditModalOpen(true);
                }}
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
