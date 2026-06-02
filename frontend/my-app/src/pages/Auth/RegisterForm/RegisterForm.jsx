import React, { useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { API_BASE_URL } from "../../../config/api";

const RegisterForm = ({ role, onBack, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
        // Thay port của bạn vào
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
          role: role, // 'Teacher' hoặc 'Student'
        }),
      });

      if (response.ok) {
        alert("Đăng ký thành công! Mời bạn đăng nhập.");
        onSwitchToLogin();
      } else {
        const errorText = await response.text();
        setError(errorText || "Đăng ký thất bại, vui lòng thử lại.");
      }
    } catch (err) {
      setError("Không thể kết nối đến máy chủ.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form">
      <button className="back-btn" onClick={onBack}>
        <ArrowLeft size={18} />
      </button>
      <h2>Đăng ký tài khoản</h2>
      <p>
        Vai trò:{" "}
        <strong>{role === "Teacher" ? "Giáo viên" : "Học sinh"}</strong>
      </p>

      {error && (
        <div
          className="error-message"
          style={{ color: "red", textAlign: "center", marginBottom: "10px" }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label>Họ và tên</label>
          <input
            type="text"
            required
            placeholder="Nhập tên"
            onChange={(e) =>
              setFormData({ ...formData, fullName: e.target.value })
            }
          />
        </div>
        <div className="input-group">
          <label>Email</label>
          <input
            type="email"
            required
            placeholder="email@gmail.com"
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />
        </div>
        <div className="input-group">
          <label>Mật khẩu</label>
          <input
            type="password"
            required
            placeholder="••••••••"
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
          />
        </div>

        <button className="btn-main" disabled={loading}>
          {loading ? <Loader2 className="spinner" size={18} /> : "Đăng ký ngay"}
        </button>
      </form>

      <div className="auth-footer">
        Đã có tài khoản? <span onClick={onSwitchToLogin}>Đăng nhập</span>
      </div>
    </div>
  );
};

export default RegisterForm;
