import { Router } from "express";
import { validate } from "../middleware/validate.middleware";
import { authenticate, customerOrAdmin } from "../middleware/auth.middleware";
import {
  createOrderSchema,
  updateOrderStatusSchema,
  cancelOrderSchema,
  returnOrderSchema,
} from "../validators/commerce.validator";
import { idParamsSchema } from "../validators/catalog.validator";
import * as orders from "../controllers/order.controller";

const router = Router();

router.post("/", authenticate, customerOrAdmin, validate(createOrderSchema), orders.createOrder);
router.get("/", authenticate, customerOrAdmin, orders.myOrders);
router.get("/:id", authenticate, customerOrAdmin, validate(idParamsSchema, "params"), orders.myOrderDetail);
router.post("/:id/cancel", authenticate, customerOrAdmin, validate(idParamsSchema, "params"), validate(cancelOrderSchema), orders.cancelOrder);
router.post("/:id/return", authenticate, customerOrAdmin, validate(idParamsSchema, "params"), validate(returnOrderSchema), orders.requestReturn);
router.post("/:id/reorder", authenticate, customerOrAdmin, validate(idParamsSchema, "params"), orders.reorder);

export default router;

export { updateOrderStatusSchema };