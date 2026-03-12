---
name: telecare-mvp-architecture
overview: High-level implementation plan for the TeleCare MVP telemedicine platform, covering frontend, backend, database schema, APIs, realtime video, file uploads, and deployment foundations.
todos:
  - id: backend-foundation
    content: Set up backend Express app, environment config, DB connection, and basic auth (users, signup/login).
    status: pending
  - id: schema-and-appointments
    content: Design and implement PostgreSQL schema for users, doctors, patients, appointments, messages, prescriptions, and files, with migrations and repository layer.
    status: pending
  - id: frontend-shell-and-auth
    content: Implement Next.js + Tailwind frontend shell, routing, and auth flows (login/signup/doctor-signup) with role-based dashboards skeletons.
    status: pending
  - id: realtime-video-and-chat
    content: Integrate Socket.io and WebRTC signaling for 1:1 video calls and appointment-scoped messaging on backend and frontend.
    status: pending
  - id: file-upload-flow
    content: Implement secure appointment-scoped medical file upload, metadata storage, and download using AWS S3 and backend authorization checks.
    status: pending
  - id: admin-module
    content: Create basic admin backend APIs and a simple admin dashboard for inspecting users, doctors, and appointments.
    status: pending
  - id: docker-ec2-deployment
    content: Harden configuration, add minimal CI, and ensure Docker Compose deployment works cleanly on a single EC2 instance.
    status: pending
isProject: false
---

## TeleCare MVP Implementation Plan

### 1. Scope & Assumptions

- **MVP scope**: Core features (auth, doctor profiles, appointment booking, 1:1 video calls, basic messaging, medical file uploads, basic prescriptions) **plus** basic admin (manage doctors, view users, simple overviews).
- **Video experience**: Minimal 1:1 video consultations (join/leave, mute/unmute, basic connection status), with no recording or screenshare in MVP.
- **Doctor onboarding**: Doctors can self-register and are auto-approved for MVP (no admin review flow yet, but schema will allow adding an approval flag later).
- **Security level**: Basic security best practices (hashed passwords, JWT, role-based auth, secure file access) without full regulatory-compliance scope yet; design remains compatible with stricter rules later.
- **Infrastructure**: Single EC2 instance running Docker Compose for frontend, backend, and Postgres; S3 used for file storage. Plan for future horizontal scaling but don’t overbuild infra now.

---

### 2. Backend Architecture (Node.js + Express)

- **Project layout** (under `[backend/src](/Users/admin/Desktop/TeleCare/backend/src)`):
  - `app.ts` – Express app bootstrap (middleware, routes registration, error handling).
  - `server.ts` – HTTP & Socket.io server startup wiring.
  - `config/` – environment config (DB URLs, JWT secret, S3 bucket, WebRTC/STUN/TURN config).
  - `db/` – DB client (e.g., `pg` or an ORM like Prisma/Drizzle) and migrations directory.
  - `modules/` (feature-based):
    - `auth/` – login, signup, JWT, password hashing.
    - `users/` – common user operations, roles (patient, doctor, admin).
    - `doctors/` – doctor profile CRUD, listing, specialization filters.
    - `appointments/` – booking, rescheduling, listing, status transitions.
    - `messages/` – secure messaging between patients and doctors.
    - `prescriptions/` – create, list prescriptions.
    - `files/` – upload/download metadata endpoints, S3 integration.
    - `video/` – signaling endpoints/events over Socket.io for WebRTC.
    - `admin/` – basic admin endpoints for listing users/doctors/appointments.
  - `middleware/` – auth (`requireAuth`), role checks (`requireRole`), validation, error handling.
  - `utils/` – small shared helpers (e.g., `passwordHash`, `jwt`, `pagination`), kept minimal and only when reused.
