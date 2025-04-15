import { useEffect, useState } from "react";

import { LoaderComponent } from "../components/loader.jsx";
import { AuthContext } from "../contexts/index.js";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const logout = async () => {
    // await LogOut();
    setUser(null);
    setIsAuthenticated(false);
  };

  const checkAuthStatus = async () => {
    // const response = await getAuthStatus();
    const response = { success: true, user: { name: "Test User" } };

    if (response.success) {
      setUser(response.user);
      setIsAuthenticated(true);
    } else if (response.message && response.message.includes("Expired signature")) {
      // const newResponse = await refreshToken();
      const newResponse = { success: true, user: { name: "Test User" } };
      if (newResponse.success) {
        setUser(newResponse.auth);
        setIsAuthenticated(true);
      }
    } else {
      setUser(null);
      setIsAuthenticated(false);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const value = {
    logout,
    user,
    isAuthenticated,
    checkAuthStatus
  };

  if (isLoading) {
    return <LoaderComponent />;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
