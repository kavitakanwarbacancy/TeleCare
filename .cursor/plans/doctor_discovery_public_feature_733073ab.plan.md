---
name: Doctor discovery public feature
overview: "Add a public doctor discovery flow: backend city filter and optional city on DoctorProfile, public GET /doctors with city and specialty query params, and frontend public /doctors (list with filters) and /doctors/[id] (profile) with login-gated Book Appointment and optional redirect-after-login."
todos: []
isProject: false
---

# Doctor discovery (public, Practo-like)

## Scope (MVP)

- Public doctors browse and profile pages (no login required to view).
- Filters: **location (city and state)** and **specialty**; results from backend via query params.
- Card list and doctor profile with Book Appointment; if not logged in, redirect to login (with return URL); if logged in, go to existing patient booking flow.
- No ratings, reviews, maps, insurance, or complex search.

---

## Current state

- **Backend**: [backend/src/modules/doctors/index.ts](backend/src/modules/doctors/index.ts) – GET /doctors (public) and GET /doctors/:id, GET /doctors/:id/availability (public). [doctors.service.ts](backend/src/modules/doctors/doctors.service.ts) filters by `specialization` and `verified`; no `city` or `state` (DoctorProfile has no location fields). List returns `user.name`, `user.email`.
- **Frontend**: [frontend/src/app/patient/doctors/page.tsx](frontend/src/app/patient/doctors/page.tsx) and [frontend/src/app/patient/doctors/[id]/page.tsx](frontend/src/app/patient/doctors/[id]/page.tsx) use **MOCK_DOCTORS** and live under `/patient` (patient layout). No public /doctors route. No doctors API in [frontend/src/services/api.ts](frontend/src/services/api.ts). Login page always redirects to `/patient/dashboard` and does not use a `redirect` query param.

---

## 1. Backend: Add city, state, and location filters

**1.1 Schema and migration**

