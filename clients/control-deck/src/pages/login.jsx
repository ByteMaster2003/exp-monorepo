import { nanoid } from "nanoid";
import { useAuth } from "ui/hooks";

export const Login = () => {
  const { setUser, setAccessToken, setIsAuthenticated } = useAuth();
  const config = import.meta.env;

  setUser(null);
  setAccessToken(null);
  setIsAuthenticated(false);

  const state = nanoid();
  sessionStorage.setItem("oauth_state", state);
  const redirectUrl = `${config.VITE_PERMITRA_URI}?app=${config.VITE_CLIENT_APP}&state=${state}`;

  // Redirect user to login page
  window.location.href = redirectUrl;
};
