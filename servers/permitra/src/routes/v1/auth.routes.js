import { Router } from "express";
import { validate } from "shared-utils/middlewares";

import authController from "../../controllers/auth.controller.js";
import authValidation from "../../validations/auth.validation.js";
import { rateLimiter, verifyAccess } from "./../../middlewares/index.js";

const router = Router({
  mergeParams: true
});

router
  .route("/sign-up")
  .post(
    rateLimiter.threePerHour(),
    validate(authValidation.registerSchema),
    authController.register
  );

router
  .route("/sign-in")
  .post(rateLimiter.threePerHour(), validate(authValidation.loginSchema), authController.login);

router
  .route("/sign-out")
  .post(
    rateLimiter.threePerHour(),
    verifyAccess,
    validate(authValidation.logoutSchema),
    authController.logout
  );

router
  .route("/reset-password/request")
  .post(
    rateLimiter.threePerHour(),
    validate(authValidation.resetPasswordRequestSchema),
    authController.resetPasswordRequest
  );

router
  .route("/reset-password/confirm")
  .post(
    rateLimiter.threePerHour(),
    validate(authValidation.resetPasswordConfirmSchema),
    authController.resetPasswordConfirm
  );

export default router;
