import { PrismaClient, Role, AppointmentStatus, Gender } from "../generated/prisma";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

async function main() {
  console.log("🌱 Seeding database...\n");

  // Create test doctor
  const doctorPassword = await hashPassword("doctor123");
  const doctor = await prisma.user.upsert({
    where: { email: "doctor@test.com" },
    update: {},
    create: {
      name: "Dr. Sarah Johnson",
      email: "doctor@test.com",
      passwordHash: doctorPassword,
      role: Role.DOCTOR,
      emailVerified: true,
      doctorProfile: {
        create: {
          specialization: "General Medicine",
          experienceYears: 8,
          bio: "Experienced general practitioner with focus on preventive care.",
          consultationFee: 50.00,
          isActive: true,
        },
      },
    },
    include: { doctorProfile: true },
  });
  console.log(`✅ Doctor: ${doctor.email} (password: doctor123)`);

  // Create test patient
  const patientPassword = await hashPassword("patient123");
  const patient = await prisma.user.upsert({
    where: { email: "patient@test.com" },
    update: {},
    create: {
      name: "John Doe",
      email: "patient@test.com",
      passwordHash: patientPassword,
      role: Role.PATIENT,
      emailVerified: true,
      patient: {
        create: {
          dateOfBirth: new Date("1995-06-15"),
          gender: Gender.MALE,
        },
      },
    },
    include: { patient: true },
  });
  console.log(`✅ Patient: ${patient.email} (password: patient123)`);

  // Create test appointment (scheduled for 10 minutes from now)
  const scheduledTime = new Date();
  scheduledTime.setMinutes(scheduledTime.getMinutes() + 10);

  // Check if appointment already exists for this patient/doctor combo
  let appointment = await prisma.appointment.findFirst({
    where: {
      patientId: patient.patient!.id,
      doctorId: doctor.doctorProfile!.id,
    },
  });

  if (!appointment) {
    appointment = await prisma.appointment.create({
      data: {
        patientId: patient.patient!.id,
        doctorId: doctor.doctorProfile!.id,
        scheduledAt: scheduledTime,
        durationMinutes: 30,
        status: AppointmentStatus.CONFIRMED,
        reason: "General checkup and consultation",
      },
    });
  }
  console.log(`✅ Appointment: ${appointment.id}`);
  console.log(`   Scheduled: ${scheduledTime.toLocaleString()}`);

  console.log("\n✨ Seed complete!\n");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("TEST CREDENTIALS:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Doctor:  doctor@test.com / doctor123");
  console.log("Patient: patient@test.com / patient123");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`\nAppointment ID: ${appointment.id}`);
  console.log(`\nTest URLs:`);
  console.log(`  Patient: http://localhost:3000/patient/consultation/${appointment.id}`);
  console.log(`  Doctor:  http://localhost:3000/doctor/consultation/${appointment.id}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
