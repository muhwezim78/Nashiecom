// Auth Context - Manages authentication state across the app
import { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "../services/api";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(authAPI.getUser());
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(
    authAPI.isAuthenticated()
  );

  useEffect(() => {
    // Check if user is authenticated on mount
    const checkAuth = async () => {
      if (authAPI.isAuthenticated()) {
        try {
          const response = await authAPI.getMe();
          setUser(response.data.user);
          setIsAuthenticated(true);
        } catch (error) {
          console.error("Auth check failed:", error);
          setUser(null);
          setIsAuthenticated(false);
        }
      }
      setLoading(false);
    };

    checkAuth();

    // Listen for logout events
    const handleLogout = () => {
      setUser(null);
      setIsAuthenticated(false);
    };

    window.addEventListener("auth:logout", handleLogout);
    return () => window.removeEventListener("auth:logout", handleLogout);
  }, []);

  const login = async (email, password) => {
    const response = await authAPI.login(email, password);
    setUser(response.data.user);
    setIsAuthenticated(true);
    return response;
  };

  const register = async (userData) => {
    const response = await authAPI.register(userData);
    setUser(response.data.user);
    setIsAuthenticated(true);
    return response;
  };

  const logout = async () => {
    await authAPI.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateProfile = async (data) => {
    const response = await authAPI.updateProfile(data);
    setUser(response.data.user);
    return response;
  };

  const isAdmin = () => {
    return user && ["ADMIN", "SUPER_ADMIN"].includes(user.role);
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    isAdmin: isAdmin(),
    login,
    register,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