- **API style**: RESTful JSON API, versioned prefix `/api/v1` from the start to allow evolution.
- **Validation**: Use a schema validation library (e.g., Zod or Joi) per module to validate request bodies and query params.
- **Error handling**: Central error middleware returning consistent `{ error: { code, message, details? } }` structure.
- **Auth & RBAC**:
  - JWT-based stateless auth, `Authorization: Bearer <token>` on protected routes.
  - Roles: `PATIENT`, `DOCTOR`, `ADMIN` stored on `users.role`.
  - Middlewares:
    - `requireAuth` – decodes token, attaches `req.user`.
    - `requireRole(...roles)` – enforces role-based access.

---

### 3. Database Schema Design (PostgreSQL)

Design the schema in migrations (e.g., SQL migration files under `[backend/src/db/migrations](/Users/admin/Desktop/TeleCare/backend/src/db/migrations)`). Core tables (simplified view):

- `**users`
  - `id` (PK, UUID)
  - `name` (text, required)
  - `email` (text, unique, required)
  - `password_hash` (text, required)
  - `role` (enum: `PATIENT`, `DOCTOR`, `ADMIN`)
  - `created_at`, `updated_at`
- `**doctor_profiles`
  - `id` (PK, UUID)
  - `user_id` (FK → `users.id`, unique, ON DELETE CASCADE)
  - `specialization` (text, indexed)
  - `experience_years` (int)
  - `bio` (text, nullable)
  - `consultation_fee` (numeric, nullable – future billing integration)
  - `is_active` (bool, default true; later can separate `is_approved` if needed)
  - `created_at`, `updated_at`
- `**patients` (optional thin table for future patient-specific fields; may be included from start for extensibility)
  - `id` (PK, UUID)
  - `user_id` (FK → `users.id`, unique, ON DELETE CASCADE)
  - `date_of_birth` (date, nullable)
  - `gender` (text/enum, nullable)
  - `created_at`, `updated_at`
- `**appointments`
  - `id` (PK, UUID)
  - `patient_id` (FK → `users.id` where role=PATIENT)
  - `doctor_id` (FK → `users.id` where role=DOCTOR, or → `doctor_profiles.id` if we prefer)
  - `scheduled_at` (timestamptz)
  - `duration_minutes` (int, default 30)
  - `status` (enum: `PENDING`, `CONFIRMED`, `CANCELLED`, `COMPLETED`, `NO_SHOW`)
  - `reason` (text, nullable)
  - `created_at`, `updated_at`
  - Indexes on `(doctor_id, scheduled_at)` and `(patient_id, scheduled_at)`.
- `**messages`
  - `id` (PK, UUID)
  - `sender_id` (FK → `users.id`)
  - `receiver_id` (FK → `users.id`)
  - `appointment_id` (FK → `appointments.id`, nullable but preferred for grouping by consultation)
  - `content` (text, nullable if we later support non-text-only messages)
  - `created_at`
  - Index on `appointment_id`, `(sender_id, receiver_id, created_at)`.
- `**prescriptions`
  - `id` (PK, UUID)
  - `doctor_id` (FK → `users.id` or `doctor_profiles.id`)
  - `patient_id` (FK → `users.id`)
  - `appointment_id` (FK → `appointments.id`, nullable but recommended)
  - `notes` (text)
  - `created_at`, `updated_at`
- `**prescription_items` (for structured prescriptions; MVP can also start with free-text only and add this later)
  - `id` (PK, UUID)
  - `prescription_id` (FK → `prescriptions.id`)
  - `drug_name` (text)
  - `dosage` (text)
  - `frequency` (text)
  - `duration` (text)
- `**files` (medical reports and other uploads)
  - `id` (PK, UUID)
  - `owner_id` (FK → `users.id`)
  - `appointment_id` (FK → `appointments.id`, nullable)
  - `uploaded_by_id` (FK → `users.id` – patient or doctor)
  - `type` (enum: `REPORT`, `IMAGE`, `DOCUMENT`, `OTHER`)
  - `storage_key` (text – S3 object key)
  - `original_name` (text)
  - `mime_type` (text)
  - `size_bytes` (bigint)
  - `created_at`
- `**admin_audit_logs` (optional for MVP, but we can create with minimal fields)
  - `id` (PK, UUID)
  - `admin_id` (FK → `users.id`)
  - `action` (text)
  - `target_type` (text)
  - `target_id` (UUID, nullable)
  - `metadata` (JSONB, nullable)
  - `created_at`

