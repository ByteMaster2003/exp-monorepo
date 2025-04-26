import { Router } from "express";

import logsRoutes from "./logs.routes.js";

const router = Router({
  mergeParams: true
});

router.use("/logs", logsRoutes);

export default router;
