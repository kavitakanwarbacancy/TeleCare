import { prisma } from "../../db";
import type { Prisma, AppointmentStatus } from "../../../generated/prisma";

function serviceError(message: string, status: number, code: string): never {
  const err = new Error(message) as Error & { status?: number; code?: string };
  err.status = status;
  err.code = code;
  throw err;
}

/** Consistent shape returned for any appointment query. */
const appointmentSelect = {
  id: true,
  scheduledAt: true,
  durationMinutes: true,
  status: true,
  reason: true,
  videoRoomId: true,
  meetingLink: true,
  sessionStartedAt: true,
  sessionEndedAt: true,
  createdAt: true,
  doctor: {
    select: {
      id: true,
      specialization: true,
      consultationFee: true,
      user: { select: { id: true, name: true, email: true } },
    },
  },
  patient: {
    select: {
      id: true,
      user: { select: { id: true, name: true, email: true } },
    },
  },
} as const;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CreateAppointmentData {
  doctorId: string;
  scheduledAt: string;
  durationMinutes: number;
  reason?: string | null;
}

export interface ListAppointmentsParams {
  status?: AppointmentStatus;
  page: number;
  limit: number;
}

// ─── Create ───────────────────────────────────────────────────────────────────

/**
 * Book a new appointment.
 * - Resolves patient + doctor profiles from their user IDs.
 * - Rejects with 409 if the doctor already has an overlapping PENDING/CONFIRMED appointment.
 */
export async function createAppointment(patientUserId: string, data: CreateAppointmentData) {
  const patient = await prisma.patient.findUnique({ where: { userId: patientUserId } });
  if (!patient) serviceError("Patient profile not found", 404, "NOT_FOUND");

  const doctor = await prisma.doctorProfile.findUnique({ where: { id: data.doctorId } });
  if (!doctor || !doctor.isActive) {
    serviceError("Doctor not found or not accepting appointments", 404, "NOT_FOUND");
  }

  const scheduledAt = new Date(data.scheduledAt);
  const durationMs = data.durationMinutes * 60_000;
  const endAt = new Date(scheduledAt.getTime() + durationMs);

  // Any existing active appointment whose start time falls inside the new slot window is a conflict.
  const conflict = await prisma.appointment.findFirst({
    where: {
      doctorId: data.doctorId,
      status: { in: ["PENDING", "CONFIRMED"] },
      scheduledAt: {
        gte: new Date(scheduledAt.getTime() - durationMs), // starts at most one slot before
        lt: endAt,                                          // starts before this slot ends
      },
    },
  });

  if (conflict) {
    serviceError(
      "This time slot is already booked. Please choose a different slot.",
      409,
      "CONFLICT",
    );
  }

  return prisma.appointment.create({
    data: {
      patientId: patient!.id,
      doctorId: data.doctorId,
      scheduledAt,
      durationMinutes: data.durationMinutes,
      reason: data.reason ?? null,
      status: "PENDING",
    },
    select: appointmentSelect,
  });
}

// ─── List ─────────────────────────────────────────────────────────────────────

/**
 * List appointments scoped to the caller's role:
 *   PATIENT → only their appointments
 *   DOCTOR  → only their appointments
 *   ADMIN   → all appointments
 */
export async function listAppointments(
  userId: string,
  role: string,
  params: ListAppointmentsParams,
) {
  const { status, page, limit } = params;
  const where: Prisma.AppointmentWhereInput = {};

  if (role === "PATIENT") {
    const patient = await prisma.patient.findUnique({ where: { userId } });
    if (!patient) serviceError("Patient profile not found", 404, "NOT_FOUND");
    where.patientId = patient!.id;
  } else if (role === "DOCTOR") {
    const doctor = await prisma.doctorProfile.findUnique({ where: { userId } });
    if (!doctor) serviceError("Doctor profile not found", 404, "NOT_FOUND");
    where.doctorId = doctor!.id;
  }

  if (status) where.status = status;

  const [data, total] = await Promise.all([
    prisma.appointment.findMany({
      where,
      select: appointmentSelect,
      orderBy: { scheduledAt: "asc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.appointment.count({ where }),
  ]);

  return { data, total, page, limit };
}

// ─── Get ──────────────────────────────────────────────────────────────────────

/** Fetch a single appointment, enforcing that only its doctor, patient, or an admin can view it. */
export async function getAppointment(appointmentId: string, userId: string, role: string) {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    select: appointmentSelect,
  });

  if (!appointment) serviceError("Appointment not found", 404, "NOT_FOUND");

  if (role !== "ADMIN") {
    const isDoctor = appointment!.doctor.user.id === userId;
    const isPatient = appointment!.patient.user.id === userId;
    if (!isDoctor && !isPatient) serviceError("Access denied", 403, "FORBIDDEN");
  }

  return appointment;
}

// ─── Cancel ───────────────────────────────────────────────────────────────────

/**
 * Cancel an appointment.
 * Sets CANCELLED_BY_PATIENT or CANCELLED_BY_DOCTOR depending on who cancels.
 * Admins cancel as CANCELLED_BY_DOCTOR by convention.
 */
export async function cancelAppointment(appointmentId: string, userId: string, role: string) {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    select: {
      id: true,
      status: true,
      doctor: { select: { user: { select: { id: true } } } },
      patient: { select: { user: { select: { id: true } } } },
    },
  });

  if (!appointment) serviceError("Appointment not found", 404, "NOT_FOUND");

  const isDoctor = appointment!.doctor.user.id === userId;
  const isPatient = appointment!.patient.user.id === userId;

  if (role !== "ADMIN" && !isDoctor && !isPatient) {
    serviceError("Access denied", 403, "FORBIDDEN");
  }

  const terminalStatuses: AppointmentStatus[] = [
    "COMPLETED",
    "CANCELLED_BY_PATIENT",
    "CANCELLED_BY_DOCTOR",
  ];
  if (terminalStatuses.includes(appointment!.status as AppointmentStatus)) {
    serviceError(
      `Cannot cancel an appointment with status: ${appointment!.status}`,
      400,
      "BAD_REQUEST",
    );
  }

  const newStatus: AppointmentStatus =
    isPatient ? "CANCELLED_BY_PATIENT" : "CANCELLED_BY_DOCTOR";

  return prisma.appointment.update({
    where: { id: appointmentId },
    data: { status: newStatus },
    select: appointmentSelect,
  });
}
