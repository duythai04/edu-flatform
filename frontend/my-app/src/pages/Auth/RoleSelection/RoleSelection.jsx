import React from "react";
import { GraduationCap, Users, ArrowLeft, ChevronRight, Sparkles } from "lucide-react";
import './RoleSelection.scss';

const RoleSelection = ({ onSelectRole, onBack }) => {
  return (
    <div className="role-selection-wrapper">
      {/* Nút quay lại tinh tế hơn */}
      <button className="btn-back-link" onClick={onBack}>
        <ArrowLeft size={16} />
        <span>Trở lại đăng nhập</span>
      </button>

      <div className="role-header">
        <div className="badge">
          <Sparkles size={14} />
          <span>Bắt đầu ngay</span>
        </div>
        <h2>Bạn tham gia với tư cách nào?</h2>
        <p>Chào mừng bạn đến với EduClass. Hãy chọn vai trò phù hợp để chúng tôi chuẩn bị trải nghiệm tốt nhất cho bạn.</p>
      </div>

      <div className="role-options-list">
        {/* Lựa chọn Giáo viên */}
        <div className="role-card-item teacher-card" onClick={() => onSelectRole("Teacher")}>
          <div className="role-card-content">
            <div className="role-visual">
              <div className="icon-container">
                <GraduationCap size={30} />
              </div>
            </div>
            <div className="role-text">
              <h3>Tôi là Giáo viên</h3>
              <p>Tạo khóa học, quản lý bài giảng và theo dõi lộ trình học tập của học viên.</p>
            </div>
            <div className="role-action">
              <ChevronRight size={20} className="arrow" />
            </div>
          </div>
          {/* Một dải màu nhấn nhỏ phía dưới hoặc bên cạnh */}
          <div className="card-accent"></div>
        </div>

        {/* Lựa chọn Học sinh */}
        <div className="role-card-item student-card" onClick={() => onSelectRole("Student")}>
          <div className="role-card-content">
            <div className="role-visual">
              <div className="icon-container">
                <Users size={30} />
              </div>
            </div>
            <div className="role-text">
              <h3>Tôi là Học sinh</h3>
              <p>Tham gia lớp học, trao đổi bài giảng và hoàn thành các bài kiểm tra.</p>
            </div>
            <div className="role-action">
              <ChevronRight size={20} className="arrow" />
            </div>
          </div>
          <div className="card-accent"></div>
        </div>
      </div>

      <div className="role-footer-note">
        <p>Bạn vẫn chưa chắc chắn? <a href="#support">Tìm hiểu thêm về vai trò</a></p>
      </div>
    </div>
  );
};

export default RoleSelection;