import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

// Create context
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is logged in on initial load
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        console.log("Checking authentication...");

        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/profile`, {
          withCredentials: true,  // ✅ Ensures cookies are sent if backend uses sessions
        });

        console.log("Auth response:", response.data);

        setCurrentUser(response.data.user);
        setIsAuthenticated(true);
      } catch (err) {
        console.error("Auth check failed:", err.message);
        setCurrentUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Register user
  const register = async (userData) => {
    try {
      setError(null);
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/register`, userData);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
      throw err;
    }
  };

  // Login user
  const login = async (credentials) => {
    try {
      setError(null);
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/login`, credentials, {
        withCredentials: true,  // ✅ Ensures cookies are set
      });

      console.log("Login successful:", response.data);

      setCurrentUser(response.data.user);
      setIsAuthenticated(true);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
      throw err;
    }
  };

  // Logout user
  const logout = async () => {
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/logout`, {}, { withCredentials: true });

      setCurrentUser(null);
      setIsAuthenticated(false);
    } catch (err) {
      setError(err.response?.data?.error || "Logout failed");
    }
  };

  // Update user tokens
  const updateUserTokens = (newTokens) => {
    if (currentUser) {
      setCurrentUser({
        ...currentUser,
        tokens: newTokens,
      });
    }
  };

  // Context value
  const value = {
    currentUser,
    isAuthenticated,
    loading,
    error,
    register,
    login,
    logout,
    updateUserTokens,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
