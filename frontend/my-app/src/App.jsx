import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Navbar from "./components/Common/Navbar/Navbar";
import Sidebar from "./components/Common/Sidebar/Sidebar";

import Home from "./pages/Home/Home";
import CreateClass from "./pages/CreateClass/CreateClass";
import AuthMain from "./pages/Auth/Auth";

import "./App.css";

function App() {
  // 1. Khởi tạo state token từ localStorage
  const [token, setToken] = useState(localStorage.getItem("token"));

  // 2. Quản lý trạng thái Sidebar
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  // Lắng nghe sự thay đổi của localStorage (để đồng bộ nếu mở nhiều tab)
  useEffect(() => {
    const handleStorageChange = () => {
      setToken(localStorage.getItem("token"));
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleLoginSuccess = (newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <Router>
      {/* 
          LOGIC QUYẾT ĐỊNH:
          - Người mới (không token): Chỉ thấy màn hình Auth (Role -> Register -> Login).
          - Người đã đăng nhập: Thấy toàn bộ hệ thống Navbar/Sidebar/Routes.
      */}
      {!token ? (
        <AuthMain onLoginSuccess={handleLoginSuccess} />
      ) : (
        <div
          className={`app-layout ${!isSidebarOpen ? "sidebar-collapsed" : ""}`}
        >
          <Navbar
            onToggleSidebar={toggleSidebar}
            isSidebarOpen={isSidebarOpen}
            onLogout={handleLogout}
          />

          <div className="app-container">
            <Sidebar isOpen={isSidebarOpen} />

            <main className="main-content">
              <Routes>
                {/* Trang chủ sau khi vào app */}
                <Route path="/" element={<Home />} />

                {/* Trang tạo lớp */}
                <Route path="/create-class" element={<CreateClass />} />

                {/* Nếu người dùng đã login mà cố tình gõ link lung tung, đẩy về trang chủ */}
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </main>
          </div>
        </div>
      )}
    </Router>
  );
}

export default App;
