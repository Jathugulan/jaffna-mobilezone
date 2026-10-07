import { Router } from "express";
import { validate } from "../middleware/validate.middleware";
import { authenticate } from "../middleware/auth.middleware";
import * as nc from "../controllers/notification.controller";

const router = Router();

router.use(authenticate);

router.get("/", nc.listNotifications);
router.patch("/read-all", nc.markAllRead);
router.patch("/:id/read", nc.markNotificationRead);

export default router;