We’ll implement migrations incrementally (users/auth first, then doctors/appointments, then messages/prescriptions/files, then admin or audit if included in first cut).

---

### 4. API Structure & Endpoints (REST + Socket.io)

All endpoints under `/api/v1`. High-level groups and initial routes:

- **Auth (`/auth`)**
  - `POST /auth/signup` – patient signup.
  - `POST /auth/doctor-signup` – doctor signup (creates `users` + `doctor_profiles`).
  - `POST /auth/login` – email/password login, returns JWT + basic profile.
  - `GET /auth/me` – current user profile (requires auth).
- **Users (`/users`)**
  - `GET /users/me` – detailed current user metadata including linked doctor/patient profile.
- **Doctors (`/doctors`)**
  - `GET /doctors` – list doctors (filter by specialization, pagination).
  - `GET /doctors/:id` – doctor public profile.
  - `PUT /doctors/me` – update own doctor profile (doctor-only).
- **Appointments (`/appointments`)**
  - `POST /appointments` – patient creates an appointment with doctor, with `scheduled_at`, `reason`.
  - `GET /appointments` – list appointments for current user (role-aware):
    - Patient → own appointments.
    - Doctor → own schedule.
    - Admin → all (with filters).
  - `GET /appointments/:id` – get appointment details (participants + admin only).
  - `PATCH /appointments/:id` – update status (confirm, cancel, mark completed/no-show) with proper role checks.
- **Messages (`/messages`)**
  - `GET /appointments/:id/messages` – list messages tied to an appointment (paginated).
  - `POST /appointments/:id/messages` – send a message (sender must be participant).
  - (Realtime delivery via Socket.io in parallel; REST remains source of truth.)
- **Prescriptions (`/prescriptions`)**
  - `POST /appointments/:id/prescriptions` – doctor creates prescription for appointment.
  - `GET /appointments/:id/prescriptions` – list prescriptions for appointment (doctor and patient plus admin).
  - `GET /prescriptions/:id` – view a specific prescription.
- **Files/Uploads (`/files`)**
  - `POST /appointments/:id/files` – upload a file tied to appointment.
  - `GET /appointments/:id/files` – list files associated with appointment.
  - `GET /files/:id/download` – signed URL or proxy download (permissions enforced: only owner, participants, or admin).
- **Admin (`/admin`)** (basic in MVP)
  - `GET /admin/users` – list users with filters (admin-only).
  - `GET /admin/doctors` – list doctor profiles with filters (admin-only).
  - `GET /admin/appointments` – list appointments (admin-only).
- **Video signaling (`/video`, Socket.io events)**
  - HTTP may expose simple token/room endpoints, but signaling mostly via websockets (see section 5).

---

### 5. Realtime Architecture for Video Consultations

- **Technology stack**: WebRTC in the browser, with **Socket.io** as the signaling channel, running on the same Node.js backend server.
- **Room model**:
  - Each appointment maps to a room, e.g., `room:appointment:<appointmentId>`.
  - Only the patient and doctor (and optionally admin observer in future) may join the room; backend checks JWT and that user is part of the appointment.
- **Connection flow**:
  1. Frontend calls REST to fetch appointment details and confirms user is participant.
  2. Frontend connects to Socket.io with auth token.
  3. Frontend emits `join_room` with `appointmentId`.
  4. Backend validates access and joins user to Socket.io room.
  5. WebRTC signaling over Socket.io events:
  - `webrtc_offer`, `webrtc_answer`, `webrtc_ice_candidate` between peers in room.
  1. Room-level events:
  - `user_joined`, `user_left`, `call_started`, `call_ended`.
- **TURN/STUN**:
  - Use public STUN servers for MVP (e.g., Google STUN), configurable via environment.
  - TURN server could be added later for better NAT traversal; keep config injection-ready in `config`.
- **Fallbacks & edge cases**:
  - If video connection fails, ensure there is still messaging for basic communication.
  - Backend enforces that calls can only be joined near scheduled time (e.g., from 10 minutes before to some time after start) – logic to be implemented in the `video` module with the `appointments` table.
