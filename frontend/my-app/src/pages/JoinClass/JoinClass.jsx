import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  KeyRound,
  Info,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { AuthContext } from "../../contexts/AuthContext";
import "./JoinClass.scss";
import { API_BASE_URL } from "../../config/api";
import { safeFetch } from "../../config/fetchHelper";

const JoinClass = () => {
  const [classCode, setClassCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: null, message: "" });

  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleJoin = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    setLoading(true);
    setStatus({ type: null, message: "" });
    try {
      const { ok, data } = await safeFetch(
        `${API_BASE_URL}/api/classroom/join`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ Code: classCode.trim() }),
        },
      );

      if (!ok) {
        const msg = typeof data === "string" ? data : data?.message;
        throw new Error(msg || "Lỗi khi tham gia lớp học");
      }

      setStatus({ type: "success", message: "Tham gia lớp học thành công!" });
      setTimeout(() => navigate("/"), 1500);
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="join-class-container">
      <div className="join-class-card">
        {/* Nút quay lại */}
        <Link to="/" className="back-link">
          <ArrowLeft size={20} />
          <span>Quay lại</span>
        </Link>

        <div className="card-header">
          <div className="icon-wrapper">
            <KeyRound size={32} />
          </div>
          <h1>Tham gia lớp học</h1>
          <p>Nhập mã lớp do giáo viên cung cấp để bắt đầu học tập.</p>
        </div>

        <form onSubmit={handleJoin} className="join-form">
          <div className="input-group">
            <label htmlFor="classCode">Mã lớp học</label>
            <input
              type="text"
              id="classCode"
              placeholder="VD: ABC123"
              value={classCode}
              onChange={(e) => setClassCode(e.target.value.toUpperCase())}
              maxLength={10}
              disabled={loading}
              autoFocus
            />
          </div>

          {status.message && (
            <div className={`status-box ${status.type}`}>
              {status.type === "success" ? (
                <CheckCircle2 size={18} />
              ) : (
                <AlertCircle size={18} />
              )}
              <span>{status.message}</span>
            </div>
          )}

          <div className="info-box">
            <Info size={18} />
            <ul>
              <li>Mã lớp thường gồm 6-7 ký tự (chữ và số).</li>
              <li>
                Sử dụng tài khoản <strong>{user?.Email || user?.email}</strong>{" "}
                để tham gia.
              </li>
            </ul>
          </div>

          <button
            type="submit"
            className={`btn-submit ${loading ? "loading" : ""}`}
            disabled={loading || !classCode.trim()}
          >
            {loading ? "Đang xử lý..." : "Tham gia ngay"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default JoinClass;
