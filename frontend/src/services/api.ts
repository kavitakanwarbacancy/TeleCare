const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001/api/v1";

interface FetchOptions extends RequestInit {
  params?: Record<string, string>;
}

async function fetchWithAuth(endpoint: string, options: FetchOptions = {}): Promise<Response> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const { params, ...fetchOptions } = options;

  let url = `${API_URL}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams.toString()}`;
  }

  return fetch(url, {
    ...fetchOptions,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...fetchOptions.headers,
    },
  });
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Request failed" }));
    throw new Error(error.message || error.error?.message || "Request failed");
  }
  return response.json();
}

// Video API
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
  doctor: {
    id: string;
    name: string;
    specialization: string;
  };
  patient: {
    id: string;
    name: string;
  };
  isDoctor: boolean;
  isPatient: boolean;
}

export const videoApi = {
  createRoom: async (appointmentId: string): Promise<VideoRoomResponse> => {
    const res = await fetchWithAuth(`/video/rooms/${appointmentId}`, { method: "POST" });
    return handleResponse<VideoRoomResponse>(res);
  },

  getToken: async (appointmentId: string): Promise<VideoTokenResponse> => {
    const res = await fetchWithAuth(`/video/token/${appointmentId}`);
    return handleResponse<VideoTokenResponse>(res);
  },

  getInfo: async (appointmentId: string): Promise<VideoInfoResponse> => {
    const res = await fetchWithAuth(`/video/info/${appointmentId}`);
    return handleResponse<VideoInfoResponse>(res);
  },

  startSession: async (appointmentId: string): Promise<{ success: boolean; sessionStartedAt: string }> => {
    const res = await fetchWithAuth(`/video/session/start/${appointmentId}`, { method: "POST" });
    return handleResponse(res);
  },

  endSession: async (appointmentId: string): Promise<{ success: boolean; sessionEndedAt: string; status: string }> => {
    const res = await fetchWithAuth(`/video/session/end/${appointmentId}`, { method: "POST" });
    return handleResponse(res);
  },
};

// Messages API
export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  appointmentId: string | null;
  content: string | null;
  createdAt: string;
  sender: {
    id: string;
    name: string;
    role: string;
  };
}

export const messagesApi = {
  getByAppointment: async (appointmentId: string): Promise<Message[]> => {
    const res = await fetchWithAuth(`/messages/appointment/${appointmentId}`);
    return handleResponse<Message[]>(res);
  },
};

// Files API
export interface FileRecord {
  id: string;
  originalName: string;
  mimeType: string;
  type: string;
  sizeBytes: string;
  createdAt: string;
  uploadedBy: {
    id: string;
    name: string;
    role: string;
  };
}

export const filesApi = {
  upload: async (file: File, appointmentId?: string): Promise<FileRecord> => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const formData = new FormData();
    formData.append("file", file);
    if (appointmentId) {
      formData.append("appointmentId", appointmentId);
    }

    const res = await fetch(`${API_URL}/files/upload`, {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    return handleResponse<FileRecord>(res);
  },

  getByAppointment: async (appointmentId: string): Promise<FileRecord[]> => {
    const res = await fetchWithAuth(`/files/appointment/${appointmentId}`);
    return handleResponse<FileRecord[]>(res);
  },

  getDownloadUrl: (fileId: string): string => {
    return `${API_URL}/files/download/${fileId}`;
  },
};
