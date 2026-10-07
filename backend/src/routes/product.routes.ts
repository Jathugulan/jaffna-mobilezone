import { Router } from "express";
import { validate } from "../middleware/validate.middleware";
import { authenticate, adminOnly } from "../middleware/auth.middleware";
import * as products from "../controllers/product.controller";
import { getBrandProducts } from "../controllers/brand.controller";
import {
  createProductSchema,
  updateProductSchema,
  productQuerySchema,
  idParamsSchema,
  slugParamsSchema,
} from "../validators/catalog.validator";

const router = Router();

router.get("/search", products.searchProducts);
router.get("/slug/:slug", validate(slugParamsSchema, "params"), products.getProductBySlug);
router.get("/brand/:slug", getBrandProducts);
router.get("/", validate(productQuerySchema, "query"), products.listProducts);
router.post("/", authenticate, adminOnly, validate(createProductSchema), products.createProduct);
router.get("/:id", validate(idParamsSchema, "params"), products.getProductById);
router.put("/:id", authenticate, adminOnly, validate(idParamsSchema, "params"), validate(updateProductSchema), products.updateProduct);
router.delete("/:id", authenticate, adminOnly, validate(idParamsSchema, "params"), products.deleteProduct);
router.post("/:id/duplicate", authenticate, adminOnly, validate(idParamsSchema, "params"), products.duplicateProduct);
router.patch("/:id/publish", authenticate, adminOnly, validate(idParamsSchema, "params"), products.togglePublish);

export default router;