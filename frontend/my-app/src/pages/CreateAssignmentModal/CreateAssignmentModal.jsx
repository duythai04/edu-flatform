import React, { useState, useEffect } from "react";
import {
  X,
  FileText,
  Paperclip,
  Link as LinkIcon,
  Play, 
  Image as ImageIcon,
  Calendar,
  Send,
  Loader2,
  ChevronDown,
} from "lucide-react";
import "./CreateAssignmentModal.scss";

const CreateAssignmentModal = ({ isOpen, onClose, classroomId, onRefresh }) => {
  const [asmData, setAsmData] = useState({
    title: "",
    description: "",
    dueDate: "",
    maxScore: 100,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAsmData({ title: "", description: "", dueDate: "", maxScore: 100 });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAsmData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    if (!asmData.title.trim()) {
      alert("Vui lòng nhập tiêu đề bài tập!");
      return;
    }

    setLoading(true);
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`http://localhost:5187/api/assignment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...asmData,
          classroomId: classroomId,
        }),
      });

      if (res.ok) {
        onRefresh();
        onClose();
      } else {
        const errorText = await res.text();
        alert("Lỗi khi tạo bài tập: " + errorText);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Không thể kết nối đến máy chủ.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cam-overlay">
      <form className="cam-container" onSubmit={handleCreateAssignment}>
        <header className="cam-header">
          <div className="cam-header__left">
            <div className="cam-header__icon">
              <FileText size={20} />
            </div>
            <h2>Tạo bài tập mới</h2>
          </div>
          <button type="button" className="cam-header__close" onClick={onClose}>
            <X size={20} />
          </button>
        </header>

        <div className="cam-body">
          <main className="cam-main">
            <div className="cam-field">
              <label className="cam-field__label">
                Tiêu đề bài tập <span className="cam-required">*</span>
              </label>
              <input
                name="title"
                className="cam-field__input"
                type="text"
                placeholder="Ví dụ: Kiểm tra giữa kỳ"
                value={asmData.title}
                onChange={handleInputChange}
                disabled={loading}
              />
            </div>

            <div className="cam-field">
              <label className="cam-field__label">Hướng dẫn chi tiết</label>
              <textarea
                name="description"
                className="cam-field__input cam-field__input--textarea"
                placeholder="Mô tả các yêu cầu cho học sinh..."
                value={asmData.description}
                onChange={handleInputChange}
                disabled={loading}
              />
            </div>

            <div className="cam-attach">
              <p className="cam-attach__title">Đính kèm tài liệu</p>
              <div className="cam-attach__btns">
                <button type="button" className="cam-attach__item">
                  <Paperclip size={16} /> <span>Tải lên</span>
                </button>
                <button type="button" className="cam-attach__item">
                  <LinkIcon size={16} /> <span>Link</span>
                </button>
                <button type="button" className="cam-attach__item">
                  <Play size={16} /> <span>Video</span> {/* Đổi ở đây */}
                </button>
              </div>
            </div>
          </main>

          <aside className="cam-side">
            <div className="cam-select-group">
              <label className="cam-field__label">Thang điểm tối đa</label>
              <div className="cam-input-wrap">
                <input
                  type="number"
                  name="maxScore"
                  value={asmData.maxScore}
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="cam-select-group">
              <label className="cam-field__label">Hạn chót nộp bài</label>
              <div className="cam-input-wrap">
                <Calendar size={16} className="cam-input-icon" />
                <input
                  type="date"
                  name="dueDate"
                  value={asmData.dueDate}
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="cam-info-box">
              <p>
                Lưu ý: Sau khi giao, học sinh trong lớp sẽ nhận được thông báo
                về bài tập này.
              </p>
            </div>
          </aside>
        </div>

        <footer className="cam-footer">
          <button
            type="button"
            className="cam-btn cam-btn--cancel"
            onClick={onClose}
            disabled={loading}
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            className="cam-btn cam-btn--submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="cam-spin" />
                <span>Đang lưu...</span>
              </>
            ) : (
              <>
                <Send size={18} />
                <span>Giao bài tập</span>
              </>
            )}
          </button>
        </footer>
      </form>
    </div>
  );
};

export default CreateAssignmentModal;
