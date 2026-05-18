import { createContext, useEffect, useState } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Kiểm tra trực tiếp khi khởi tạo
    const savedUser = localStorage.getItem("user");
    console.log("DEBUG: Dữ liệu thô từ LocalStorage:", savedUser);

    if (savedUser && savedUser !== "undefined") {
      try {
        const parsed = JSON.parse(savedUser);
        console.log("DEBUG: Dữ liệu sau khi Parse:", parsed);
        return parsed;
      } catch (e) {
        console.error("DEBUG: Lỗi Parse JSON", e);
        return null;
      }
    }
    return null;
  });

  // Cập nhật thêm một useEffect để theo dõi sự thay đổi của state
  useEffect(() => {
    console.log("DEBUG: State 'user' đã thay đổi thành:", user);
  }, [user]);

  const login = (token, userData) => {
    console.log("DEBUG: Hàm login được gọi với:", userData);
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };
  // logout
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
