/// <reference path="./components/index.d.ts" />
/// <reference path="./contexts/index.d.ts" />
/// <reference path="./hooks/index.d.ts" />
/// <reference path="./providers/index.d.ts" />
/// <reference path="./utils/index.d.ts" />

declare module "ui" {
  export interface ThemeContextType {
    mode: "light" | "dark";
    prefersDarkMode: boolean;
    toggleTheme: () => void;
  }

  export interface AuthContextType {
    logout: () => Promise<void>;
    user: {
      id: string;
      role?: string;
      [key: string]: any;
    } | null;
    setUser: React.Dispatch<React.SetStateAction<null | { [key: string]: any }>>;
    isAuthenticated: boolean;
    setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
    accessToken: string | null;
    setAccessToken: React.Dispatch<React.SetStateAction<string | null>>;
  }

  export * from "ui/components";
  export * from "ui/contexts";
  export * from "ui/hooks";
  export * from "ui/providers";
  export * from "ui/utils";
}
