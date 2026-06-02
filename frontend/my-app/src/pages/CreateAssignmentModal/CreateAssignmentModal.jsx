import React, { useState, useEffect } from "react";
import { X, FileText, Paperclip, Send, Loader2, Clock } from "lucide-react";
import "./CreateAssignmentModal.scss";
import { API_BASE_URL } from "../../config/api";


const CreateAssignmentModal = ({ isOpen, onClose, classroomId, onRefresh }) => {
  const [asmData, setAsmData] = useState({
    title: "",
    description: "",
    dueDate: "",
    dueTime: "23:59",
    maxScore: 100,
  });

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAsmData({
        title: "",
        description: "",
        dueDate: "",
        dueTime: "23:59",
        maxScore: 100,
      });
      setSelectedFiles([]);
    }
  }, [isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAsmData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles((prev) => [...prev, ...files]);
  };

  const removeFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Ghép dueDate + dueTime thành ISO string
  const buildDueDate = () => {
    if (!asmData.dueDate) return null;
    const time = asmData.dueTime || "23:59";
    return new Date(`${asmData.dueDate}T${time}:00`).toISOString();
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    if (!asmData.title.trim()) return;

    setLoading(true);
    const token = localStorage.getItem("token");

    try {
      const payload = {
        title: asmData.title.trim(),
        description: asmData.description || "",
        dueDate: buildDueDate(),
        maxScore: parseInt(asmData.maxScore) || 100,
        classroomId: classroomId,
      };

      const res = await fetch(`${API_BASE_URL}/api/assignment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Lỗi từ server:", errorData);
        throw new Error("Lỗi khi tạo bài tập. Vui lòng kiểm tra Console.");
      }

      const assignment = await res.json();

      // Upload file đính kèm
      if (selectedFiles.length > 0) {
        for (const file of selectedFiles) {
          const formData = new FormData();
          formData.append("file", file);
          await fetch(`${API_BASE_URL}/api/assignment/${assignment.id}/files`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
          });
        }
      }

      onRefresh();
      onClose();
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="cam-overlay">
      <form className="cam-container" onSubmit={handleCreateAssignment}>
        <header className="cam-header">
          <div className="cam-header__left">
            <FileText size={20} />
            <h2>Tạo bài tập mới</h2>
          </div>
          <button type="button" onClick={onClose} className="cam-header__close">
            <X size={20} />
          </button>
        </header>

        <div className="cam-body">
          <main className="cam-main">
            {/* Tiêu đề */}
            <div className="cam-field">
              <label>Tiêu đề *</label>
              <input
                name="title"
                type="text"
                value={asmData.title}
                onChange={handleInputChange}
                required
                disabled={loading}
                placeholder="Nhập tiêu đề bài tập..."
              />
            </div>

            {/* Hướng dẫn */}
            <div className="cam-field">
              <label>Hướng dẫn</label>
              <textarea
                name="description"
                value={asmData.description}
                onChange={handleInputChange}
                disabled={loading}
                placeholder="Mô tả yêu cầu bài tập..."
              />
            </div>

            {/* Đính kèm file */}
            <div className="cam-attach">
              <label className="cam-attach__btn">
                <Paperclip size={16} /> Tải lên tài liệu
                <input
                  type="file"
                  multiple
                  hidden
                  onChange={handleFileChange}
                  disabled={loading}
                />
              </label>
              {selectedFiles.length > 0 && (
                <div className="cam-file-list">
                  {selectedFiles.map((f, i) => (
                    <div key={i} className="cam-file-item">
                      <Paperclip size={14} />
                      <span>{f.name}</span>
                      <button
                        type="button"
                        className="cam-file-remove"
                        onClick={() => removeFile(i)}
                        disabled={loading}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </main>

          <aside className="cam-side">
            {/* Điểm tối đa */}
            <div className="cam-field">
              <label>Điểm tối đa</label>
              <input
                name="maxScore"
                type="number"
                min={0}
                max={1000}
                value={asmData.maxScore}
                onChange={handleInputChange}
                disabled={loading}
              />
            </div>

            {/* Hạn chót — ngày */}
            <div className="cam-field">
              <label>Ngày hạn chót</label>
              <input
                name="dueDate"
                type="date"
                value={asmData.dueDate}
                onChange={handleInputChange}
                disabled={loading}
              />
            </div>

            {/* Hạn chót — giờ (chỉ hiện khi đã chọn ngày) */}
            {asmData.dueDate && (
              <div className="cam-field cam-field--time">
                <label>
                  <Clock size={13} /> Giờ hạn chót
                </label>
                <input
                  name="dueTime"
                  type="time"
                  value={asmData.dueTime}
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </div>
            )}

            {/* Preview hạn chót */}
            {asmData.dueDate && (
              <p className="cam-due-preview">
                Hạn nộp:{" "}
                <strong>
                  {new Date(
                    `${asmData.dueDate}T${asmData.dueTime || "23:59"}:00`,
                  ).toLocaleString("vi-VN")}
                </strong>
              </p>
            )}
          </aside>
        </div>

        <footer className="cam-footer">
          <button type="button" onClick={onClose} disabled={loading}>
            Hủy
          </button>
          <button
            type="submit"
            className="cam-btn--submit"
            disabled={loading || !asmData.title.trim()}
          >
            {loading ? (
              <Loader2 size={18} className="cam-spin" />
            ) : (
              <Send size={18} />
            )}{" "}
            Giao bài
          </button>
        </footer>
      </form>
    </div>
  );
};

export default CreateAssignmentModal;
