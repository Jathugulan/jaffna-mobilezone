import { Router } from "express";
import { z } from "zod";
import { validate } from "../middleware/validate.middleware";
import { authenticate } from "../middleware/auth.middleware";
import * as users from "../controllers/user.controller";
import { updateProfileSchema, changePasswordSchema, imageUrlSchema } from "../validators/auth.validator";

const profilePictureSchema = z
  .object({
    profilePicture: imageUrlSchema,
  })
  .strict();

const router = Router();

router.get("/me", authenticate, users.getMe);
router.put("/me", authenticate, validate(updateProfileSchema), users.updateMe);
router.delete("/me", authenticate, users.deleteMe);
router.put("/me/password", authenticate, validate(changePasswordSchema), users.updatePassword);
router.put("/me/profile-picture", authenticate, validate(profilePictureSchema), users.setProfilePicture);
router.delete("/me/profile-picture", authenticate, users.removeProfilePicture);

export default router;
export { profilePictureSchema };