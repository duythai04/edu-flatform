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
import JoinClass from "./pages/JoinClass/JoinClass";

import ClassroomDetail from "./pages/ClassroomDetail/ClassDetail";
import AssignmentDetail from "./pages/AssignmentDetail/AssignmentDetail";
import SubmissionList from "./pages/SubmissionList/SubmissionList";
import NotificationPage from "./pages/NotificationPage/NotificationPage";

import "./App.css";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));

  const [isSidebarOpen, setSidebarOpen] = useState(window.innerWidth > 1024);

  useEffect(() => {
    const handleStorageChange = () => {
      setToken(localStorage.getItem("token"));
    };
    window.addEventListener("storage", handleStorageChange);

    const handleResize = () => {
      if (window.innerWidth <= 1024) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("resize", handleResize);
    };
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

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <Router>
      {!token ? (
        <AuthMain onLoginSuccess={handleLoginSuccess} />
      ) : (
        <div className="app-layout">
          <Navbar
            onToggleSidebar={toggleSidebar}
            isSidebarOpen={isSidebarOpen}
            onLogout={handleLogout}
          />

          <div className="app-container">
            <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

            <main
              className={`main-content ${isSidebarOpen ? "expanded" : "collapsed"}`}
            >
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/create-class" element={<CreateClass />} />
                <Route path="/join-class" element={<JoinClass />} />
                <Route path="/class/:id" element={<ClassroomDetail />} />
                <Route path="/assignment/:id" element={<AssignmentDetail />} />
                <Route path="/notifications" element={<NotificationPage />} />
                <Route
                  path="/assignment/:id/submissions"
                  element={<SubmissionList />}
                />
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
