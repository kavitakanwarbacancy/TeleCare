import { prisma } from "../../db";
import type { Prisma } from "../../../generated/prisma";

function serviceError(message: string, status: number, code: string): never {
  const err = new Error(message) as Error & { status?: number; code?: string };
  err.status = status;
  err.code = code;
  throw err;
}

const doctorListSelect = {
  id: true,
  userId: true,
  specialization: true,
  experienceYears: true,
  bio: true,
  consultationFee: true,
  registrationNumber: true,
  degree: true,
  verified: true,
  isActive: true,
  user: {
    select: { name: true, email: true },
  },
} as const;

export interface ListDoctorsParams {
  specialization?: string;
  verified?: boolean;
  page: number;
  limit: number;
}

export interface ListDoctorsResult {
  data: Array<{
    id: string;
    userId: string;
    specialization: string;
    experienceYears: number | null;
    bio: string | null;
    consultationFee: Prisma.Decimal | null;
    registrationNumber: string | null;
    degree: string | null;
    verified: boolean;
    isActive: boolean;
    user: { name: string; email: string };
  }>;
  total: number;
  page: number;
  limit: number;
}

export async function listDoctors(params: ListDoctorsParams): Promise<ListDoctorsResult> {
  const { specialization, verified, page, limit } = params;

  const where: Prisma.DoctorProfileWhereInput = {
    isActive: true,
  };
  if (specialization?.trim()) {
    where.specialization = { contains: specialization.trim(), mode: "insensitive" };
  }
  if (verified !== undefined) {
    where.verified = verified;
  }

  const [data, total] = await Promise.all([
    prisma.doctorProfile.findMany({
      where,
      select: doctorListSelect,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.doctorProfile.count({ where }),
  ]);

  return {
    data: data.map((d) => ({
      ...d,
      consultationFee: d.consultationFee,
    })),
    total,
    page,
    limit,
  };
}

export async function getDoctorById(id: string) {
  const doctor = await prisma.doctorProfile.findUnique({
    where: { id },
    select: doctorListSelect,
  });
  if (!doctor) {
    serviceError("Doctor not found", 404, "NOT_FOUND");
  }
  return doctor;
}

export async function getAvailability(doctorId: string) {
  const doctor = await prisma.doctorProfile.findUnique({
    where: { id: doctorId },
    select: { id: true },
  });
  if (!doctor) {
    serviceError("Doctor not found", 404, "NOT_FOUND");
  }

  const availability = await prisma.doctorAvailability.findMany({
    where: { doctorId },
    orderBy: [{ weekday: "asc" }, { startTime: "asc" }],
    select: {
      id: true,
      weekday: true,
      startTime: true,
      endTime: true,
      slotDuration: true,
      bufferTime: true,
    },
  });

  return { availability };
}

export interface UpdateDoctorProfileData {
  specialization?: string;
  experienceYears?: number;
  bio?: string | null;
  consultationFee?: number | null;
  registrationNumber?: string | null;
  degree?: string | null;
  isActive?: boolean;
}

export async function updateMyProfile(userId: string, data: UpdateDoctorProfileData) {
  const profile = await prisma.doctorProfile.findUnique({
    where: { userId },
  });
  if (!profile) {
    serviceError("Doctor profile not found", 404, "NOT_FOUND");
  }

  const updateData: Prisma.DoctorProfileUpdateInput = {};
  if (data.specialization !== undefined) updateData.specialization = data.specialization;
  if (data.experienceYears !== undefined) updateData.experienceYears = data.experienceYears;
  if (data.bio !== undefined) updateData.bio = data.bio;
  if (data.consultationFee !== undefined) updateData.consultationFee = data.consultationFee;
  if (data.registrationNumber !== undefined) updateData.registrationNumber = data.registrationNumber;
  if (data.degree !== undefined) updateData.degree = data.degree;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;

  const updated = await prisma.doctorProfile.update({
    where: { userId },
    data: updateData,
    select: doctorListSelect,
  });

  return updated;
}