- **Security**:
  - Socket.io connection uses JWT for auth (e.g., in query or headers).
  - Server validates the appointment and user relationship for each `join_room` and signaling message.

---

### 6. File Upload Strategy (Medical Reports)

- **Storage**: AWS S3 bucket dedicated to TeleCare medical files.
- **Flow**:
  1. Authenticated frontend requests an upload for a given `appointmentId` via `POST /appointments/:id/files`.
  2. Backend validates user is participant in the appointment.
  3. For simplicity and security in MVP, backend accepts the multipart upload (e.g., using `multer` or similar) and streams file to S3.
  4. Backend stores metadata in the `files` table (`owner_id`, `uploaded_by_id`, `appointment_id`, `storage_key`, etc.).
  5. For download, frontend calls `GET /files/:id/download`; backend verifies authorization and either:
  - generates a short-lived signed URL and redirects, **or**
  - proxies the file stream from S3 (MVP can choose whichever is simpler for the environment).
- **Constraints & validation**:
  - Enforce file size limits (e.g., configurable env var, 10–20 MB initial cap).
  - Restrict allowed MIME types to common images/PDFs/documents.
  - Clean file names for S3 keys; use UUID-based keys plus extension.
- **Security**:
  - S3 bucket **private** by default; all access goes through backend or signed URLs.
  - Strict checks around who can upload and read files (patients, assigned doctors, admins). No cross-patient access.

---

### 7. Frontend Structure (Next.js + Tailwind)

- **Tech stack**: Next.js (app or pages router; we’ll choose one and keep consistent), TypeScript, TailwindCSS.
- **High-level structure** (e.g., under `[frontend/](/Users/admin/Desktop/TeleCare/frontend)`):
  - `app/` or `pages/`
    - Auth pages: `login`, `signup`, `doctor-signup`.
    - Dashboard layouts:
      - `patient/` – appointments list, book appointment page, consultation room, messages, files.
      - `doctor/` – upcoming appointments, availability overview (simple calendar list for MVP), consultation room, messages.
      - `admin/` – simple tables for users, doctors, appointments.
  - `components/`
    - **Layout**: `MainLayout`, `DashboardLayout`, `AuthLayout`.
    - **UI primitives**: `Button`, `Input`, `Select`, `Modal`, `Card`, `Table`, `Avatar`, `Badge`, `Toast` (or use a light UI library but keep custom wrappers consistent).
    - **Domain components**: `DoctorCard`, `AppointmentList`, `AppointmentForm`, `MessageList`, `PrescriptionView`, `FileList`, `FileUploadButton`, `VideoCallPanel`.
  - `hooks/`
    - `useAuth` – hooks into auth context and JWT storage.
    - `useAppointments`, `useMessages` – wrappers around API calls, but only created when we see reuse.
    - `useVideoCall` – encapsulate WebRTC and Socket.io room join/leave for appointment.
  - `lib/`
    - `apiClient` – lightweight fetch wrapper for backend REST, adds JWT headers.
    - `validators` – shared client-side validation schemas matching backend (if using Zod, can share types via a small shared package later).
  - `store/` (if needed) – minimal global state (auth user, maybe active appointment), but for MVP we can rely heavily on React Query/SWR rather than heavy client-side global state.
- **Routing & access control**:
  - Public routes: `login`, `signup`, `doctor-signup`.
  - Protected routes: dashboards and consultation pages, enforced via Next.js middleware (server-side) or client-side checks + redirects.
  - Role-based layout switching: once authenticated, route user to `/patient`, `/doctor`, or `/admin` dashboard depending on role.
- **Styling & UX**:
  - Tailwind for utility-first styling; define a minimal design system (colors, typography, spacing) via Tailwind config and a small set of CSS variables / base classes.
  - Ensure responsive design for desktop-first with mobile usability.
  - Consistent loading states, empty states, and error toasts for all main flows (login, booking, joining call, upload, etc.).
