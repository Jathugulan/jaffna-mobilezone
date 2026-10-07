import { Router } from "express";
import { validate } from "../middleware/validate.middleware";
import { authenticate, adminOnly } from "../middleware/auth.middleware";
import * as admin from "../controllers/admin.controller";
import * as orders from "../controllers/order.controller";
import { couponSchema } from "../validators/offer.validator";
import { updateOrderStatusSchema } from "../validators/commerce.validator";
import { idParamsSchema } from "../validators/catalog.validator";
import { adminUserStatusSchema } from "../validators/auth.validator";

const router = Router();

router.use(authenticate, adminOnly);

router.get("/stats", admin.adminStats);
router.get("/audit-logs", admin.listAuditLogs);

router.get("/orders", orders.adminOrders);
router.get("/orders/:id", validate(idParamsSchema, "params"), orders.adminOrderDetail);
router.put("/orders/:id/status", validate(idParamsSchema, "params"), validate(updateOrderStatusSchema), orders.adminUpdateOrderStatus);
router.post("/orders/:id/refund", validate(idParamsSchema, "params"), orders.adminRefundOrder);
router.post("/orders/:id/approve-return", validate(idParamsSchema, "params"), orders.adminApproveReturn);

router.get("/users", orders.adminCustomers);
router.get("/users/:id", validate(idParamsSchema, "params"), orders.adminCustomerDetail);
router.put("/users/:id/status", validate(idParamsSchema, "params"), validate(adminUserStatusSchema), orders.adminCustomerStatus);

router.get("/coupons", admin.listCoupons);
router.post("/coupons", validate(couponSchema), admin.createCoupon);
router.put("/coupons/:id", validate(idParamsSchema, "params"), validate(couponSchema.partial()), admin.updateCoupon);
router.delete("/coupons/:id", validate(idParamsSchema, "params"), admin.deleteCoupon);

router.get("/settings", admin.getSettings);
router.put("/settings", admin.updateSettings);

export default router;