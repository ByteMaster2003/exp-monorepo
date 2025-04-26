import { nanoid } from "nanoid";
import { useAuth } from "ui/hooks";

import { AppConfig } from "../config.js";

export const Login = () => {
  const { setUser, setAccessToken, setIsAuthenticated } = useAuth();

  setUser(null);
  setAccessToken(null);
  setIsAuthenticated(false);

  const state = nanoid();
  sessionStorage.setItem("oauth_state", state);
  const redirectUrl = `${AppConfig.SERVERS.PERMITRA_UI}?app=${AppConfig.APP}&state=${state}`;

  // Redirect user to login page
  window.location.href = redirectUrl;
};
