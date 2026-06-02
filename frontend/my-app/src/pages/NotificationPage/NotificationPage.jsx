import React, { useContext, useEffect, useState } from "react";
import { Bell, Megaphone, FileText, Clock, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import "./NotificationPage.scss";
import { API_BASE_URL } from "../../config/api";



function timeAgo(dateStr) {
  if (!dateStr) return "";
  const normalized = dateStr.endsWith("Z") ? dateStr : dateStr + "Z";
  const date = new Date(normalized);
  const seconds = Math.floor((Date.now() - date) / 1000);
  if (seconds < 5) return "Vừa xong";
  if (seconds < 60) return `${seconds} giây trước`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)} phút trước`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} giờ trước`;
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDeadline(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const hours = (date - new Date()) / 3600000;
  if (hours < 0) return "Đã hết hạn";
  if (hours < 24)
    return `Hết hạn hôm nay lúc ${date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  return `Hết hạn ${date.toLocaleDateString("vi-VN")}`;
}

const NotificationPage = () => {
  const { user } = useContext(AuthContext);
  const [feedItems, setFeedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchEverything = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };

        // 1. Lấy danh sách lớp
        const classRes = await fetch(`${API_BASE_URL}/classroom/my`, { headers });
        const myClasses = await classRes.json();
        if (!Array.isArray(myClasses)) {
          setLoading(false);
          return;
        }

        const classIds = myClasses.map((c) => c.id);

        // 2. Lấy thông báo và bài tập
        const [annResults, asgResults] = await Promise.all([
          Promise.all(
            classIds.map((id) =>
              fetch(`${API_BASE_URL}/announcement/class/${id}`, { headers }).then((r) =>
                r.json(),
              ),
            ),
          ),
          Promise.all(
            classIds.map((id) =>
              fetch(`${API_BASE_URL}/assignment/class/${id}/upcoming`, { headers }).then(
                (r) => r.json(),
              ),
            ),
          ),
        ]);

        //  Format dữ liệu
        const formattedAnn = annResults.flat().map((item) => ({
          ...item,
          type: "announcement",
          className:
            myClasses.find((c) => c.id === item.classroomId)?.name || "Lớp học",
        }));

        const formattedAsg = asgResults.flat().map((item) => ({
          ...item,
          type: "assignment",
          className:
            myClasses.find((c) => c.id === item.classroomId)?.name || "Lớp học",
        }));

        const merged = [...formattedAnn, ...formattedAsg].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
        );

        setFeedItems(merged);

        //  Đánh dấu đã xem: Lưu thời điểm hiện tại và báo cho Sidebar
        localStorage.setItem("lastReadNotifications", new Date().toISOString());
        window.dispatchEvent(new Event("notificationsRead"));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEverything();
  }, [token]);

  return (
    <div className="notification-page">
      <div className="notification-container">
        <div className="page-header">
          <div className="left">
            <Link to="/" className="back-btn">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1>
                <Bell size={22} /> Thông báo
              </h1>
              <p>Xin chào, {user?.fullname || user?.Fullname}</p>
            </div>
          </div>
        </div>

        <div className="notification-list">
          {loading ? (
            <div className="empty-state">
              <p>Đang tải dữ liệu...</p>
            </div>
          ) : feedItems.length === 0 ? (
            <div className="empty-state">
              <Bell size={50} />
              <h3>Chưa có thông báo nào</h3>
            </div>
          ) : (
            feedItems.map((item) => (
              <div
                key={`${item.type}-${item.id}`}
                className={`notification-card ${item.type}`}
              >
                <div className="icon-box">
                  {item.type === "assignment" ? (
                    <FileText size={20} />
                  ) : (
                    <Megaphone size={20} />
                  )}
                </div>
                <div className="content">
                  <div className="top">
                    <span className="class-name">{item.className}</span>
                    <span className="time">{timeAgo(item.createdAt)}</span>
                  </div>
                  <h3>
                    {item.type === "assignment"
                      ? `Bài tập mới: ${item.title}`
                      : item.title}
                  </h3>
                  <p className="preview">{item.content || item.description}</p>
                  {item.type === "assignment" && item.dueDate && (
                    <div className="deadline">
                      <Clock size={14} />
                      <span>{formatDeadline(item.dueDate)}</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationPage;
