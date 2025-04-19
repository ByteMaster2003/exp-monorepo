import { Router } from "express";

const router = Router({
  mergeParams: true
});

router.get("/test", (_req, res) => {
  return res.status(200).json({ success: true, message: "Test request successful!" });
});

export default router;
