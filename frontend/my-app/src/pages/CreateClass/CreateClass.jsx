import React, { useState } from "react";
import {
  Check,
  RotateCcw,
  Copy,
  Share2,
  ChevronDown,
  Loader2,
  Sparkles,
  BookOpen,
  Users,
  MessageSquare,
  Eye,
  Upload,
} from "lucide-react";
import "./CreateClass.scss";
import { API_BASE_URL } from "../../config/api";

const COLORS = [
  { hex: "#1a73e8", label: "Xanh dương" },
  { hex: "#0d9488", label: "Xanh ngọc" },
  { hex: "#ea580c", label: "Cam đậm" },
  { hex: "#dc2626", label: "Đỏ" },
  { hex: "#7c3aed", label: "Tím" },
];

const PERMISSIONS = [
  {
    id: "post",
    icon: MessageSquare,
    label: "Đăng bài & câu hỏi",
    defaultChecked: true,
  },
  {
    id: "comment",
    icon: Users,
    label: "Bình luận bài của bạn",
    defaultChecked: true,
  },
  {
    id: "viewGrades",
    icon: Eye,
    label: "Xem điểm của nhau",
    defaultChecked: false,
  },
  { id: "submit", icon: Upload, label: "Nộp bài tập", defaultChecked: true },
];

const CreateClass = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState("");
  const [loading, setLoading] = useState(false);
  const [classCode, setClassCode] = useState(null);
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [copied, setCopied] = useState(false);
  const [permissions, setPermissions] = useState(
    Object.fromEntries(PERMISSIONS.map((p) => [p.id, p.defaultChecked])),
  );

  const handleCreateClassroom = async () => {
    if (!name.trim()) {
      alert("Vui lòng nhập tên lớp học!");
      return;
    }
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${API_BASE_URL}/api/classroom`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, description }),
      });
      if (response.ok) {
        const data = await response.json();
        setClassCode(data.classCode);
      } else if (response.status === 403) {
        alert("Lỗi: Chỉ tài khoản Giáo viên mới có quyền tạo lớp!");
      } else {
        const errorMsg = await response.text();
        alert("Lỗi: " + errorMsg);
      }
    } catch (error) {
      console.error("Error creating classroom:", error);
      alert("Không thể kết nối đến máy chủ.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = async () => {
    if (!classCode) return;
    await navigator.clipboard.writeText(classCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenCode = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789";
    const code = Array.from(
      { length: 7 },
      () => chars[Math.floor(Math.random() * chars.length)],
    ).join("");
    setClassCode(code);
  };

  const togglePermission = (id) =>
    setPermissions((prev) => ({ ...prev, [id]: !prev[id] }));

  const displayCode = classCode ?? "· · · · · · ·";

  return (
    <div className="cc-root">
      <header className="cc-header">
        <div className="cc-header__icon">
          <BookOpen size={20} />
        </div>
        <div>
          <h1 className="cc-header__title">Tạo lớp học mới</h1>
          <p className="cc-header__sub">
            Học sinh tham gia bằng mã code do hệ thống tạo tự động
          </p>
        </div>
      </header>
      <div className="cc-layout">
        {/* left */}
        <div className="cc-card cc-card--main">
          <h2 className="cc-card__title">Thông tin lớp học</h2>

          <div className="cc-field">
            <label className="cc-field__label">
              Tên lớp học <span className="cc-field__required">*</span>
            </label>
            <input
              className="cc-field__input"
              type="text"
              placeholder="Nhập tên lớp học"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="cc-field">
            <label className="cc-field__label">Mô tả lớp học</label>
            <textarea
              className="cc-field__input cc-field__input--textarea"
              placeholder="Mô tả mục tiêu, nội dung, hoặc ghi chú cho lớp học..."
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="cc-row">
            <div className="cc-field cc-field--grow">
              <label className="cc-field__label">Màu chủ đề</label>
              <div className="cc-colors">
                {COLORS.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    title={c.label}
                    className={`cc-colors__dot${
                      selectedColor.hex === c.hex
                        ? " cc-colors__dot--active"
                        : ""
                    }`}
                    style={{ "--dot-color": c.hex }}
                    onClick={() => setSelectedColor(c)}
                  />
                ))}
              </div>
            </div>

            <div className="cc-field cc-field--fixed">
              <label className="cc-field__label">HS được đăng bài</label>
              <div className="cc-select-wrap">
                <select
                  className="cc-field__input cc-field__input--select"
                  defaultValue="free"
                >
                  <option value="free">Có — tự do</option>
                  <option value="moderated">Có — cần duyệt</option>
                  <option value="none">Không</option>
                </select>
                <ChevronDown className="cc-select-wrap__icon" size={16} />
              </div>
            </div>
          </div>

          <button
            className="cc-btn-create"
            onClick={handleCreateClassroom}
            disabled={loading}
            style={{ "--btn-color": selectedColor.hex }}
          >
            {loading ? (
              <Loader2 className="cc-btn-create__spinner" size={18} />
            ) : (
              <Check size={18} />
            )}
            <span>{loading ? "Đang tạo lớp..." : "Tạo lớp học"}</span>
          </button>
        </div>

        {/* right */}
        <div className="cc-side">
          <div className="cc-card cc-card--code">
            <div className="cc-card__title-row">
              <h2 className="cc-card__title">Mã lớp học</h2>
              <span className="cc-badge">
                <Sparkles size={11} />
                Tự động tạo
              </span>
            </div>

            <div
              className="cc-code-box"
              style={{ "--code-color": selectedColor.hex }}
            >
              <span className="cc-code-box__code">{displayCode}</span>
              <button
                className="cc-code-box__regen"
                onClick={handleRegenCode}
                title="Tạo mã mới"
                disabled={!classCode}
              >
                <RotateCcw size={14} />
                <span>Tạo lại</span>
              </button>
            </div>

            <p className="cc-code-desc">
              Học sinh dùng mã này để tham gia lớp. Chia sẻ qua nhắn tin hoặc
              link mời trực tiếp.
            </p>

            <div className="cc-code-actions">
              <button
                className={`cc-code-actions__btn${
                  copied ? " cc-code-actions__btn--copied" : ""
                }`}
                onClick={handleCopyCode}
                disabled={!classCode}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                <span>{copied ? "Đã sao chép!" : "Sao chép mã"}</span>
              </button>
              <button className="cc-code-actions__btn" disabled={!classCode}>
                <Share2 size={16} />
                <span>Chia sẻ link</span>
              </button>
            </div>
          </div>

          <div className="cc-card cc-card--perms">
            <h2 className="cc-card__title">Quyền hạn học sinh</h2>
            <div className="cc-perms">
              {PERMISSIONS.map(({ id, icon: Icon, label }) => (
                <label key={id} className="cc-perms__item">
                  <span className="cc-perms__icon">
                    <Icon size={15} />
                  </span>
                  <span className="cc-perms__label">{label}</span>
                  <span
                    className={`cc-toggle${permissions[id] ? " cc-toggle--on" : ""}`}
                    style={{ "--toggle-color": selectedColor.hex }}
                    onClick={() => togglePermission(id)}
                    role="checkbox"
                    aria-checked={permissions[id]}
                    tabIndex={0}
                    onKeyDown={(e) => e.key === " " && togglePermission(id)}
                  >
                    <span className="cc-toggle__thumb" />
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateClass;
