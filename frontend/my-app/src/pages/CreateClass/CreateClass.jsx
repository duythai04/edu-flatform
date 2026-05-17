import React, { useState } from "react";
import { Check, RotateCcw, Copy, Share2, ChevronDown } from "lucide-react";
import "./CreateClass.scss";

const CreateClass = () => {
  const [selectedColor, setSelectedColor] = useState("#7c3aed");
  const colors = ["#7c3aed", "#0d9488", "#ea580c", "#dc2626", "#2563eb"];

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
            <input type="text" placeholder="giải tích" />
          </div>

          <div className="input-group">
            <label>Mô tả lớp học</label>
            <textarea placeholder="Học kì I" rows="4"></textarea>
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

          <button className="btn-create">
            <Check size={20} />
            <span>Tạo lớp học</span>
          </button>
        </div>

        {/* CỘT PHẢI: MÃ CODE & QUYỀN HẠN */}
        <div className="side-column">
          {/* CARD MÃ LỚP HỌC */}
          <div className="form-card code-card">
            <h2 className="card-title">Mã lớp học (tự động tạo)</h2>
            <div className="code-display-box">
              <span className="code-text">S 1 6 2 J X L</span>
              <button className="btn-regenerate">
                <RotateCcw size={16} />
                <span>Tạo lại</span>
              </button>
            </div>
            <p className="code-desc">
              Học sinh dùng mã này để tham gia lớp. Bạn có thể chia sẻ qua link
              hoặc nhắn thẳng mã code.
            </p>
            <div className="code-actions">
              <button className="btn-outline">
                <Copy size={18} />
                <span>Sao chép mã</span>
              </button>
              <button className="btn-outline">
                <Share2 size={18} />
                <span>Chia sẻ link</span>
              </button>
            </div>
          </div>

          {/* CARD QUYỀN HẠN */}
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
