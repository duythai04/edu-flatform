import React, { useState, useEffect } from "react";
import {
  X,
  FileText,
  Paperclip,
  Link as LinkIcon,
  Play,
  Calendar,
  Send,
  Loader2,
} from "lucide-react";
import "./CreateAssignmentModal.scss";

const CreateAssignmentModal = ({ isOpen, onClose, classroomId, onRefresh }) => {
  const [asmData, setAsmData] = useState({
    title: "",
    description: "",
    dueDate: "",
    maxScore: 100,
  });

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAsmData({ title: "", description: "", dueDate: "", maxScore: 100 });
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

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem("token");

    try {
      let formattedDate = null;
      if (asmData.dueDate) {
        formattedDate = new Date(asmData.dueDate).toISOString();
      }

      const payload = {
        title: asmData.title,
        description: asmData.description || "",
        dueDate: formattedDate,
        maxScore: parseInt(asmData.maxScore),
        classroomId: classroomId,
      };

      console.log("Payload gửi đi:", payload);

      const res = await fetch(`http://localhost:5187/api/assignment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        // Nếu Backend vẫn báo lỗi "dto is required", hãy thử đổi dòng dưới thành:
        // body: JSON.stringify({ dto: payload }),
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Chi tiết lỗi từ Server:", errorData);
        // Nếu lỗi vẫn là "The dto field is required", nghĩa là bạn cần bọc payload lại
        if (errorData.errors && errorData.errors.dto) {
          throw new Error(
            "Backend yêu cầu bọc dữ liệu trong 'dto'. Hãy thử sửa lại body gửi đi.",
          );
        }
        throw new Error("Lỗi khi tạo bài tập. Vui lòng kiểm tra Console.");
      }

      const assignment = await res.json();

      // Upload file
      if (selectedFiles.length > 0) {
        for (const file of selectedFiles) {
          const formData = new FormData();
          formData.append("file", file);

          await fetch(
            `http://localhost:5187/api/assignment/${assignment.id}/files`,
            {
              method: "POST",
              headers: { Authorization: `Bearer ${token}` },
              body: formData,
            },
          );
        }
      }

      alert("Tạo bài tập thành công!");
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
            <div className="cam-field">
              <label>Tiêu đề *</label>
              <input
                name="title"
                type="text"
                value={asmData.title}
                onChange={handleInputChange}
                required
                disabled={loading}
              />
            </div>
            <div className="cam-field">
              <label>Hướng dẫn</label>
              <textarea
                name="description"
                value={asmData.description}
                onChange={handleInputChange}
                disabled={loading}
              />
            </div>
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
              <div className="cam-file-list">
                {selectedFiles.map((f, i) => (
                  <div key={i} className="cam-file-item">
                    <Paperclip size={14} /> {f.name}
                  </div>
                ))}
              </div>
            </div>
          </main>

          <aside className="cam-side">
            <div className="cam-field">
              <label>Điểm tối đa</label>
              <input
                name="maxScore"
                type="number"
                value={asmData.maxScore}
                onChange={handleInputChange}
                disabled={loading}
              />
            </div>
            <div className="cam-field">
              <label>Hạn chót</label>
              <input
                name="dueDate"
                type="date"
                value={asmData.dueDate}
                onChange={handleInputChange}
                disabled={loading}
              />
            </div>
          </aside>
        </div>

        <footer className="cam-footer">
          <button type="button" onClick={onClose} disabled={loading}>
            Hủy
          </button>
          <button type="submit" className="cam-btn--submit" disabled={loading}>
            {loading ? <Loader2 className="cam-spin" /> : <Send size={18} />}{" "}
            Giao bài
          </button>
        </footer>
      </form>
    </div>
  );
};

export default CreateAssignmentModal;
