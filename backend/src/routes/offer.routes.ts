import { Router } from "express";
import { validate } from "../middleware/validate.middleware";
import { authenticate, adminOnly } from "../middleware/auth.middleware";
import * as offers from "../controllers/offer.controller";
import { offerSchema, offerUpdateSchema } from "../validators/offer.validator";
import { idParamsSchema } from "../validators/catalog.validator";

const router = Router();

router.get("/", offers.listOffers);
router.get("/active", offers.getActiveOffers);
router.post("/", authenticate, adminOnly, validate(offerSchema), offers.createOffer);

router.use("/:id", validate(idParamsSchema, "params"));
router.get("/:id", offers.getOfferById);
router.put("/:id", authenticate, adminOnly, validate(offerUpdateSchema), offers.updateOffer);
router.delete("/:id", authenticate, adminOnly, offers.deleteOffer);
router.patch("/:id/toggle", authenticate, adminOnly, offers.toggleOfferActive);
router.post("/:id/duplicate", authenticate, adminOnly, offers.duplicateOffer);

export default router;