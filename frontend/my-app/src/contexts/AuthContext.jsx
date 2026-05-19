import { createContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext();

// Helper: decode token và map ra object gọn
const extractUserFromToken = (token) => {
  if (!token) return null;
  try {
    const decoded = jwtDecode(token);
    return {
      ...decoded,
      role: decoded[
        "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
      ],
      email:
        decoded[
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
        ],
      id: decoded[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
      ],
    };
  } catch (e) {
    console.error("Token không hợp lệ:", e);
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem("token");
    const extracted = extractUserFromToken(token);
    console.log("DEBUG init user từ token:", extracted);
    return extracted;
  });

  useEffect(() => {
    console.log("DEBUG: user state:", user);
  }, [user]);

  const login = (token, userData) => {
    localStorage.setItem("token", token);
    // Vẫn lưu userData gốc nếu cần, nhưng lấy role từ token
    localStorage.setItem("user", JSON.stringify(userData));
    const userWithRole = { ...userData, ...extractUserFromToken(token) };
    console.log("DEBUG login userWithRole:", userWithRole);
    setUser(userWithRole);
  };

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
