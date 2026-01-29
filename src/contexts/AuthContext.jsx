import { createContext, useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import baseApi from "../api/baseApi";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const location = useLocation();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
  try {
    const res = await baseApi.get("/api/me");
    setUser(res.data);
  } catch (err) {
    if (err.response?.status === 401) {
      // ✅ Expected when not logged in
      setUser(null);
    } else {
      console.error(err);
    }
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    if (location.pathname === "/login") {
      setLoading(false);
      return;
    }

    fetchUser();
  }, [location.pathname]);

  const isAuthenticated = !!user;
  const role = user?.role;
  const permissions = user?.permissions || [];

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        permissions,
        isAuthenticated,
        loading,
        fetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
