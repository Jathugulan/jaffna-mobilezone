import { Router } from "express";
import { validate } from "../middleware/validate.middleware";
import { authenticate, adminOnly } from "../middleware/auth.middleware";
import * as categories from "../controllers/category.controller";
import { categorySchema, categoryUpdateSchema, idParamsSchema, slugParamsSchema } from "../validators/catalog.validator";

const router = Router();

router.get("/", categories.listCategories);
router.get("/slug/:slug", validate(slugParamsSchema, "params"), categories.getCategoryBySlug);
router.post("/", authenticate, adminOnly, validate(categorySchema), categories.createCategory);
router.post("/reorder", authenticate, adminOnly, categories.reorderCategories);
router.put("/:id", authenticate, adminOnly, validate(idParamsSchema, "params"), validate(categoryUpdateSchema), categories.updateCategory);
router.delete("/:id", authenticate, adminOnly, validate(idParamsSchema, "params"), categories.deleteCategory);

export default router;