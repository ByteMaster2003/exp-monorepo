import { Router } from "express";
import { validate } from "shared-utils/middlewares";

import logsController from "../../controllers/logs.controller.js";
import { rateLimiter, verifyAccess } from "../../middlewares/index.js";
import logsValidation from "../../validations/logs.validation.js";

const router = Router({
  mergeParams: true
});

router
  .route("/")
  .get(
    rateLimiter.fiveHundredPerHour(),
    verifyAccess,
    validate(logsValidation.queryLogsSchema),
    logsController.queryLogs
  );

export default router;
