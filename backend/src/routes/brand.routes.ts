import { Router } from "express";
import { validate } from "../middleware/validate.middleware";
import { authenticate, adminOnly } from "../middleware/auth.middleware";
import * as brands from "../controllers/brand.controller";
import { brandSchema, brandUpdateSchema, idParamsSchema, slugParamsSchema } from "../validators/catalog.validator";

const router = Router();

router.get("/", brands.listBrands);
router.get("/slug/:slug", validate(slugParamsSchema, "params"), brands.getBrandBySlug);
router.post("/", authenticate, adminOnly, validate(brandSchema), brands.createBrand);
router.post("/reorder", authenticate, adminOnly, brands.reorderBrands);
router.get("/:id", validate(idParamsSchema, "params"), brands.getBrandById);
router.put("/:id", authenticate, adminOnly, validate(idParamsSchema, "params"), validate(brandUpdateSchema), brands.updateBrand);
router.delete("/:id", authenticate, adminOnly, validate(idParamsSchema, "params"), brands.deleteBrand);

export default router;