import { Router, Request, Response, NextFunction } from "express";
import {
  requireAuth,
  requireRole,
  type AuthenticatedRequest,
} from "../../middleware";
import { toValidationError } from "../../utils/validation";
import * as doctorsService from "./doctors.service";
import {
  doctorIdParamSchema,
  listDoctorsQuerySchema,
  updateDoctorProfileSchema,
} from "./doctors.schemas";

const router = Router();

/**
 * PUT /doctors/me
 * Update own doctor profile. Doctor-only. Must be defined before /:id.
 */
router.put(
  "/me",
  requireAuth,
  requireRole("DOCTOR"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = updateDoctorProfileSchema.safeParse(req.body);
      if (!parsed.success) {
        next(toValidationError(parsed.error));
        return;
      }
      const userId = (req as AuthenticatedRequest).user!.sub;
      const result = await doctorsService.updateMyProfile(userId, parsed.data);
      res.json(result);
    } catch (e) {
      next(e);
    }
  },
);

/**
 * GET /doctors
 * List doctors with optional filters (specialization, verified) and pagination.
 */
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = listDoctorsQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      next(toValidationError(parsed.error));
      return;
    }
    const result = await doctorsService.listDoctors(parsed.data);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

/**
 * GET /doctors/:id
 * Get doctor public profile by ID.
 */
router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = doctorIdParamSchema.safeParse(req.params);
    if (!parsed.success) {
      next(toValidationError(parsed.error));
      return;
    }
    const result = await doctorsService.getDoctorById(parsed.data.id);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

/**
 * GET /doctors/:id/availability
 * Get doctor's weekly availability.
 */
router.get(
  "/:id/availability",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = doctorIdParamSchema.safeParse(req.params);
      if (!parsed.success) {
        next(toValidationError(parsed.error));
        return;
      }
      const result = await doctorsService.getAvailability(parsed.data.id);
      res.json(result);
    } catch (e) {
      next(e);
    }
  },
);

export { router as doctorsRouter };
