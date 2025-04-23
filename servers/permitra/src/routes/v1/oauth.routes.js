import { Router } from "express";
import { validate } from "shared-utils/middlewares";

import oauthController from "../../controllers/oauth.controller.js";
import { rateLimiter, verifyAccess } from "../../middlewares/index.js";
import authValidation from "../../validations/auth.validation.js";

const router = Router({
  mergeParams: true
});

router
  .route("/google/authorize")
  .get(
    rateLimiter.threePerHour(),
    validate(authValidation.oauthRedirect),
    oauthController.authorizeGoogle
  );
router.route("/google/callback").get(rateLimiter.threePerHour(), oauthController.googleCallback);

router
  .route("/github/authorize")
  .get(
    rateLimiter.threePerHour(),
    validate(authValidation.oauthRedirect),
    oauthController.authorizeGitHub
  );
router.route("/github/callback").get(rateLimiter.threePerHour(), oauthController.githubCallback);

router
  .route("/userinfo")
  .get(
    rateLimiter.fivePerMinute(),
    verifyAccess,
    validate(authValidation.getUserInfoSchema),
    oauthController.getUserInfo
  );
router
  .route("/token")
  .post(
    rateLimiter.threePerHour(),
    validate(authValidation.exchangeTokenWithCode),
    oauthController.exchangeTokenWithCode
  );
router
  .route("/refresh")
  .post(
    rateLimiter.threePerHour(),
    validate(authValidation.refreshTokens),
    oauthController.refreshTokens
  );

export default router;