- In [backend/prisma/schema.prisma](backend/prisma/schema.prisma), add optional `**city`** and `**state\*\`to`DoctorProfile`(e.g.`city String?`, `state String?`). Add `@@index([city])`and`@@index([state])` (or a composite index) to support filtered list queries.
- Create migration (e.g. `add_doctor_city_state`) and run `prisma migrate dev` / `prisma generate`.

**1.2 Doctors module**

- [backend/src/modules/doctors/doctors.schemas.ts](backend/src/modules/doctors/doctors.schemas.ts): add optional `**city`** and `**state\*\`to`listDoctorsQuerySchema`(e.g.`z.string().max(100).optional()` each).
- [backend/src/modules/doctors/doctors.service.ts](backend/src/modules/doctors/doctors.service.ts):
  - Add `city` and `state` to `doctorListSelect` and to `ListDoctorsParams` / `ListDoctorsResult`.
  - In `listDoctors`, add `where` clauses: if `city` provided, `city: { contains: city.trim(), mode: 'insensitive' }`; if `state` provided, `state: { contains: state.trim(), mode: 'insensitive' }`.
  - In `getDoctorById`, include `city` and `state` in select.
  - In `UpdateDoctorProfileData` and `updateMyProfile`, add `city` and `state` (optional strings) so doctors can set them.
- [backend/src/modules/doctors/doctors.schemas.ts](backend/src/modules/doctors/doctors.schemas.ts): add `**city`** and `**state\*\`to`updateDoctorProfileSchema` (optional, max length).

**1.3 Public response shape**

- Keep list and getById suitable for public use. Optionally omit `user.email` from list and getById selects for privacy (MVP: can leave as-is and note for later).

**1.4 Seed**

- Update [backend/prisma/seed.ts](backend/prisma/seed.ts) so created doctor profile has `**city`** and `**state\*\` values (e.g. "Bangalore", "Karnataka") so location filters return results in dev.

---

## 2. Frontend: API client and types

**2.1 Doctors API**

- In [frontend/src/services/api.ts](frontend/src/services/api.ts) add:
  - **doctorsApi.list(params?)** – `GET /doctors` with query params: `city`, `state`, `specialty` (map to backend `specialization`), `page`, `limit`. Return type: `{ data: DoctorListItem[], total, page, limit }`.
  - **doctorsApi.getById(id)** – `GET /doctors/:id`. Return type: single doctor object.
  - **doctorsApi.getAvailability(id)** – `GET /doctors/:id/availability`. Return type: `{ availability: AvailabilitySlot[] }`.
- Use existing `fetchWithAuth` or a public `fetch` for these GETs (backend does not require auth). Optional: add a small helper that builds query string from params for list.
- Define TypeScript types/interfaces for list item, profile, and availability to match backend (id, name via user, specialization, experienceYears, city, bio, consultationFee, degree, verified, etc.).

---

## 3. Frontend: Public doctors list page

**3.1 Route and layout**

- New route: `**/doctors` (e.g. [frontend/src/app/doctors/page.tsx](frontend/src/app/doctors/page.tsx)).
- No auth guard; page is public. Use a minimal public shell (e.g. same navbar as landing with Login/Signup) or reuse landing nav; avoid wrapping with patient layout.

**3.2 Filters**

- At the top, two filters:
  - **Location (city)**: text input or dropdown (e.g. free text that gets sent as `city`).
  - **Specialty**: dropdown or free text mapped to `specialty` (backend expects `specialization`; API client sends as `specialization` or backend accepts `specialty` and maps – keep one name in API and document).
- On change or “Apply”, update URL query params (e.g. `?city=...&specialty=...`) and refetch list so the page is shareable and back/forward work.

**3.3 Fetch and display**

- Fetch: `doctorsApi.list({ city, specialty, page: 1, limit: 20 })` (params from URL or state).
- **Card list layout** per doctor:
  - Doctor name (from API)
  - Specialty (specialization)
  - Years of experience
  - City
  - Short bio (truncate if long)
  - **“Book Appointment”** button
- **Empty state**: when `data.length === 0`, show a clear “No doctors found” message and suggest adjusting filters.
- Optional: simple pagination (page/limit) if you keep backend default limit small.

---

## 4. Frontend: Book Appointment behavior

**4.1 List and profile pages**

- “Book Appointment” (on list card and on profile page):
  - **If user is not logged in**: redirect to `**/login?redirect=/doctors/<id>` (or `redirect=/doctors` for list) so after login they can be sent back to the doctor profile or list. Use `router.push` with searchParams.
  - **If user is logged in**: redirect to `**/patient/doctors/<id>` (existing patient doctor profile/booking page). Check auth via `localStorage.getItem('token')` or a small hook/helper; no need for a global auth context if not already used.

**4.2 Login redirect support**

- In [frontend/src/app/login/page.tsx](frontend/src/app/login/page.tsx): read `redirect` from searchParams (e.g. `useSearchParams().get('redirect')`). After successful login, navigate to `redirect` if it is a relative path starting with `/` (and optionally allowlist `/doctors`, `/patient` to avoid open redirect), otherwise default to `/patient/dashboard` (or role-based default). Ensures “Book Appointment” → login → back to doctor profile works.

---

## 5. Frontend: Public doctor profile page

**5.1 Route**

- New route: `**/doctors/[id]/page.tsx` (e.g. [frontend/src/app/doctors/[id]/page.tsx](frontend/src/app/doctors/[id]/page.tsx)). Public; no auth required.

**5.2 Data**

- Fetch **GET /doctors/:id** and **GET /doctors/:id/availability** (doctorsApi.getById, doctorsApi.getAvailability). Handle loading and 404 (doctor not found).

**5.3 UI**

- Show **full doctor details**: name, specialty, experience, city, bio, consultation fee, degree (if present).
- **Availability**: use API response (weekday, startTime, endTime, slotDuration) and render in a simple list or “Available: Mon–Fri 9am–5pm” style summary; if API returns empty, show a short “Contact for availability” or mock line (MVP: mock is acceptable per requirements).
- **“Book Appointment”** button: same logic as list – not logged in → `/login?redirect=/doctors/<id>`; logged in → `/patient/doctors/<id>`.

**5.4 Navigation**

- “Back to results” or “Browse doctors” link to `/doctors` (and optionally preserve previous query params in state or URL when leaving list).

---

## 6. Optional: Link from landing and patient dashboard

- On [frontend/src/app/page.tsx](frontend/src/app/page.tsx) (landing): add a clear CTA such as “Find a doctor” or “Browse doctors” linking to `**/doctors`.
- Optionally from patient dashboard, link “Book appointment” or “Find doctor” to `/doctors` so logged-in patients can also use the same discovery flow.

---

## 7. Patient doctor pages (existing)

- Keep [frontend/src/app/patient/doctors/page.tsx](frontend/src/app/patient/doctors/page.tsx) and [frontend/src/app/patient/doctors/[id]/page.tsx](frontend/src/app/patient/doctors/[id]/page.tsx). Optionally refactor them to use **doctorsApi** and real data instead of MOCK_DOCTORS so that when a logged-in user lands on `/patient/doctors/<id>` they see real doctor info and can complete booking. If time is short, leave patient pages on mock data and only ensure navigation and redirect logic work; real data can be a follow-up.

---

## Implementation order

1. **Backend**: Prisma add `city` → migration → doctors schemas/service (list + getById + update) → seed.
2. **Frontend API**: doctorsApi + types in api.ts.
3. **Public list**: `/doctors` page with filters, card list, empty state, Book button (auth check + redirect).
4. **Login redirect**: support `?redirect=` on login page.
5. **Public profile**: `/doctors/[id]` with details, availability, Book button.
6. **Landing**: link to `/doctors`.
7. **(Optional)** Patient doctors pages: switch to API data and align with backend response shape.

---

## Files to touch (summary)

| Area                                             | Action                                                     |
| ------------------------------------------------ | ---------------------------------------------------------- |
| `backend/prisma/schema.prisma`                   | Add `city` to DoctorProfile; index if desired              |
| `backend/prisma/migrations/`                     | New migration for city                                     |
| `backend/prisma/seed.ts`                         | Set city on doctor profile                                 |
| `backend/src/modules/doctors/doctors.schemas.ts` | Add city to list query and update body                     |
| `backend/src/modules/doctors/doctors.service.ts` | city in list where/select, getById, updateMyProfile        |
| `frontend/src/services/api.ts`                   | doctorsApi.list, getById, getAvailability + types          |
| `frontend/src/app/doctors/page.tsx`              | New public list page (filters, cards, empty, Book)         |
| `frontend/src/app/doctors/[id]/page.tsx`         | New public profile page (details, availability, Book)      |
| `frontend/src/app/login/page.tsx`                | Read redirect param; after login go to redirect or default |
| `frontend/src/app/page.tsx`                      | Link “Find a doctor” / “Browse doctors” to /doctors        |
| `frontend/src/app/patient/doctors/page.tsx`      | Optional: use doctorsApi and real data                     |
| `frontend/src/app/patient/doctors/[id]/page.tsx` | Optional: use doctorsApi and real data                     |

No new dependencies. Backend stays REST; frontend uses existing fetch and routing patterns.
