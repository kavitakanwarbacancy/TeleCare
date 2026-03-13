---
name: telecare-mvp-architecture-updates
overview: Adjust the existing TeleCare MVP architecture plan to add doctor availability, refine appointment statuses, drop admin audit logs from MVP scope, and tighten frontend/state-management guidance to match the current Next.js app.
todos:
  - id: update-schema-section
    content: Edit database schema section to remove admin_audit_logs, add doctor_availability, and refine appointment status enums plus conflict prevention note.
    status: pending
  - id: update-api-section
    content: Adjust API section to add doctor availability endpoint and clarify booking conflict checks.
    status: pending
  - id: update-frontend-section
    content: Revise frontend structure section to align with existing Next.js app and add high-level UX/product guidelines and core responsibilities.
    status: pending
  - id: update-state-and-fetching-guidance
    content: Clarify choice of Zustand/Redux Toolkit and React Query/SWR over axios-centric patterns in the frontend section.
    status: pending
  - id: consistency-pass
    content: Update any remaining references (statuses, admin scope) to stay consistent with the new decisions across the document.
    status: pending
isProject: false
---

# TeleCare MVP Architecture – Targeted Plan Updates

## Goal

Update the existing plan in `[.cursor/plans/telecare-mvp-architecture_b1a0a351.plan.md](/Users/admin/Desktop/TeleCare/.cursor/plans/telecare-mvp-architecture_b1a0a351.plan.md)` to:

- Remove non-essential `admin_audit_logs` from the MVP scope.
- Introduce explicit doctor availability/time slots in the schema and API flow.
- Refine appointment statuses for better tracking of cancellations.
- Align the frontend section with the already-migrated Next.js app and clarify state-management and data-fetching tools.

## 1. Database Schema Adjustments

- **Drop `admin_audit_logs` from MVP**
  - In section **3. Database Schema Design (PostgreSQL)**, remove the `**admin_audit_logs` table definition and the related sentence that suggests adding audit in the first cut.
  - Replace that closing sentence with something like: “We’ll implement migrations incrementally (users/auth first, then doctors/appointments, then messages/prescriptions/files; admin audit logs can be added later, outside MVP).”
- **Add `doctor_availability` (or `availability`) table**
  - In the same section, after `**doctor_profiles`, add a new table definition:
    - `**doctor_availability`
      - `id` (PK, UUID)
      - `doctor_id` (FK → `doctor_profiles.id` or `users.id` with role=DOCTOR – match whatever is used elsewhere in the plan)
      - `weekday` (smallint or enum 0–6, representing day of week)
      - `start_time` (time without time zone)
      - `end_time` (time without time zone)
      - `created_at`, `updated_at`
  - Add a brief note that this is used to power patient-facing views of when a doctor is generally available, not individual booked appointments.
- **Refine appointment status enum**
  - In the `**appointments` table definition, replace the current `status` enum line with something like:
    - `status` (enum: `PENDING`, `CONFIRMED`, `COMPLETED`, `CANCELLED_BY_PATIENT`, `CANCELLED_BY_DOCTOR`, `NO_SHOW`)
  - Optionally add a short note that splitting cancellations by actor helps with analytics and UX.
- **Appointment conflict prevention (booking-time check)**
  - Add 1–2 sentences near the `**appointments` table or in the appointments module description in section **2. Backend Architecture** clarifying:
    - When creating an appointment, the booking API must check for conflicts: for a given `doctor_id`, `scheduled_at` (and duration), reject if another appointment overlaps that time window.
    - This logic lives in the appointments module/service, not in the DB alone, so it can evolve.

## 2. API Layer Updates (Availability & Booking)

- **Doctor availability endpoints**
  - In section **4. API Structure & Endpoints (REST + Socket.io)**:
    - Under **Doctors (`/doctors`)**, add an endpoint like:
      - `GET /doctors/:id/availability` – returns the doctor’s weekly availability ranges from `doctor_availability`.
    - Optionally note that the patient-facing booking UI will combine this with existing appointments to show which slots are actually free.
