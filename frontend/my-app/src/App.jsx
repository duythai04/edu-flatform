import { useState } from 'react';
import Navbar from './components/Common/Navbar/Navbar';
import Sidebar from './components/Common/Sidebar/Sidebar';
import Home from './pages/Home/Home';

// Import file global style để reset CSS và định nghĩa biến SCSS
import './styles/global.scss'; 

function App() {
  // Quản lý trạng thái đóng/mở của Sidebar tại đây để cả Navbar và Sidebar đều dùng được
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="app-wrapper">
      {/* Navbar luôn nằm trên cùng */}
      <Navbar onToggleSidebar={toggleSidebar} />

      <div className="app-body">
        {/* Sidebar nằm bên trái */}
        <Sidebar isOpen={isSidebarOpen} />

        {/* Nội dung chính nằm bên phải, thay đổi tùy theo trang (sau này dùng React Router) */}
        <main className={`main-content ${!isSidebarOpen ? 'full-width' : ''}`}>
          <Home />
        </main>
      </div>

      <style jsx>{`
        .app-wrapper {
          display: flex;
          flex-direction: column;
          height: 100vh;
          overflow: hidden;
        }
        .app-body {
          display: flex;
          flex: 1;
          overflow: hidden;
        }
        .main-content {
          flex: 1;
          overflow-y: auto;
          background-color: #ffffff;
          transition: all 0.3s ease;
        }
      `}</style>
    </div>
  );
}

export default App;