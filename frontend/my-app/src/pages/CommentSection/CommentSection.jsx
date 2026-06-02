import React, {
  useState,
  useEffect,
  useCallback,
  useContext,
  useRef,
} from "react";
import {
  MessageSquare,
  Send,
  Pencil,
  Trash2,
  CornerDownRight,
} from "lucide-react";
import { AuthContext } from "../../contexts/AuthContext";
import "./CommnentSection.scss";
import { API_BASE_URL } from "../../config/api";


const timeAgo = (dateStr) => {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return "Vừa xong";
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} ngày trước`;
  return new Date(dateStr).toLocaleDateString("vi-VN");
};

const handleEnterSend = (e, onSend) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    onSend();
  }
};

const Avatar = ({ name = "?" }) => (
  <div className="cs-avatar">{name.charAt(0).toUpperCase()}</div>
);

const CommentInput = ({
  onSubmit,
  placeholder = "Viết bình luận...",
  compact = false,
  defaultValue = "",
  onCancel,
}) => {
  const [value, setValue] = useState(defaultValue);
  const [loading, setLoading] = useState(false);
  const { user } = useContext(AuthContext);

  const handleSubmit = async () => {
    if (!value.trim() || loading) return;
    setLoading(true);
    try {
      await onSubmit(value.trim());
      setValue("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`cs-input-row ${compact ? "compact" : ""}`}>
      {!compact && <Avatar name={user?.name} />}
      <div className="cs-input-wrap">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          rows={2}
          maxLength={2000}
          onKeyDown={(e) => handleEnterSend(e, handleSubmit)}
        />
        <div className="cs-input-footer">
          <div className="cs-input-actions">
            {onCancel && (
              <button className="cs-btn ghost" onClick={onCancel}>
                Hủy
              </button>
            )}
            <button
              className="cs-btn primary"
              onClick={handleSubmit}
              disabled={!value.trim() || loading}
            >
              {loading ? (
                "..."
              ) : (
                <>
                  <Send size={14} /> Gửi
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ReplyItem = ({ reply, onUpdate, onDelete }) => {
  const [editing, setEditing] = useState(false);
  const [editVal, setEditVal] = useState(reply.content);
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    if (!editVal.trim()) return;
    setLoading(true);
    await onUpdate(reply.id, editVal.trim());
    setLoading(false);
    setEditing(false);
  };

  return (
    <div className="cs-reply">
      <Avatar name={reply.userName} />
      <div className="cs-bubble">
        <div className="cs-bubble-header">
          <span className="cs-name">{reply.userName}</span>
          <span className="cs-time">{timeAgo(reply.createdAt)}</span>
          {reply.updatedAt && <span className="cs-edited">· đã sửa</span>}
        </div>

        {editing ? (
          <div className="cs-edit-area">
            <textarea
              value={editVal}
              onChange={(e) => setEditVal(e.target.value)}
              rows={2}
              autoFocus
              onKeyDown={(e) => handleEnterSend(e, handleUpdate)}
            />
            <div className="cs-edit-actions">
              <button
                className="cs-btn primary sm"
                onClick={handleUpdate}
                disabled={loading}
              >
                {loading ? "..." : "Lưu"}
              </button>
              <button
                className="cs-btn ghost sm"
                onClick={() => {
                  setEditing(false);
                  setEditVal(reply.content);
                }}
              >
                Hủy
              </button>
            </div>
          </div>
        ) : (
          <p className="cs-text">{reply.content}</p>
        )}

        {reply.isOwner && !editing && (
          <div className="cs-actions">
            <button className="cs-action-btn" onClick={() => setEditing(true)}>
              <Pencil size={12} /> Sửa
            </button>
            <button
              className="cs-action-btn danger"
              onClick={() => onDelete(reply.id)}
            >
              <Trash2 size={12} /> Xóa
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const CommentItem = ({
  comment,
  classroomId,
  announcementId,
  assignmentId,
  token,
  onUpdated,
  onDeleted,
  onReplyAdded,
}) => {
  const [showReply, setShowReply] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editVal, setEditVal] = useState(comment.content);
  const [loading, setLoading] = useState(false);

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const handleUpdate = async (newContent) => {
    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/classrooms/${classroomId}/comments/${comment.id}`,
        {
          method: "PUT",
          headers,
          body: JSON.stringify({ content: newContent }),
        },
      );
      if (res.ok) {
        const updated = await res.json();
        onUpdated(updated);
        setEditing(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Xóa bình luận này?")) return;
    const res = await fetch(
      `${API_BASE_URL}/api/classrooms/${classroomId}/comments/${comment.id}`,
      { method: "DELETE", headers },
    );
    if (res.ok) onDeleted(comment.id);
  };

  const handleReply = async (content) => {
    const res = await fetch(`${API_BASE_URL}/api/classrooms/${classroomId}/comments`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        content,
        classroomId,
        parentCommentId: comment.id,
        announcementId,
        assignmentId,
      }),
    });
    if (res.ok) {
      const reply = await res.json();
      onReplyAdded(comment.id, reply);
      setShowReply(false);
    }
  };

  const handleUpdateReply = async (replyId, content) => {
    const res = await fetch(
      `${API_BASE_URL}/api/classrooms/${classroomId}/comments/${replyId}`,
      { method: "PUT", headers, body: JSON.stringify({ content }) },
    );
    if (res.ok) {
      const updated = await res.json();
      onUpdated(updated, comment.id);
    }
  };

  const handleDeleteReply = async (replyId) => {
    if (!window.confirm("Xóa reply này?")) return;
    const res = await fetch(
      `${API_BASE_URL}/api/classrooms/${classroomId}/comments/${replyId}`,
      { method: "DELETE", headers },
    );
    if (res.ok) onDeleted(replyId, comment.id);
  };

  return (
    <div className="cs-comment">
      <Avatar name={comment.userName} />
      <div className="cs-comment-body">
        <div className="cs-bubble">
          <div className="cs-bubble-header">
            <span className="cs-name">{comment.userName}</span>
            <span className="cs-time">{timeAgo(comment.createdAt)}</span>
            {comment.updatedAt && <span className="cs-edited">· đã sửa</span>}
          </div>

          {editing ? (
            <div className="cs-edit-area">
              <textarea
                value={editVal}
                onChange={(e) => setEditVal(e.target.value)}
                rows={2}
                autoFocus
                onKeyDown={(e) =>
                  handleEnterSend(e, () => handleUpdate(editVal))
                }
              />
              <div className="cs-edit-actions">
                <button
                  className="cs-btn primary sm"
                  onClick={() => handleUpdate(editVal)}
                  disabled={loading || !editVal.trim()}
                >
                  {loading ? "..." : "Lưu"}
                </button>
                <button
                  className="cs-btn ghost sm"
                  onClick={() => {
                    setEditing(false);
                    setEditVal(comment.content);
                  }}
                >
                  Hủy
                </button>
              </div>
            </div>
          ) : (
            <p className="cs-text">{comment.content}</p>
          )}
        </div>

        {!editing && (
          <div className="cs-actions">
            <button
              className="cs-action-btn"
              onClick={() => setShowReply((v) => !v)}
            >
              <CornerDownRight size={12} /> {showReply ? "Hủy" : "Trả lời"}
            </button>
            {comment.isOwner && (
              <>
                <button
                  className="cs-action-btn"
                  onClick={() => setEditing(true)}
                >
                  <Pencil size={12} /> Sửa
                </button>
                <button className="cs-action-btn danger" onClick={handleDelete}>
                  <Trash2 size={12} /> Xóa
                </button>
              </>
            )}
          </div>
        )}

        {showReply && (
          <CommentInput
            onSubmit={handleReply}
            placeholder={`Trả lời ${comment.userName}...`}
            compact
            onCancel={() => setShowReply(false)}
          />
        )}

        {comment.replies?.length > 0 && (
          <div className="cs-replies">
            {comment.replies.map((reply) => (
              <ReplyItem
                key={reply.id}
                reply={reply}
                onUpdate={handleUpdateReply}
                onDelete={handleDeleteReply}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const CommentSection = ({
  classroomId,
  announcementId,
  assignmentId,
  onCountChange,
}) => {
  const { user, token } = useContext(AuthContext);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const isMounted = useRef(true);

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const fetchComments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (announcementId) params.append("announcementId", announcementId);
      if (assignmentId) params.append("assignmentId", assignmentId);

      const res = await fetch(
        `${API}/api/classrooms/${classroomId}/comments?${params}`,
        { headers },
      );
      if (!res.ok) throw new Error("Không thể tải bình luận");
      const data = await res.json();
      if (isMounted.current) setComments(data);
    } catch (err) {
      if (isMounted.current) setError(err.message);
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, [classroomId, announcementId, assignmentId, token]);

  useEffect(() => {
    isMounted.current = true;
    fetchComments();
    return () => {
      isMounted.current = false;
    };
  }, [fetchComments]);

  useEffect(() => {
    if (isMounted.current) {
      const total = comments.reduce(
        (sum, c) => sum + 1 + (c.replies?.length ?? 0),
        0,
      );
      onCountChange?.(total);
    }
  }, [comments]);

  const handleCreate = async (content) => {
    const res = await fetch(`${API_BASE_URL}/api/classrooms/${classroomId}/comments`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        content,
        classroomId,
        announcementId,
        assignmentId,
      }),
    });
    if (res.ok) {
      const newComment = await res.json();
      setComments((prev) => [{ ...newComment, replies: [] }, ...prev]);
    }
  };

  const handleUpdated = (updated, parentId = null) => {
    setComments((prev) =>
      prev.map((c) => {
        if (!parentId && c.id === updated.id) return { ...c, ...updated };
        if (parentId && c.id === parentId) {
          return {
            ...c,
            replies: c.replies.map((r) =>
              r.id === updated.id ? { ...r, ...updated } : r,
            ),
          };
        }
        return c;
      }),
    );
  };

  const handleDeleted = (id, parentId = null) => {
    if (!parentId) {
      setComments((prev) => prev.filter((c) => c.id !== id));
    } else {
      setComments((prev) =>
        prev.map((c) =>
          c.id === parentId
            ? { ...c, replies: c.replies.filter((r) => r.id !== id) }
            : c,
        ),
      );
    }
  };

  const handleReplyAdded = (parentId, reply) => {
    setComments((prev) =>
      prev.map((c) =>
        c.id === parentId
          ? { ...c, replies: [...(c.replies ?? []), reply] }
          : c,
      ),
    );
  };

  return (
    <div className="comment-section fade-in">
      <div className="cs-header">
        <MessageSquare size={20} />
        <h3>Bình luận</h3>
        <span className="cs-count">{comments.length}</span>
      </div>

      {user ? (
        <CommentInput onSubmit={handleCreate} placeholder="Viết bình luận..." />
      ) : (
        <p className="cs-login-hint">Đăng nhập để bình luận</p>
      )}

      {error && <p className="cs-error">{error}</p>}

      {loading ? (
        <div className="cs-loading">
          <div className="cs-spinner" />
          <span>Đang tải...</span>
        </div>
      ) : (
        <div className="cs-list">
          {comments.length === 0 && (
            <div className="cs-empty">
              <MessageSquare size={36} />
              <p>Chưa có bình luận nào. Hãy là người đầu tiên!</p>
            </div>
          )}
          {comments.map((c) => (
            <CommentItem
              key={c.id}
              comment={c}
              classroomId={classroomId}
              announcementId={announcementId}
              assignmentId={assignmentId}
              token={token}
              onUpdated={handleUpdated}
              onDeleted={handleDeleted}
              onReplyAdded={handleReplyAdded}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentSection;
