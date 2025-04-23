import { Router } from "express";

import authRoutes from "./auth.routes.js";
import oauthRoutes from "./oauth.routes.js";

const router = Router({
  mergeParams: true
});

router.use("/auth", authRoutes);
router.use("/oauth", oauthRoutes);

export default router;
