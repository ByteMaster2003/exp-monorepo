import { Fade, Box } from "@mui/material";
import { useEffect, useState } from "react";
import { useSearchParams, Navigate } from "react-router-dom";
import { BadRequest, LoaderComponent } from "ui/components";
import { useAuth } from "ui/hooks";
import { POST } from "ui/utils";

export const AuthCallback = () => {
  const { setAccessToken, setIsAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();
  const [isError, setIsError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getAndSaveTokens = async () => {
      const authCode = searchParams.get("code");
      if (!authCode) {
        setIsLoading(false);
        return setIsError("You are not supposed to be here!");
      }

      const state = searchParams.get("state");
      const storedState = sessionStorage.getItem("oauth_state");
      sessionStorage.removeItem("oauth_state");
      if (state !== storedState) {
        setIsLoading(false);
        return setIsError("State mismatched! Potential CSRF Attack");
      }

      const payload = {
        app: "control-deck",
        code: authCode
      };

      const response = await POST(import.meta.env.VITE_PERMITRA_EXCHANGE_URI, payload);
      if (!response.success) {
        return setIsError(response.message);
      }
      setAccessToken(response.accessToken);
      setIsAuthenticated(true);

      setIsError(null);
      setIsLoading(false);
    };

    getAndSaveTokens();
  }, [searchParams, setAccessToken, setIsAuthenticated]);

  if (!isLoading && !isError) return <Navigate to="/admin" replace />;

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
      <Fade in={isLoading} timeout={{ enter: 800, exit: 400 }} unmountOnExit>
        <Box sx={{ position: "absolute" }}>
          <LoaderComponent />
        </Box>
      </Fade>

      <Fade in={!isLoading && !!isError} timeout={{ enter: 800, exit: 400 }} unmountOnExit>
        <Box sx={{ position: "absolute" }}>
          <BadRequest message={isError} />
        </Box>
      </Fade>
    </Box>
  );
};
