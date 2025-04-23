import { Fade, Box } from "@mui/material";
import { useEffect, useState } from "react";

import { LoaderComponent } from "../components/loader.jsx";
import { AuthContext } from "../contexts/index.js";
import { GET, POST } from "../utils/request.util.js";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessToken, setAccessToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const skipAuthStatus = ["/unauthorized", "/oauth/callback", "/login"].includes(
    window.location.pathname
  );

  const logout = async () => {
    setUser(null);
    setIsAuthenticated(false);
    setAccessToken(null);
  };

  useEffect(() => {
    const config = import.meta.env;

    // Function to refresh tokens
    const refreshTokens = async () => {
      const refreshResponse = await POST(config.VITE_PERMITRA_REFRESH_URI, {});

      if (!refreshResponse.success) {
        window.location.href = config.VITE_LOGIN_ENDPOINT;
      }
      return refreshResponse;
    };

    // Function to get user info
    const getUserInfo = async () => {
      return await GET(config.VITE_PERMITRA_GET_USER_INFO, {
        Authorization: `Bearer ${accessToken}`
      });
    };

    const checkAuthStatus = async () => {
      const response = await getUserInfo();

      // Refresh tokens if invalid
      if (!response.success && response.message === "Invalid access token") {
        const { accessToken: newAccessToken, user } = await refreshTokens();

        setAccessToken(newAccessToken);
        setUser(user);
      } else {
        setUser(response?.user);
      }

      setIsAuthenticated(true);
      setIsLoading(false);
    };

    if (!skipAuthStatus && !isAuthenticated) {
      checkAuthStatus();
    }
  }, [accessToken, isAuthenticated, skipAuthStatus]);

  const value = {
    logout,
    user,
    setUser,
    accessToken,
    setAccessToken,
    isAuthenticated,
    setIsAuthenticated
  };

  if (skipAuthStatus || !isLoading || isAuthenticated)
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        position: "relative"
      }}
    >
      <Fade in={isLoading} timeout={500} unmountOnExit>
        <Box sx={{ position: "absolute" }}>
          <LoaderComponent />
        </Box>
      </Fade>
    </Box>
  );
};
