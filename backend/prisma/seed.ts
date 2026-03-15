import { PrismaClient, Role, AppointmentStatus, Gender } from "../generated/prisma";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const hash = (pw: string) => bcrypt.hash(pw, 10);

// Relative date helpers
const daysFromNow = (n: number, hour = 10, minute = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  d.setHours(hour, minute, 0, 0);
  return d;
};

// ─── Availability builder (all weekdays for a given time window) ──────────────
function availability(startTime: string, endTime: string, weekdays: number[]) {
  return weekdays.map((weekday) => ({ weekday, startTime, endTime, slotDuration: 30, bufferTime: 5 }));
}

async function main() {
  console.log("🌱 Seeding TeleCare database...\n");

  // ─── DOCTORS ───────────────────────────────────────────────────────────────

  const doctorSeeds = [
    {
      name: "Dr. Sarah Johnson",
      email: "sarah.johnson@telecare.dev",
      specialization: "General Medicine",
      experienceYears: 8,
      bio: "Experienced general practitioner focused on preventive care and chronic disease management. Committed to patient education and holistic wellness.",
      consultationFee: 50,
      city: "Bangalore",
      state: "Karnataka",
      availability: availability("09:00", "17:00", [1, 2, 3, 4, 5]), // Mon–Fri
    },
    {
      name: "Dr. Michael Chen",
      email: "michael.chen@telecare.dev",
      specialization: "Cardiology",
      experienceYears: 15,
      bio: "Board-certified cardiologist specialising in heart failure, arrhythmia, and preventive cardiology. Published researcher with 40+ peer-reviewed papers.",
      consultationFee: 150,
      city: "Mumbai",
      state: "Maharashtra",
      availability: availability("10:00", "16:00", [1, 3, 5]), // Mon/Wed/Fri
    },
    {
      name: "Dr. Priya Patel",
      email: "priya.patel@telecare.dev",
      specialization: "Dermatology",
      experienceYears: 6,
      bio: "Dermatologist specialising in acne, eczema, psoriasis, and cosmetic procedures. Passionate about skin health for all skin types.",
      consultationFee: 100,
      city: "Delhi",
      state: "Delhi",
      availability: availability("11:00", "17:00", [2, 4]), // Tue/Thu
    },
    {
      name: "Dr. James Wilson",
      email: "james.wilson@telecare.dev",
      specialization: "Pediatrics",
      experienceYears: 10,
      bio: "Paediatrician providing compassionate care for newborns through adolescents. Special interest in developmental milestones and childhood nutrition.",
      consultationFee: 75,
      city: "Bangalore",
      state: "Karnataka",
      availability: availability("08:00", "14:00", [1, 2, 3, 4, 5]), // Mon–Fri
    },
    {
      name: "Dr. Emily Rodriguez",
      email: "emily.rodriguez@telecare.dev",
      specialization: "Neurology",
      experienceYears: 12,
      bio: "Neurologist with expertise in migraines, epilepsy, and multiple sclerosis. Uses evidence-based approaches and telemedicine-friendly treatment plans.",
      consultationFee: 200,
      city: "Chennai",
      state: "Tamil Nadu",
      availability: availability("14:00", "19:00", [1, 2, 3]), // Mon/Tue/Wed
    },
  ];

  const doctors: { user: any; profile: any }[] = [];

  for (const d of doctorSeeds) {
    const pw = await hash("Test@1234");

    const user = await prisma.user.upsert({
      where: { email: d.email },
      update: {},
      create: {
        name: d.name,
        email: d.email,
        passwordHash: pw,
        role: Role.DOCTOR,
        emailVerified: true,
        doctorProfile: {
          create: {
            specialization: d.specialization,
            experienceYears: d.experienceYears,
            bio: d.bio,
            consultationFee: d.consultationFee,
            city: d.city ?? null,
            state: d.state ?? null,
            verified: true,
            isActive: true,
          },
        },
      },
      include: { doctorProfile: true },
    });

    const profile = user.doctorProfile!;

    // Create availability rows only if none exist yet
    const existingAvail = await prisma.doctorAvailability.count({ where: { doctorId: profile.id } });
    if (existingAvail === 0) {
      await prisma.doctorAvailability.createMany({
        data: d.availability.map((a) => ({ doctorId: profile.id, ...a })),
      });
    }

    doctors.push({ user, profile });
    console.log(`✅ Doctor: ${d.email}`);
  }

  // ─── PATIENTS ──────────────────────────────────────────────────────────────

  const patientSeeds = [
    {
      name: "John Doe",
      email: "john@test.com",
      dob: new Date("1990-01-15"),
      gender: Gender.MALE,
      bloodGroup: "A+",
      phone: "+1 234 567 8901",
      city: "New York",
    },
    {
      name: "Aisha Khan",
      email: "aisha@test.com",
      dob: new Date("1988-05-22"),
      gender: Gender.FEMALE,
      bloodGroup: "O+",
      phone: "+1 987 654 3210",
      city: "Chicago",
    },
    {
      name: "Robert Smith",
      email: "robert@test.com",
      dob: new Date("1975-11-03"),
      gender: Gender.MALE,
      bloodGroup: "B+",
      phone: "+1 555 000 1234",
      city: "San Francisco",
    },
  ];

  const patients: { user: any; record: any }[] = [];

  for (const p of patientSeeds) {
    const pw = await hash("Test@1234");

    const user = await prisma.user.upsert({
      where: { email: p.email },
      update: {},
      create: {
        name: p.name,
        email: p.email,
        passwordHash: pw,
        role: Role.PATIENT,
        emailVerified: true,
        patient: {
          create: {
            dateOfBirth: p.dob,
            gender: p.gender,
            bloodGroup: p.bloodGroup,
            phone: p.phone,
            city: p.city,
          },
        },
      },
      include: { patient: true },
    });

    patients.push({ user, record: user.patient! });
    console.log(`✅ Patient:  ${p.email}`);
  }

  // Aliases for readability
  const [drSarah, drChen, drPriya, drWilson, drEmily] = doctors.map((d) => d.profile);
  const [john, aisha, robert] = patients.map((p) => p.record);

  // ─── APPOINTMENTS ──────────────────────────────────────────────────────────
  // Wipe existing seed appointments so re-runs are clean.
  const seedPatientIds = [john.id, aisha.id, robert.id];
  await prisma.appointment.deleteMany({ where: { patientId: { in: seedPatientIds } } });

  const apptData = [
    // ── John ──────────────────────────────────────────────────────────────────
    // TODAY + 90 min — use this for live video testing right now
    {
      patientId: john.id, doctorId: drSarah.id,
      scheduledAt: daysFromNow(0, new Date().getHours(), new Date().getMinutes() + 90),
      status: AppointmentStatus.CONFIRMED,
      reason: "General health check-up and blood pressure review",
    },
    // Tomorrow with Cardiology
    {
      patientId: john.id, doctorId: drChen.id,
      scheduledAt: daysFromNow(1, 11, 0),
      status: AppointmentStatus.PENDING,
      reason: "Routine ECG follow-up",
    },
    // Completed 3 days ago
    {
      patientId: john.id, doctorId: drPriya.id,
      scheduledAt: daysFromNow(-3, 14, 0),
      status: AppointmentStatus.COMPLETED,
      reason: "Skin rash on forearm",
    },
    // Completed 2 weeks ago
    {
      patientId: john.id, doctorId: drSarah.id,
      scheduledAt: daysFromNow(-14, 10, 30),
      status: AppointmentStatus.COMPLETED,
      reason: "Flu symptoms and fever",
    },

    // ── Aisha ─────────────────────────────────────────────────────────────────
    // Day after tomorrow
    {
      patientId: aisha.id, doctorId: drWilson.id,
      scheduledAt: daysFromNow(2, 9, 0),
      status: AppointmentStatus.PENDING,
      reason: "Child health consultation for son",
    },
    // 5 days from now with Dermatology
    {
      patientId: aisha.id, doctorId: drPriya.id,
      scheduledAt: daysFromNow(5, 13, 0),
      status: AppointmentStatus.CONFIRMED,
      reason: "Annual skin check",
    },
    // Completed last week
    {
      patientId: aisha.id, doctorId: drEmily.id,
      scheduledAt: daysFromNow(-7, 15, 0),
      status: AppointmentStatus.COMPLETED,
      reason: "Recurring migraines, seeking long-term treatment plan",
    },
    // Cancelled
    {
      patientId: aisha.id, doctorId: drChen.id,
      scheduledAt: daysFromNow(-10, 10, 0),
      status: AppointmentStatus.CANCELLED_BY_PATIENT,
      reason: "Heart palpitations check",
    },

    // ── Robert ────────────────────────────────────────────────────────────────
    // TODAY + 2 hours — doctor can start this call
    {
      patientId: robert.id, doctorId: drSarah.id,
      scheduledAt: daysFromNow(0, new Date().getHours() + 2, 0),
      status: AppointmentStatus.CONFIRMED,
      reason: "Diabetes management and medication review",
    },
    // 3 days from now
    {
      patientId: robert.id, doctorId: drEmily.id,
      scheduledAt: daysFromNow(3, 16, 0),
      status: AppointmentStatus.PENDING,
      reason: "Persistent headaches after work",
    },
    // Completed last month
    {
      patientId: robert.id, doctorId: drChen.id,
      scheduledAt: daysFromNow(-30, 11, 0),
      status: AppointmentStatus.COMPLETED,
      reason: "Chest tightness during exercise",
    },
    // Cancelled by doctor
    {
      patientId: robert.id, doctorId: drPriya.id,
      scheduledAt: daysFromNow(-5, 12, 0),
      status: AppointmentStatus.CANCELLED_BY_DOCTOR,
      reason: "Psoriasis consultation",
    },
  ];

  const appointments = await prisma.appointment.createMany({ data: apptData });
  console.log(`\n✅ Created ${appointments.count} appointments`);

  // ─── SUMMARY ───────────────────────────────────────────────────────────────

  // Fetch the live-test appointment for the URL
  const liveAppt = await prisma.appointment.findFirst({
    where: { patientId: john.id, doctorId: drSarah.id, status: AppointmentStatus.CONFIRMED },
    orderBy: { scheduledAt: "asc" },
  });

  console.log("\n" + "═".repeat(60));
  console.log("  TEST CREDENTIALS  (password same for all: Test@1234)");
  console.log("═".repeat(60));
  console.log("\n  DOCTORS");
  console.log("  ─────────────────────────────────────────────────────");
  for (const d of doctorSeeds) {
    console.log(`  ${d.name.padEnd(25)} ${d.email}`);
  }
  console.log("\n  PATIENTS");
  console.log("  ─────────────────────────────────────────────────────");
  console.log("  John Doe                  john@test.com");
  console.log("  Aisha Khan                aisha@test.com");
  console.log("  Robert Smith              robert@test.com");
  console.log("\n  All passwords:  Test@1234");
  console.log("\n" + "─".repeat(60));
  console.log("  LIVE VIDEO TEST  (appointment in ~90 minutes)");
  console.log("─".repeat(60));
  if (liveAppt) {
    console.log(`  Appointment ID : ${liveAppt.id}`);
    console.log(`  Scheduled at   : ${liveAppt.scheduledAt.toLocaleTimeString()}`);
    console.log(`  Patient login  : john@test.com`);
    console.log(`  Doctor login   : sarah.johnson@telecare.dev`);
    console.log(`  Patient URL    : http://localhost:3000/patient/consultation/${liveAppt.id}`);
    console.log(`  Doctor URL     : http://localhost:3000/doctor/consultation/${liveAppt.id}`);
  }
  console.log("═".repeat(60) + "\n");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
