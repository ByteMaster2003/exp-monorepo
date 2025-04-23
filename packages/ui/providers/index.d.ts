declare module "ui/providers" {
  import { ReactNode, FC } from "react";
  
  interface ThemeProviderProps {
    children: ReactNode;
  }
  
  interface AuthProviderProps {
    children: ReactNode;
  }
  
  const ThemeProvider: FC<ThemeProviderProps>;
  const AuthProvider: FC<AuthProviderProps>;
}
