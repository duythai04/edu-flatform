import { createContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext();

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
    const extracted = extractUserFromToken(savedToken);
    if (!extracted) return null;
    return {
      ...extracted,
      fullName: localStorage.getItem("user_name") || "",
      role: extracted.role || localStorage.getItem("user_role") || "",
    };
  });

  const getToken = () => token || localStorage.getItem("token");

  const login = (newToken, userData) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("user_name", userData.fullName || "");
    localStorage.setItem("user_role", userData.role || "");

    setToken(newToken);
    setUser({
      ...extractUserFromToken(newToken),
      fullName: userData.fullName || "",
      role: userData.role || extractUserFromToken(newToken)?.role || "",
    });

    window.location.href = "/";
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("user_name");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, getToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
