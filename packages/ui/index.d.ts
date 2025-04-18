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
		isAuthenticated: boolean;
		checkAuthStatus: () => Promise<void>;
	}

	export * from "ui/components"
	export * from "ui/contexts"
	export * from "ui/hooks"
	export * from "ui/providers"
	export * from "ui/utils"
}
