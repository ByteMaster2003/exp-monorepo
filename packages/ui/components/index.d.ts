declare module "ui/components" {
	import { FC } from "react";
	
	interface LoaderComponentProps {}
	interface UnauthorizedProps {}
	interface NotFoundProps {}
	interface RoleProtectedRoutesProps {
		allowedRoles?: string[];
	}
	
	const LoaderComponent: FC<LoaderComponentProps>;
	const Unauthorized: FC<UnauthorizedProps>;
	const NotFound: FC<NotFoundProps>;
	const RoleProtectedRoutes: FC<RoleProtectedRoutesProps>;

}