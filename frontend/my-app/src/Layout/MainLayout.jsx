import React, { useState } from 'react';
import Navbar from '../components/Common/Navbar/Navbar';
import Sidebar from '../components/Common/Sidebar/Sidebar';

const MainLayout = ({ children }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div>
      <Navbar onToggleSidebar={() => setSidebarOpen(!isSidebarOpen)} />
      <div style={{ display: 'flex' }}>
        <Sidebar isOpen={isSidebarOpen} />
        <main style={{ flex: 1, background: '#fff' }}>
          {children}
        </main>
      </div>
    </div>
  );
};