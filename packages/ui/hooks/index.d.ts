declare module "ui/hooks" {
	import { AuthContextType, ThemeContextType } from "ui";
	
	function useAuth(): AuthContextType;
	function useTheme(): ThemeContextType;
}
