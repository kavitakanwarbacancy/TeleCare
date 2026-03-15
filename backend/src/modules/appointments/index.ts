import { Router, Request, Response, NextFunction } from "express";
import { requireAuth, requireRole, type AuthenticatedRequest } from "../../middleware";
import { toValidationError } from "../../utils/validation";
import * as appointmentsService from "./appointments.service";
import * as prescriptionsService from "../prescriptions/prescriptions.service";
import {
  appointmentIdParamSchema,
  createAppointmentSchema,
  listAppointmentsQuerySchema,
} from "./appointments.schemas";
import {
  appointmentIdParamSchema as prescriptionParamSchema,
  createPrescriptionSchema,
} from "../prescriptions/prescriptions.schemas";

const router = Router();

// ─── Appointment CRUD ─────────────────────────────────────────────────────────

/**
 * POST /appointments
 * Book a new appointment. Patient only.
 */
router.post(
  "/",
  requireAuth,
  requireRole("PATIENT"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = createAppointmentSchema.safeParse(req.body);
      if (!parsed.success) return void next(toValidationError(parsed.error));

      const { user } = req as AuthenticatedRequest;
      const result = await appointmentsService.createAppointment(user!.sub, parsed.data);
      res.status(201).json(result);
    } catch (e) {
      next(e);
    }
  },
);

/**
 * GET /appointments
 * List appointments for the caller.
 * PATIENT → their own | DOCTOR → their own | ADMIN → all
 */
router.get(
  "/",
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = listAppointmentsQuerySchema.safeParse(req.query);
      if (!parsed.success) return void next(toValidationError(parsed.error));

      const { user } = req as AuthenticatedRequest;
      const result = await appointmentsService.listAppointments(
        user!.sub,
        user!.role,
        parsed.data,
      );
      res.json(result);
    } catch (e) {
      next(e);
    }
  },
);

/**
 * GET /appointments/:appointmentId
 * Get a single appointment. Doctor, patient of that appointment, or admin.
 */
router.get(
  "/:appointmentId",
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = appointmentIdParamSchema.safeParse(req.params);
      if (!parsed.success) return void next(toValidationError(parsed.error));

      const { user } = req as AuthenticatedRequest;
      const result = await appointmentsService.getAppointment(
        parsed.data.appointmentId,
        user!.sub,
        user!.role,
      );
      res.json(result);
    } catch (e) {
      next(e);
    }
  },
);

/**
 * PATCH /appointments/:appointmentId/cancel
 * Cancel an appointment. Caller must be doctor, patient, or admin of it.
 */
router.patch(
  "/:appointmentId/cancel",
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = appointmentIdParamSchema.safeParse(req.params);
      if (!parsed.success) return void next(toValidationError(parsed.error));

      const { user } = req as AuthenticatedRequest;
      const result = await appointmentsService.cancelAppointment(
        parsed.data.appointmentId,
        user!.sub,
        user!.role,
      );
      res.json(result);
    } catch (e) {
      next(e);
    }
  },
);

// ─── Prescriptions (nested under appointment) ─────────────────────────────────

/**
 * GET /appointments/:appointmentId/prescriptions
 * Doctor, patient, or admin of that appointment.
 */
router.get(
  "/:appointmentId/prescriptions",
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = prescriptionParamSchema.safeParse(req.params);
      if (!parsed.success) return void next(toValidationError(parsed.error));

      const { user } = req as AuthenticatedRequest;
      const result = await prescriptionsService.listByAppointment(
        parsed.data.appointmentId,
        user!.sub,
        user!.role,
      );
      res.json(result);
    } catch (e) {
      next(e);
    }
  },
);

/**
 * POST /appointments/:appointmentId/prescriptions
 * Create prescription for an appointment. Doctor only; must be the appointment's doctor.
 */
router.post(
  "/:appointmentId/prescriptions",
  requireAuth,
  requireRole("DOCTOR"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const paramParsed = prescriptionParamSchema.safeParse(req.params);
      if (!paramParsed.success) return void next(toValidationError(paramParsed.error));

      const bodyParsed = createPrescriptionSchema.safeParse(req.body);
      if (!bodyParsed.success) return void next(toValidationError(bodyParsed.error));

      const { user } = req as AuthenticatedRequest;
      const result = await prescriptionsService.createPrescription(
        paramParsed.data.appointmentId,
        user!.sub,
        user!.role,
        bodyParsed.data,
      );
      res.status(201).json(result);
    } catch (e) {
      next(e);
    }
  },
);

export { router as appointmentsRouter };
