import { createContext, useContext, useEffect, useState } from "react";
import baseApi from "../api/baseApi";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
  try {
    const res = await baseApi.get("/api/me");
    setUser(res.data);
  } catch {
    setUser(null);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchUser();
  }, []);

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
