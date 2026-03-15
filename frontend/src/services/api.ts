import { useAuthStore } from "@/store/auth";
import type { AuthUser } from "@/store/auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4001/api/v1";

// ─── Transport helpers ────────────────────────────────────────────────────────

/** Reads the token from the Zustand store — works outside React components. */
function getToken(): string | null {
  return useAuthStore.getState().token;
}

async function request<T>(
  path: string,
  init: RequestInit & { params?: Record<string, string> } = {},
): Promise<T> {
  const { params, ...rest } = init;

  let url = `${API_BASE}${path}`;
  if (params && Object.keys(params).length) {
    url += `?${new URLSearchParams(params)}`;
  }

  const token = getToken();
  const res = await fetch(url, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...rest.headers,
    },
  });

  if (!res.ok) {
    // 401 means the token expired — log out so middleware redirects to /login
    if (res.status === 401) {
      useAuthStore.getState().logout();
    }
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.message ?? body?.error?.message ?? "Request failed");
  }

  return res.json() as Promise<T>;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export type { AuthUser };

export interface AuthResult {
  token: string;
  user: AuthUser;
}

export const authApi = {
  login: (email: string, password: string) =>
    request<AuthResult>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  signup: (data: { name: string; email: string; password: string; role: "PATIENT" | "DOCTOR" }) =>
    request<AuthResult>(`/auth/signup/${data.role.toLowerCase()}`, {
      method: "POST",
      body: JSON.stringify({ name: data.name, email: data.email, password: data.password }),
    }),
};

// ─── Doctors ──────────────────────────────────────────────────────────────────

export interface DoctorSummary {
  id: string;
  userId: string;
  specialization: string;
  experienceYears: number | null;
  bio: string | null;
  consultationFee: string | null;
  verified: boolean;
  isActive: boolean;
  user: { name: string; email: string };
}

export interface AvailabilitySlot {
  id: string;
  weekday: number; // 0 = Sunday … 6 = Saturday
  startTime: string; // "HH:mm"
  endTime: string;
  slotDuration: number; // minutes
  bufferTime: number;
}

export const doctorsApi = {
  list: (params?: { specialization?: string; page?: number; limit?: number }) =>
    request<{ data: DoctorSummary[]; total: number; page: number; limit: number }>("/doctors", {
      params: {
        ...(params?.specialization ? { specialization: params.specialization } : {}),
        ...(params?.page ? { page: String(params.page) } : {}),
        ...(params?.limit ? { limit: String(params.limit) } : {}),
      },
    }),

  getById: (id: string) => request<DoctorSummary>(`/doctors/${id}`),

  getAvailability: (id: string) =>
    request<{ availability: AvailabilitySlot[] }>(`/doctors/${id}/availability`),
};

// ─── Appointments ─────────────────────────────────────────────────────────────

export interface AppointmentDoctor {
  id: string;
  specialization: string;
  consultationFee: string | null;
  user: { id: string; name: string; email: string };
}

export interface AppointmentPatient {
  id: string;
  user: { id: string; name: string; email: string };
}

export interface Appointment {
  id: string;
  scheduledAt: string;
  durationMinutes: number;
  status: string;
  reason: string | null;
  videoRoomId: string | null;
  meetingLink: string | null;
  sessionStartedAt: string | null;
  sessionEndedAt: string | null;
  createdAt: string;
  doctor: AppointmentDoctor;
  patient: AppointmentPatient;
}

export interface BookAppointmentInput {
  doctorId: string;
  scheduledAt: string;
  durationMinutes?: number;
  reason?: string;
}

export const appointmentsApi = {
  book: (data: BookAppointmentInput) =>
    request<Appointment>("/appointments", { method: "POST", body: JSON.stringify(data) }),

  list: (params?: { status?: string; page?: number; limit?: number }) =>
    request<{ data: Appointment[]; total: number; page: number; limit: number }>("/appointments", {
      params: {
        ...(params?.status ? { status: params.status } : {}),
        ...(params?.page ? { page: String(params.page) } : {}),
        ...(params?.limit ? { limit: String(params.limit) } : {}),
      },
    }),

  getById: (id: string) => request<Appointment>(`/appointments/${id}`),

  cancel: (id: string) =>
    request<Appointment>(`/appointments/${id}/cancel`, { method: "PATCH" }),
};

// ─── Patients ─────────────────────────────────────────────────────────────────
// DOCTOR-only endpoint. Backend checks that the requesting doctor has
// at least one appointment with this patient before returning data.

export interface PatientProfile {
  id: string;
  dateOfBirth: string | null;
  gender: string | null;
  bloodGroup: string | null;
  allergies: string | null;
  chronicConditions: string | null;
  user: { id: string; name: string; email: string };
}

export const patientsApi = {
  getById: (patientId: string) => request<PatientProfile>(`/patients/${patientId}`),
};

// ─── Video ────────────────────────────────────────────────────────────────────

export interface VideoRoomResponse {
  roomName: string;
  meetingLink: string;
  appointmentId: string;
}

export interface VideoTokenResponse {
  token: string;
  roomUrl: string;
  roomName: string;
  userName: string;
  isDoctor: boolean;
}

export interface VideoInfoResponse {
  appointmentId: string;
  scheduledAt: string;
  durationMinutes: number;
  status: string;
  reason: string | null;
  videoRoomId: string | null;
  meetingLink: string | null;
  sessionStartedAt: string | null;
  sessionEndedAt: string | null;
  doctor: { id: string; name: string; specialization: string };
  patient: { id: string; name: string };
  isDoctor: boolean;
  isPatient: boolean;
}

export const videoApi = {
  createRoom: (appointmentId: string) =>
    request<VideoRoomResponse>(`/video/rooms/${appointmentId}`, { method: "POST" }),

  getToken: (appointmentId: string) =>
    request<VideoTokenResponse>(`/video/token/${appointmentId}`),

  getInfo: (appointmentId: string) =>
    request<VideoInfoResponse>(`/video/info/${appointmentId}`),

  startSession: (appointmentId: string) =>
    request<{ success: boolean; sessionStartedAt: string }>(
      `/video/session/start/${appointmentId}`,
      { method: "POST" },
    ),

  endSession: (appointmentId: string) =>
    request<{ success: boolean; sessionEndedAt: string; status: string }>(
      `/video/session/end/${appointmentId}`,
      { method: "POST" },
    ),
};

// ─── Messages ─────────────────────────────────────────────────────────────────

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  appointmentId: string | null;
  content: string | null;
  createdAt: string;
  sender: { id: string; name: string; role: string };
}

export const messagesApi = {
  getByAppointment: (appointmentId: string) =>
    request<Message[]>(`/messages/appointment/${appointmentId}`),
};

// ─── Files ────────────────────────────────────────────────────────────────────

export interface FileRecord {
  id: string;
  originalName: string;
  mimeType: string;
  type: string;
  sizeBytes: string;
  createdAt: string;
  uploadedBy: { id: string; name: string; role: string };
}

export const filesApi = {
  upload: async (file: File, appointmentId?: string): Promise<FileRecord> => {
    const token = getToken();
    const form = new FormData();
    form.append("file", file);
    if (appointmentId) form.append("appointmentId", appointmentId);

    const res = await fetch(`${API_BASE}/files/upload`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body?.message ?? "Upload failed");
    }
    return res.json();
  },

  getByAppointment: (appointmentId: string) =>
    request<FileRecord[]>(`/files/appointment/${appointmentId}`),

  getDownloadUrl: (fileId: string) => `${API_BASE}/files/download/${fileId}`,
};
