import { z } from "zod";

const uuid = z.string().uuid("Invalid ID format");

export const appointmentIdParamSchema = z.object({
  appointmentId: uuid,
});

export const createAppointmentSchema = z.object({
  doctorId: uuid,
  /** ISO 8601 datetime string */
  scheduledAt: z.string().datetime({ message: "scheduledAt must be a valid ISO 8601 datetime" }),
  durationMinutes: z.number().int().min(15).max(120).default(30),
  reason: z.string().max(500).optional().nullable(),
});

export const listAppointmentsQuerySchema = z.object({
  status: z
    .enum([
      "PENDING",
      "CONFIRMED",
      "COMPLETED",
      "CANCELLED_BY_PATIENT",
      "CANCELLED_BY_DOCTOR",
      "NO_SHOW",
    ])
    .optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
