declare module "ui/components" {
	import { FC } from "react";
	
	interface LoaderComponentProps {}
	interface UnauthorizedProps {}
	interface NotFoundProps {}
	interface BadRequestProps { message: string }
	interface RoleProtectedRoutesProps {
		allowedRoles?: string[];
	}
	
	const LoaderComponent: FC<LoaderComponentProps>;
	const Unauthorized: FC<UnauthorizedProps>;
	const NotFound: FC<NotFoundProps>;
	const BadRequest: FC<BadRequestProps>;
	const RoleProtectedRoutes: FC<RoleProtectedRoutesProps>;
}