- **Appointment booking conflict check**
  - Under **Appointments (`/appointments`)**, extend the description for `POST /appointments` to mention:
    - Before inserting, the API queries existing appointments for that `doctor_id` and time range; if a conflict exists, it returns a validation error (e.g., 409) so the frontend can show “slot already booked”.

## 3. Frontend Plan Refinements (Section 7)

- **Clarify that Next.js app structure already exists**
  - At the top of **7. Frontend Structure (Next.js + Tailwind)**, add a short note:
    - The project is already using the Next.js `app/` router; this section should be treated as guidance to validate and align the existing structure, not as a request to rebuild from scratch.
- **High-level UX/product guidelines**
  - Add a small bullet list under “Styling & UX” or right after the high-level structure:
    - **Removal of unnecessary or advanced functionality**: keep the MVP focused; avoid complex flows beyond what’s needed for booking, consultation, prescriptions, and basic messaging.
    - **Reference product**: If unsure about what minimal but useful fields/flows to include or drop, loosely refer to Practo’s UX as a benchmark (without copying).
    - **Sign up & sign in**: Sign-up should only differentiate between **Doctor** and **Patient** types; no extra roles at registration time.
    - **Mobile layout**: All main flows (auth, dashboards, booking, consultation room) must have a clean mobile experience; design components mobile-first or at least verify responsiveness early.
- **Frontend functional focus areas**
  - Add a sub-list (can be a bullet group under “Incremental frontend feature plan” or a new “Core frontend responsibilities” subsection) enumerating the key flows the app must support:
    - **Redux/Zustand state management for critical app state** (see next subsection).
    - **Login and auth storage management** – token storage, user role, session handling.
    - **API structure & data-fetching patterns** – consistent REST wrappers powered by React Query/SWR.
    - **Appointment schedule management** – listing, booking, and reflecting doctor availability + conflicts.
    - **Notifications for scheduled appointments** – basic in-app toasts/banners or simple reminders (no heavy push infra needed at MVP).
    - **Prescription management (view and upload)** – patients can see prescriptions, doctors can create/upload relevant files.
    - **Research video call implementation** – UI hooks correctly into WebRTC/Socket.io layer; keep scope at “basic but reliable”.

## 4. State Management & Data Fetching Choices

- **State management (Zustand or Redux Toolkit)**
  - In section 7 where `store/` and `useAuth` etc. are discussed, update the guidance to:
    - Explicitly choose a modern, popular state management option – e.g., **Zustand** or **Redux Toolkit**. For the MVP, default to a lightweight store like **Zustand** for:
      - Auth user + token.
      - Basic cross-page state such as currently selected appointment, simple notifications preferences, etc.
    - Mention that if the state grows more complex later, Redux Toolkit remains a viable future option, but we won’t prematurely over-engineer global state.
- **Data fetching (React Query or SWR instead of axios-only)**
  - Replace or narrow the existing `apiClient` description so it’s not an axios-centric client but a thin wrapper around `fetch` if needed.
  - Add explicit guidance:
    - Prefer **React Query (TanStack Query)** or **SWR** for server state (API calls): caching, loading/error states, and refetching.
    - Use these libraries for auth-related fetches, appointments, doctor lists, and any data that benefits from caching and background refresh.
    - Avoid building a heavy custom data layer; leverage these libraries’ patterns instead.

## 5. Small Consistency Touches

- **Appointment status mentions**
  - Anywhere else in the document that references appointment statuses (`PENDING`, `CONFIRMED`, etc.) should be updated to reflect the new enums, especially in sections 4 (Appointments endpoints) and 10 (Incremental Implementation Tasks).
- **Admin scope**
  - Keep the **admin module** and admin dashboards in scope (basic tables and lists), but ensure there is no reference to audit logs being implemented in MVP; call them a “future enhancement” if mentioned.

Once you approve this plan, I’ll apply these targeted edits directly to the existing plan file so that it reflects doctor availability, refined statuses, clarified frontend/state management strategy, and the removal of admin audit logs from MVP scope.
