import { createContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext();

// Helper: decode token → map user gọn
const extractUserFromToken = (token) => {
  if (!token) return null;

  try {
    const decoded = jwtDecode(token);

    return {
      id:
        decoded[
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
        ] || decoded.sub,

      email:
        decoded[
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
        ] || decoded.email,

      role:
        decoded[
          "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
        ] || decoded.role,

      exp: decoded.exp,
    };
  } catch (e) {
    console.error("Token không hợp lệ:", e);
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("token"));

  const [user, setUser] = useState(() => {
    const savedToken = localStorage.getItem("token");
    return extractUserFromToken(savedToken);
  });

  useEffect(() => {
    console.log("DEBUG user:", user);
    console.log("DEBUG token:", token);
  }, [user, token]);

  const login = (newToken, userData) => {
    localStorage.setItem("token", newToken);

    // optional: lưu user để dùng UI
    localStorage.setItem("user", JSON.stringify(userData));

    setToken(newToken);

    const extractedUser = extractUserFromToken(newToken);

    setUser({
      ...userData,
      ...extractedUser,
    });
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
