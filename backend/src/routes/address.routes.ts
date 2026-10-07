import { Router } from "express";
import { validate } from "../middleware/validate.middleware";
import { authenticate } from "../middleware/auth.middleware";
import * as addresses from "../controllers/address.controller";
import { addressSchema, addressUpdateSchema } from "../validators/commerce.validator";
import { idParamsSchema } from "../validators/catalog.validator";

const router = Router();

router.use(authenticate);

router.get("/", addresses.listAddresses);
router.post("/", validate(addressSchema), addresses.createAddress);
router.put("/:id/default", validate(idParamsSchema, "params"), addresses.setDefaultAddress);
router.put("/:id", validate(idParamsSchema, "params"), validate(addressUpdateSchema), addresses.updateAddress);
router.delete("/:id", validate(idParamsSchema, "params"), addresses.deleteAddress);

export default router;