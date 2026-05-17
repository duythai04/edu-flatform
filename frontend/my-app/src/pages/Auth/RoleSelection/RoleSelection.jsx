import React from "react";
import { GraduationCap, Users } from "lucide-react";

const RoleSelection = ({ onSelectRole }) => {
  return (
    <div className="role-selection">
      <h2>Chào mừng bạn đến với EduClass</h2>
      <p>Vui lòng chọn vai trò để bắt đầu</p>

      <div className="role-grid">
        <div className="role-item" onClick={() => onSelectRole("Teacher")}>
          <div className="icon teacher-icon">
            <GraduationCap size={40} />
          </div>
          <h3>Giáo viên</h3>
          <span>Tạo lớp và quản lý học sinh</span>
        </div>

        <div className="role-item" onClick={() => onSelectRole("Student")}>
          <div className="icon student-icon">
            <Users size={40} />
          </div>
          <h3>Học sinh</h3>
          <span>Tham gia và làm bài tập</span>
        </div>
      </div>
    </div>
  );
};
export default RoleSelection;
