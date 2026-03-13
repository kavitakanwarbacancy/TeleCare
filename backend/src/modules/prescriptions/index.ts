import { Router, Request, Response, NextFunction } from "express";
import { requireAuth, type AuthenticatedRequest } from "../../middleware";
import { toValidationError } from "../../utils/validation";
import * as prescriptionsService from "./prescriptions.service";
import { prescriptionIdParamSchema } from "./prescriptions.schemas";

const router = Router();

/**
 * GET /prescriptions/:id
 * Get a prescription by ID. Doctor, patient, or admin with access to that prescription.
 */
router.get(
  "/:id",
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = prescriptionIdParamSchema.safeParse(req.params);
      if (!parsed.success) {
        next(toValidationError(parsed.error));
        return;
      }
      const { user } = req as AuthenticatedRequest;
      if (!user) {
        next(new Error("Authentication required"));
        return;
      }
      const result = await prescriptionsService.getById(
        parsed.data.id,
        user.sub,
        user.role
      );
      res.json(result);
    } catch (e) {
      next(e);
    }
  }
);

export { router as prescriptionsRouter };