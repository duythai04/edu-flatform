import React, { useState } from "react";
import {
  Check,
  RotateCcw,
  Copy,
  Share2,
  ChevronDown,
  Loader2,
} from "lucide-react";
import "./CreateClass.scss";

const CreateClass = () => {
  // 1. State quản lý form
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [classCode, setClassCode] = useState("------"); 

  const [selectedColor, setSelectedColor] = useState("#7c3aed");
  const colors = ["#7c3aed", "#0d9488", "#ea580c", "#dc2626", "#2563eb"];

  // 2. Hàm gọi API tạo lớp học
  const handleCreateClassroom = async () => {
    if (!name.trim()) {
      alert("Vui lòng nhập tên lớp học!");
      return;
    }

    setLoading(true);
    const token = localStorage.getItem("token");

    try {
      const response = await fetch("http://localhost:5187/api/classroom", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Gửi token để Backend check Role "Teacher"
        },
        body: JSON.stringify({
          name: name,
          description: description,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Backend trả về object Classroom có ClassCode
        setClassCode(data.classCode);
        alert("Tạo lớp học thành công!");
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

  // 3. Hàm sao chép mã lớp
  const handleCopyCode = () => {
    if (classCode === "------") return;
    navigator.clipboard.writeText(classCode);
    alert("Đã sao chép mã lớp: " + classCode);
  };

  return (
    <div className="create-class-container">
      <header className="create-class-header">
        <h1>Tạo lớp học mới</h1>
      </header>

      <div className="create-class-content">
        {/* CỘT TRÁI: THÔNG TIN LỚP HỌC */}
        <div className="form-card main-info">
          <h2 className="card-title">Thông tin lớp học</h2>

          <div className="input-group">
            <label>Tên lớp học *</label>
            <input
              type="text"
              placeholder="Ví dụ: Giải tích 1"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="input-group">
            <label>Mô tả lớp học</label>
            <textarea
              placeholder="Ví dụ: Học kì I - Nhóm 01"
              rows="4"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
            ></textarea>
          </div>

          <div className="form-row-flex">
            <div className="input-group color-picker-section">
              <label>Màu chủ đề</label>
              <div className="color-list">
                {colors.map((color) => (
                  <div
                    key={color}
                    className={`color-dot ${selectedColor === color ? "active" : ""}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setSelectedColor(color)}
                  />
                ))}
              </div>
            </div>

            <div className="input-group permission-select">
              <label>Cho phép học sinh đăng bài</label>
              <div className="select-wrapper">
                <select defaultValue="Có">
                  <option value="Có">Có — đặ...</option>
                  <option value="Không">Không</option>
                </select>
                <ChevronDown className="select-icon" size={18} />
              </div>
            </div>
          </div>

          <button
            className="btn-create"
            onClick={handleCreateClassroom}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="spinner" size={20} />
            ) : (
              <Check size={20} />
            )}
            <span>{loading ? "Đang xử lý..." : "Tạo lớp học"}</span>
          </button>
        </div>

        {/* CỘT PHẢI: MÃ CODE & QUYỀN HẠN */}
        <div className="side-column">
          <div className="form-card code-card">
            <h2 className="card-title">Mã lớp học (tự động tạo)</h2>
            <div className="code-display-box">
              <span className="code-text">
                {/* Hiển thị classCode từ API hoặc placeholder */}
                {classCode.split("").join(" ")}
              </span>
              <button
                className="btn-regenerate"
                onClick={() => alert("Chức năng đang phát triển")}
              >
                <RotateCcw size={16} />
                <span>Tạo lại</span>
              </button>
            </div>
            <p className="code-desc">
              Học sinh dùng mã này để tham gia lớp. Bạn có thể chia sẻ qua link
              hoặc nhắn thẳng mã code.
            </p>
            <div className="code-actions">
              <button className="btn-outline" onClick={handleCopyCode}>
                <Copy size={18} />
                <span>Sao chép mã</span>
              </button>
              <button className="btn-outline">
                <Share2 size={18} />
                <span>Chia sẻ link</span>
              </button>
            </div>
          </div>

          <div className="form-card permissions-card">
            <h2 className="card-title">Quyền hạn học sinh</h2>
            <div className="checkbox-list">
              <label className="checkbox-item">
                <input type="checkbox" defaultChecked />
                <span>Đăng bài & câu hỏi</span>
              </label>
              <label className="checkbox-item">
                <input type="checkbox" defaultChecked />
                <span>Bình luận bài của bạn</span>
              </label>
              <label className="checkbox-item">
                <input type="checkbox" />
                <span>Xem điểm của nhau</span>
              </label>
              <label className="checkbox-item">
                <input type="checkbox" defaultChecked />
                <span>Nộp bài tập</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateClass;
