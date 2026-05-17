import React, { useState } from 'react';
import RoleSelection from './RoleSelection/RoleSelection';
import RegisterForm from './RegisterForm/RegisterForm';
import LoginForm from './LoginForm/LoginForm';
import './Auth.scss';

const AuthMain = ({ onLoginSuccess }) => {
  const [view, setView] = useState('ROLE_SELECT'); // ROLE_SELECT, REGISTER, LOGIN
  const [role, setRole] = useState(null); // 'Teacher' hoặc 'Student'

  // Chuyển sang màn hình Đăng ký sau khi chọn vai trò
  const handleSelectRole = (selectedRole) => {
    setRole(selectedRole);
    setView('REGISTER');
  };

  // Hàm trung gian nhận token từ LoginForm và gửi lên App.js
  const handleFinalLogin = (token) => {
    onLoginSuccess(token);
  };

  return (
    <div className="auth-overlay">
      <div className="auth-container">
        {view === 'ROLE_SELECT' && (
          <RoleSelection onSelectRole={handleSelectRole} />
        )}

        {view === 'REGISTER' && (
          <RegisterForm 
            role={role} 
            onBack={() => setView('ROLE_SELECT')} 
            onSwitchToLogin={() => setView('LOGIN')} 
          />
        )}

        {view === 'LOGIN' && (
          <LoginForm 
            onSwitchToRegister={() => setView('ROLE_SELECT')} 
            onLoginSuccess={handleFinalLogin}
          />
        )}
      </div>
    </div>
  );
};

export default AuthMain;