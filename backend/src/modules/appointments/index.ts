import { Router, Request, Response, NextFunction } from "express";
import { requireAuth, requireRole, type AuthenticatedRequest } from "../../middleware";
import { toValidationError } from "../../utils/validation";
import * as prescriptionsService from "../prescriptions/prescriptions.service";
import {
  appointmentIdParamSchema,
  createPrescriptionSchema,
} from "../prescriptions/prescriptions.schemas";

const router = Router();

/**
 * GET /appointments/:appointmentId/prescriptions
 * List prescriptions for an appointment. Doctor, patient, or admin of that appointment.
 */
router.get(
  "/:appointmentId/prescriptions",
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = appointmentIdParamSchema.safeParse(req.params);
      if (!parsed.success) {
        next(toValidationError(parsed.error));
        return;
      }
      const { user } = req as AuthenticatedRequest;
      if (!user) {
        next(new Error("Authentication required"));
        return;
      }
      const result = await prescriptionsService.listByAppointment(
        parsed.data.appointmentId,
        user.sub,
        user.role
      );
      res.json(result);
    } catch (e) {
      next(e);
    }
  }
);

/**
 * POST /appointments/:appointmentId/prescriptions
 * Create prescription for an appointment. Doctor-only; must be the appointment's doctor.
 */
router.post(
  "/:appointmentId/prescriptions",
  requireAuth,
  requireRole("DOCTOR"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const paramParsed = appointmentIdParamSchema.safeParse(req.params);
      if (!paramParsed.success) {
        next(toValidationError(paramParsed.error));
        return;
      }
      const bodyParsed = createPrescriptionSchema.safeParse(req.body);
      if (!bodyParsed.success) {
        next(toValidationError(bodyParsed.error));
        return;
      }
      const { user } = req as AuthenticatedRequest;
      if (!user) {
        next(new Error("Authentication required"));
        return;
      }
      const result = await prescriptionsService.createPrescription(
        paramParsed.data.appointmentId,
        user.sub,
        user.role,
        bodyParsed.data
      );
      res.status(201).json(result);
    } catch (e) {
      next(e);
    }
  }
);

// Booking, rescheduling, listing, status transitions - to be implemented

export { router as appointmentsRouter };