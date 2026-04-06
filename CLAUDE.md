# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A booking platform with a Spring Boot backend and Next.js frontend. Users can register/login, browse service providers, and book appointments. Providers manage their schedules, services, and appointments.

## Commands

### Backend (`booking-backend/`)

```bash
# Build
./mvnw clean package

# Run
./mvnw spring-boot:run

# Run tests
./mvnw test

# Run a single test class
./mvnw test -Dtest=ClassName

# Run a single test method
./mvnw test -Dtest=ClassName#methodName
```

### Frontend (`frontend/`)

```bash
npm run dev      # Development server
npm run build    # Production build
npm run lint     # Lint
```

## Required Environment Variables (Backend)

```
SPRING_DATASOURCE_URL
SPRING_DATASOURCE_USERNAME
SPRING_DATASOURCE_PASSWORD
SUPABASE_URL
SUPABASE_KEY
SPRING_DATA_REDIS_HOST
SPRING_DATA_REDIS_PORT
```

## Backend Architecture

**Stack:** Spring Boot 3.4.12, Java 21, PostgreSQL (JPA/Hibernate with `ddl-auto=update`), Redis, Spring Security + JWT, Supabase (file storage), Lombok.

### Layer Structure

```
controller/   → REST endpoints, request parsing, auth extraction
service/      → Business logic (interface + Impl)
repository/   → Spring Data JPA repositories
entity/
  DO/         → JPA entities mapped to DB tables
  DTO/
    request/  → Inbound request bodies
    response/ → Outbound response objects
  mapper/     → DO ↔ DTO conversion
common/
  security/   → JWT filter, SecurityConfig, UserDetails
  exception/  → Custom exceptions + GlobalExceptionHandler
  template/   → ServiceTemplate + CallbackService
  util/       → JwtUtil, AssertUtil
  enums/      → Role, ResultCode, DaysOfWeek
  result/     → BaseResult, RequestResult
```

### Key Patterns

**ServiceTemplate:** Many service methods use `ServiceTemplate.execute(request, callbackService)` — a template that calls `checkParams` → `process` → fills success/error result and handles all exception types centrally. `CallbackService` is the callback interface. Some newer services (e.g., `AppointmentServiceImpl`) bypass this and throw exceptions directly.

**AssertUtil:** Used for guard clauses — throws the provided exception if the condition is false.

**API Routes:**
- `/api/auth/**` — public (register, login)
- `/api/public/**` — public
- All other routes require a valid JWT Bearer token

**Security:** `JwtAuthFilter` runs before `UsernamePasswordAuthenticationFilter` on every request. `@PreAuthorize` annotations are enabled via `@EnableMethodSecurity`.

### Domain Model

- `UserDO` — users with `Role` enum (`USER`, `PROVIDER`, `ADMIN`), optional Supabase profile image
- `ProviderProfileDO` — provider profile linked one-to-one with a user; has `maxConcurrency` (max simultaneous appointments), list of `ProviderScheduleDO` (weekly schedule)
- `ServiceProvideDO` — a service offered by a provider
- `AppointmentDO` — booking; has `isAccepted` / `isCompleted` flags; conflict detection uses `countOverlappingAppointments` against provider's `maxConcurrency`
- `ScheduleOverrideDO` — provider blocks/exceptions that override the regular schedule
- `ReviewDO` — reviews (repository exists, service TBD)

### Appointment Booking Logic (`AppointmentServiceImpl`)

When creating an appointment:
1. Validate the time slot is within the provider's weekly `ProviderScheduleDO`
2. Check no overlapping `ScheduleOverrideDO` blocks the slot
3. Check `countOverlappingAppointments < maxConcurrency` (pessimistic lock on provider row)

## Frontend Architecture

**Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4.

**Implementation plan:** See `frontend-plan.md` in the project root.

**Design system:** Violet/indigo gradient primary (`from-violet-600 to-indigo-600`), `rounded-2xl` cards, `shadow-sm` borders, `bg-slate-50` page background. App name is **Bookify**.

**Key frontend files:**
```
frontend/lib/types.ts          → TypeScript interfaces matching backend DTOs
frontend/lib/api.ts            → Centralized API client (reads NEXT_PUBLIC_API_URL)
frontend/lib/auth-context.tsx  → Auth React context + useAuth() hook
frontend/lib/auth-guard.tsx    → Route protection (redirects unauthenticated users)
frontend/components/navbar.tsx → Glassmorphism sticky nav + mobile hamburger
frontend/app/page.tsx          → Home: hero + provider search + "How it works"
frontend/app/login/page.tsx    → Split-panel login
frontend/app/register/page.tsx → Split-panel register
frontend/app/appointments/page.tsx → Tabbed appointments (Pending/Accepted/In Progress/Completed)
frontend/app/profile/page.tsx  → Profile with gradient avatar card
frontend/app/providers/[providerId]/page.tsx → Provider detail + service picker + booking form
frontend/app/dashboard/layout.tsx → Provider dashboard layout with sidebar nav (PROVIDER role only)
frontend/app/dashboard/page.tsx → Provider appointments with Accept/Mark Complete actions
frontend/app/dashboard/services/page.tsx → Provider service management (create, disable)
frontend/lib/resolve-names.ts  → In-memory cache for resolving provider/service names from IDs
```

**JWT storage:** `localStorage` keys `token` and `user` (`{ id, username, role }`).

**Role values:** `VIEWER` (customer), `PROVIDER`, `ADMIN`. Frontend sends `"VIEWER"` on register.

**Multipart endpoints:** `POST /api/auth/register` and `PUT /api/user/profile` use `multipart/form-data` with a `data` JSON Blob part and optional `profileImage` file part.

**API base URL:** Configured via `NEXT_PUBLIC_API_URL` env var (build-time). Defaults to `http://localhost:8080/api`. In Docker, Traefik proxies frontend on port 80 and the env var is set to `http://localhost/api` via a build arg in `docker-compose.yaml`.