- **Incremental frontend feature plan**:
  1. Implement auth pages and core layout shell.
  2. Implement patient dashboard (list + create appointments).
  3. Implement doctor dashboard (view upcoming appointments).
  4. Implement basic consultation room UI (video call panel + basic participant info).
  5. Add messaging UI inside appointment context.
  6. Add file upload and listing in appointment detail view.
  7. Add minimal admin dashboard (user/doctor/appointment tables).

---

### 8. Realtime Frontend Architecture (Video + Messaging)

- **Video call (WebRTC + Socket.io)**:
  - `useVideoCall` hook:
    - Accepts `appointmentId` and local media constraints.
    - Manages:
      - Getting local media stream.
      - Connecting to Socket.io with JWT.
      - Joining appointment room.
      - Handling WebRTC `RTCPeerConnection`, offer/answer, ICE candidates.
      - Exposes state: `localStream`, `remoteStream`, `isConnected`, `isMuted`, `joinCall`, `leaveCall`, `toggleMute`.
  - `VideoCallPanel` component:
    - Uses `useVideoCall` to render local and remote video elements.
    - Basic controls: join/leave, mute/unmute.
- **Messaging**:
  - REST for persistence (send + load history) plus Socket.io for live updates.
  - `useAppointmentChat(appointmentId)` hook:
    - Fetches initial messages via REST.
    - Subscribes to `message:new` events in appointment room via Socket.io.
    - Exposes `messages`, `sendMessage`, `isSending`.

This architecture keeps signaling and messaging on the same Socket.io connection for simplicity.

---

### 9. Deployment & Docker (Single EC2 with Docker Compose)

- **Dockerization**:
  - `backend/Dockerfile` – Node.js image, builds TypeScript (if used), runs Express + Socket.io server.
  - `frontend/Dockerfile` – Next.js build and run (production mode).
  - `docker-compose.yml` in project root (already present, to be extended):
    - Services: `frontend`, `backend`, `db` (Postgres), possibly `nginx` as a reverse proxy later.
    - Networks for internal communication.
  - `.env` / `.env.example` updated with required variables: DB URL, JWT secret, S3 bucket, S3 credentials, STUN config, etc.
- **EC2 deployment**:
  - Single EC2 instance (e.g., t3.medium) running Docker + Docker Compose.
  - Basic steps:
    - Clone repo to EC2.
    - Provide `.env` configuration via environment or SSM.
    - Run `docker-compose up -d`.
    - Attach an elastic IP and point DNS.
  - SSL handled via a reverse proxy or AWS ALB termination in future; for MVP, we can document that TLS termination should sit in front of EC2.
- **CI/CD (GitHub Actions)**:
  - A minimal pipeline that:
    - Runs tests and lints.
    - Builds Docker images.
    - Optionally pushes images to ECR or Docker Hub.
    - Optionally triggers a deployment step (SSH or SSM command) for EC2.

---

### 10. Incremental Implementation Tasks (High-Level)

We will implement in small, reviewable steps:

1. **Backend foundation**

- Set up Express app, base config, DB connection, and migrations for `users`.
- Implement auth routes (`signup`, `doctor-signup`, `login`, `me`).

1. **Core domain models**

- Add migrations and modules for `doctor_profiles`, `patients`, `appointments`.
- Implement appointment CRUD + listing endpoints with role-aware access.

1. **Frontend auth & dashboards**

- Setup Next.js + Tailwind + auth flows.
- Implement basic patient and doctor dashboards (appointments list + create).

1. **Video and messaging**

- Add Socket.io server integration to backend.
- Implement `video` module signaling and basic `messages` module.
- Implement `useVideoCall`, `VideoCallPanel`, and appointment chat UI.

1. **File uploads**

- Implement `files` module (S3 integration + DB).
- Add appointment-level upload/list/download flows in frontend.

1. **Admin basics**

- Implement `admin` endpoints and a simple admin dashboard UI.

1. **Hardening & deployment**

- Add validation, better error handling, logging, and basic rate limiting.
- Finalize Docker configs and test deployment on an EC2-like environment.
