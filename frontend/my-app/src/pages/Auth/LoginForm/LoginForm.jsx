import React, { useState } from "react";
import { Loader2 } from "lucide-react";

const LoginForm = ({ onSwitchToRegister, onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5187/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        // data lúc này là AuthResponseDto: { accessToken, fullName, role, email }
        localStorage.setItem("user_name", data.fullName);
        localStorage.setItem("user_role", data.role);

        onLoginSuccess(data.accessToken); // Truyền token ra App.js
      } else {
        const errorText = await response.text();
        setError(errorText || "Email hoặc mật khẩu không đúng.");
      }
    } catch (err) {
      setError("Lỗi kết nối máy chủ.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form">
      <h2>Đăng nhập</h2>
      <p>Sử dụng tài khoản EduClass của bạn</p>

      {error && (
        <div
          className="error-message"
          style={{ color: "red", textAlign: "center", marginBottom: "10px" }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleLogin}>
        <div className="input-group">
          <label>Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="input-group">
          <label>Mật khẩu</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button className="btn-main" disabled={loading}>
          {loading ? <Loader2 className="spinner" size={18} /> : "Đăng nhập"}
        </button>
      </form>

      <div className="auth-footer">
        Chưa có tài khoản?{" "}
        <span onClick={onSwitchToRegister}>Đăng ký ngay</span>
      </div>
    </div>
  );
};

export default LoginForm;
