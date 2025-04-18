declare module "ui/contexts" {
	import { Context } from "react";
	import { AuthContextType, ThemeContextType } from "ui";
	
	// Context Declarations
	const ThemeContext: Context<ThemeContextType>;
	const AuthContext: Context<AuthContextType>;
}
