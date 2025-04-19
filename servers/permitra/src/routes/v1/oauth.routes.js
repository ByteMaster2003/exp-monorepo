import { Router } from "express";

const router = Router({
  mergeParams: true
});

router.route("/authorize").post();
router.route("/callback").post();
router.route("/userinfo").post();
router.route("/token").post();

export default router;
