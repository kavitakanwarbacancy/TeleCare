import { prisma } from "../../db";
import { hashPassword, signToken, verifyPassword } from "../../utils";
import { Role } from "../../../generated/prisma";
import type { User } from "../../../generated/prisma";

const DOCTOR_PROFILE_PLACEHOLDER_SPECIALIZATION = "Pending";

/** Generic message to avoid leaking whether email exists (timing/count attacks). */
const INVALID_CREDENTIALS_MESSAGE = "Invalid email or password";

function authError(message: string, status: number, code: string): never {
  const err = new Error(message) as Error & { status?: number; code?: string };
  err.status = status;
  err.code = code;
  throw err;
}

export interface AuthResult {
  token: string;
  user: { id: string; name: string; email: string; role: string };
}

function toAuthResult(user: User): AuthResult {
  return {
    token: signToken({ sub: user.id, role: user.role }),
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
}

/**
 * Authenticate user with email and password. Single DB query + password verification.
 */
export async function login(
  email: string,
  password: string,
): Promise<AuthResult> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw authError(INVALID_CREDENTIALS_MESSAGE, 401, "UNAUTHORIZED");
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    throw authError(INVALID_CREDENTIALS_MESSAGE, 401, "UNAUTHORIZED");
  }

  return toAuthResult(user);
}

/**
 * Register a new user. Checks email uniqueness once before transaction to fail fast.
 */
export async function signup(
  name: string,
  email: string,
  password: string,
  role: Role,
): Promise<AuthResult> {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw authError("Email already registered", 409, "CONFLICT");
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.$transaction(async (tx) => {
    const u = await tx.user.create({
      data: { name, email, passwordHash, role },
    });
    if (role === Role.PATIENT) {
      await tx.patient.create({ data: { userId: u.id } });
    } else if (role === Role.DOCTOR) {
      await tx.doctorProfile.create({
        data: {
          userId: u.id,
          specialization: DOCTOR_PROFILE_PLACEHOLDER_SPECIALIZATION,
        },
      });
    }
    return u;
  });

  return toAuthResult(user);
}
