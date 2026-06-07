import React, { useState, useEffect } from "react";
import {
  X,
  FileText,
  Paperclip,
  Save,
  Loader2,
  Clock,
  Trash2,
} from "lucide-react";
import "./EditAssignmentModal.scss";
import { API_BASE_URL } from "../../config/api";
import { safeFetch } from "../../config/fetchHelper";

const EditAssignmentModal = ({ isOpen, onClose, assignment, onRefresh }) => {
  const [asmData, setAsmData] = useState({
    title: "",
    description: "",
    dueDate: "",
    dueTime: "23:59",
    maxScore: 100,
  });

  const [existingFiles, setExistingFiles] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [deletedFileIds, setDeletedFileIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    if (!isOpen || !assignment) return;

    const fetchDetail = async () => {
      setLoadingDetail(true);
      const token = localStorage.getItem("token");
      try {
        const { ok, data } = await safeFetch(
          `${API_BASE_URL}/api/assignment/${assignment.id}/detail`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        if (ok && data) {
          const due = data.dueDate ? new Date(data.dueDate) : null;
          setAsmData({
            title: data.title ?? "",
            description: data.description ?? "",
            dueDate: due ? due.toISOString().slice(0, 10) : "",
            dueTime: due ? due.toTimeString().slice(0, 5) : "23:59",
            maxScore: data.maxScore ?? 100,
          });
          setExistingFiles(data.files ?? []);
        }
      } finally {
        setLoadingDetail(false);
      }
    };

    fetchDetail();
    setNewFiles([]);
    setDeletedFileIds([]);
  }, [isOpen, assignment]);
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAsmData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNewFileChange = (e) => {
    const files = Array.from(e.target.files);
    setNewFiles((prev) => [...prev, ...files]);
  };

  const removeNewFile = (index) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Đánh dấu xoá file cũ (chưa xoá thật, chờ submit)
  const markDeleteExisting = (fileId) => {
    setDeletedFileIds((prev) => [...prev, fileId]);
    setExistingFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const buildDueDate = () => {
    if (!asmData.dueDate) return null;
    const time = asmData.dueTime || "23:59";
    return new Date(`${asmData.dueDate}T${time}:00`).toISOString();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!asmData.title.trim()) return;

    setLoading(true);
    const token = localStorage.getItem("token");

    try {
      //  Cập nhật thông tin bài tập
      const payload = {
        title: asmData.title.trim(),
        description: asmData.description || "",
        dueDate: buildDueDate(),
        maxScore: parseInt(asmData.maxScore) || 100,
      };

      const { ok, data: err } = await safeFetch(
        `${API_BASE_URL}/api/assignment/${assignment.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );

      if (!ok) {
        console.error("Lỗi cập nhật:", err);
        throw new Error("Cập nhật bài tập thất bại.");
      }

      //  Xoá các file đã đánh dấu
      for (const fileId of deletedFileIds) {
        await safeFetch(
          `${API_BASE_URL}/api/assignment/${assignment.id}/files/${fileId}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          },
        );
      }

      //  Upload file mới
      for (const file of newFiles) {
        const formData = new FormData();
        formData.append("file", file);
        await safeFetch(
          `${API_BASE_URL}/api/assignment/${assignment.id}/files`,
          {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
          },
        );
      }

      onRefresh();
      onClose();
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !assignment) return null;

  if (loadingDetail)
    return (
      <div className="cam-overlay">
        <div
          className="cam-container"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: 300,
          }}
        >
          <Loader2 size={32} className="cam-spin" />
        </div>
      </div>
    );

  return (
    <div className="cam-overlay">
      <form className="cam-container" onSubmit={handleSubmit}>
        <header className="cam-header">
          <div className="cam-header__left">
            <FileText size={20} />
            <h2>Chỉnh sửa bài tập</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="cam-header__close"
            disabled={loading}
          >
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

            {/* File đã có */}
            {existingFiles.length > 0 && (
              <div className="cam-attach">
                <p className="cam-attach__label">Tệp đính kèm hiện tại</p>
                <div className="cam-file-list">
                  {existingFiles.map((f) => (
                    <div key={f.id} className="cam-file-item">
                      <Paperclip size={14} />
                      <span>{f.fileName}</span>
                      <button
                        type="button"
                        className="cam-file-remove"
                        onClick={() => markDeleteExisting(f.id)}
                        disabled={loading}
                        title="Xoá file này"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Thêm file mới */}
            <div className="cam-attach">
              <label className="cam-attach__btn">
                <Paperclip size={16} /> Thêm tệp mới
                <input
                  type="file"
                  multiple
                  hidden
                  onChange={handleNewFileChange}
                  disabled={loading}
                />
              </label>
              {newFiles.length > 0 && (
                <div className="cam-file-list">
                  {newFiles.map((f, i) => (
                    <div key={i} className="cam-file-item cam-file-item--new">
                      <Paperclip size={14} />
                      <span>{f.name}</span>
                      <button
                        type="button"
                        className="cam-file-remove"
                        onClick={() => removeNewFile(i)}
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

            {/* Ngày hạn chót */}
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

            {/* Giờ hạn chót — chỉ hiện khi đã chọn ngày */}
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
              <Save size={18} />
            )}{" "}
            Lưu thay đổi
          </button>
        </footer>
      </form>
    </div>
  );
};

export default EditAssignmentModal;
