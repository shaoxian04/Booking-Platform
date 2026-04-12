# Booking Platform Frontend — Completion & Polish Plan

## Goal
Finish and polish the Bookify frontend by adding a public-facing experience, replacing the broken "paste UUID" booking flow with real service selection, humanizing the appointments list, and shipping a first-class provider dashboard — backed by a single new public backend endpoint.

## Context
Key files and why they matter:

- `booking-backend/src/main/java/com/booking/controller/` — where a new `PublicController` (or extension of the existing provider/service controllers) must expose the unauthenticated `/api/public/provider/{providerId}/services` endpoint. `/api/public/**` is already whitelisted in `SecurityConfig`.
- `booking-backend/src/main/java/com/booking/service/` — `ServiceProvideService` (or equivalent) already loads services by provider; reuse it for the new public endpoint.
- `booking-backend/src/main/java/com/booking/entity/DTO/response/ServiceResponse.java` — existing response shape, safe to return publicly (no PII).
- `frontend/lib/api.ts` — centralized fetch client. All new calls go here; never call `fetch` from components.
- `frontend/lib/types.ts` — `JwtResponse`, `ProviderResponse`, `ServiceResponse`, `AppointmentResponse`, `UserResponse` already exist. Extend only if the backend adds fields.
- `frontend/lib/auth-context.tsx` + `frontend/lib/auth-guard.tsx` — auth state and route gating; role comes from `user.role` (`VIEWER` | `PROVIDER` | `ADMIN`).
- `frontend/components/navbar.tsx` — currently `return null` when `!user`. Must be split into authenticated + public variants.
- `frontend/app/page.tsx` — home/search page, also the public landing. Needs to render a public navbar when logged out and redirect to `/login?redirect=...` on "Book" clicks.
- `frontend/app/providers/[providerId]/page.tsx` — currently asks users to "Paste the service UUID". Needs full service-picker redesign.
- `frontend/app/appointments/page.tsx` — tabbed list that currently shows raw UUIDs; must show real names and times.
- `frontend/components/provider-card.tsx`, `frontend/components/loading-spinner.tsx` — reusable.
- `booking-backend/src/main/java/com/booking/common/security/SecurityConfig.java` — confirms `/api/public/**` is public; new endpoint must be mounted under that prefix.

## Constraints & Risks
- **Backend is authoritative** for the `VIEWER`/`PROVIDER`/`ADMIN` role value — the frontend stores `role` in `localStorage.user`. Do not invent new role strings.
- The new public endpoint MUST NOT leak sensitive provider fields. `ServiceResponse` contains `serviceId`, `providerId`, `userId`, `serviceName`, `serviceBio`, `duration`, `price`, `imagePath`, `remarks` — all safe. Do not include schedule internals or owner contact info.
- `AppointmentResponse` only carries `serviceId`/`providerId` UUIDs. We will resolve names **client-side** (batch fetch `getProviderById` + a new `getServiceById` cache) rather than changing the backend DTO, to keep this plan tight. A stretch step documents the backend enrichment alternative.
- `ddl-auto=update` — no schema changes needed; we're only adding a read endpoint.
- Auth guard currently redirects unauthenticated users away from all non-public routes; the home page (`/`) must remain reachable without auth. Verify `auth-guard.tsx` is NOT applied to `/`, `/login`, `/register`, or `/providers/[id]`.
- **[SECURITY]** The new `/api/public/provider/{id}/services` endpoint will be hit by unauthenticated clients — add no rate limiting assumption, but ensure it only returns services belonging to the requested provider (no wildcard leakage) and returns `404` for unknown IDs rather than a stack trace.
- The provider detail page is currently gated by `Navbar` which requires auth. After the navbar split it must render for guests too.
- Time handling: backend expects `yyyy-MM-ddTHH:mm:ss`. Keep existing `formatDateTime` helper logic.

## Design Direction
- **Color palette**: keep the existing `from-violet-600 to-indigo-600` gradient for primary CTAs, `bg-slate-50` page background, `rounded-2xl` cards with `border-slate-100 shadow-sm`. Status chips use `emerald` (accepted/completed), `amber` (pending), `sky` (in-progress), `rose` (cancelled/failed).
- **Layout philosophy**:
  - Public landing: hero → search → category chips → featured providers → "How it works" → footer.
  - Provider detail: two-column on `lg+` (left = provider hero + gallery + services list; right = sticky booking summary card). Single column on mobile.
  - Provider dashboard: left rail sidebar (`Appointments`, `Services`, `Schedule`, `Profile`) + main content. Mobile collapses rail to a top tab bar.
  - Appointments page: keep tab bar; cards become 2-column grid on `md+` with name/time/price/status chip/actions.
- **Anti-patterns to avoid**:
  - No generic gradient hero on secondary pages (hero is ONLY on `/`).
  - No placeholder card grids / "lorem ipsum" service cards — render empty states with real copy and a clear CTA.
  - No raw UUIDs surfaced to users anywhere — always resolve to a human name or hide.
  - No "Paste the service UUID" text inputs.
  - No duplicated navbar code between public/auth variants — share a single component with a `variant` prop.
  - No client-side role-gating as a security boundary (backend must enforce); frontend gating is UX only.

## Implementation Steps

### Must-Have (implement first — core functionality)

1. **Backend: public services-by-provider endpoint**
   File: `booking-backend/src/main/java/com/booking/controller/PublicController.java` (create if absent) or add a method to the existing provider controller mapped under `/api/public`.
   - Add `GET /api/public/provider/{providerId}/services` that delegates to the existing service-provide service layer method (the same one `/api/service/provider-all` uses internally, but parameterized by `providerId`). If no such method exists, add `findByProviderId(UUID providerId)` on the service interface + impl + repository (Spring Data derived query `findByProviderProviderId` or equivalent).
   - Return `List<ServiceResponse>` via the existing mapper.
   - Return `404` when provider does not exist; return empty list `[]` when provider exists but has no services.
   - **[SECURITY]** No auth required, but ensure the JPA query filters by `providerId` exactly and the mapper does not include hidden fields. Add a unit test confirming the response does not include owner email/phone.

2. **Backend: verify SecurityConfig**
   File: `booking-backend/src/main/java/com/booking/common/security/SecurityConfig.java`
   - Confirm `/api/public/**` remains in `permitAll()`. No change expected; flag if missing.

3. **Frontend: extend API client**
   File: `frontend/lib/api.ts`
   - Add `getServicesByProviderId(providerId: string): Promise<ServiceResponse[]>` hitting `/public/provider/{providerId}/services` (no auth header needed, but including it is harmless).
   - Add `getProviderAppointments(status: "unaccepted" | "accepted" | "completed" | "not-completed"): Promise<AppointmentResponse[]>` hitting `/appointment/provider/{status}`.
   - Add `acceptAppointment(id: string): Promise<AppointmentResponse>` hitting `PUT /appointment/{id}/accept`.
   - Add `completeAppointment(id: string): Promise<AppointmentResponse>` hitting `PUT /appointment/{id}/complete`.
   - Add `getMyServices(): Promise<ServiceResponse[]>` hitting `/service/provider-all`.
   - Add `createService(data: { serviceName; serviceBio; duration; price; remarks? }): Promise<ServiceResponse>` hitting `POST /service`.
   - Import `ServiceResponse` type at the top.

4. **Frontend: type additions**
   File: `frontend/lib/types.ts`
   - Ensure `ServiceResponse` is exported (it is per the project doc; add if missing).
   - Add `CreateServiceRequest` interface matching the backend `POST /api/service` body.
   - Add `AppointmentStatus` union type = `"unaccepted" | "accepted" | "completed" | "not-completed"`.

5. **Frontend: split Navbar into public + authenticated variants**
   File: `frontend/components/navbar.tsx`
   - Remove the `if (!user) return null` early return.
   - When `user` is null, render a navbar with the same logo, no nav links (or a single `Browse` link pointing at `/`), and two right-aligned buttons: outlined `Log in` → `/login` and gradient `Sign up` → `/register`.
   - When `user.role === "PROVIDER"`, replace the `NAV_LINKS` with `[{ href: "/dashboard", label: "Dashboard" }, { href: "/dashboard/services", label: "Services" }, { href: "/profile", label: "Profile" }]`.
   - When `user.role === "VIEWER"`, keep the existing links (`/`, `/appointments`, `/profile`).
   - When `user.role === "ADMIN"`, keep VIEWER links for now (admin UI is out of scope).
   - Mobile hamburger menu must mirror each variant.

6. **Frontend: ensure home page renders for guests**
   File: `frontend/app/page.tsx`
   - Verify `<Navbar />` is rendered unconditionally at top.
   - If search results or category chips have click handlers that call authenticated APIs, gate the click: if `!user`, `router.push("/login?redirect=" + encodeURIComponent(currentPath))`.
   - `searchProviders` currently requires auth — either (a) add a public variant `GET /api/public/provider?queryName=...` (preferred, small backend add) or (b) make the home search show a "Log in to search" prompt for guests. Pick (a): add `GET /api/public/provider/search?queryName=...` in the backend and a `searchProvidersPublic` in `api.ts`; on home, call the public one when `!user`, the authed one when logged in.
   - Provider cards' "View" button navigates to `/providers/{id}` which must itself be public.

7. **Frontend: make provider detail page public + add service picker**
   File: `frontend/app/providers/[providerId]/page.tsx`
   - Replace `api.getProviderById` with a public equivalent. Add backend `GET /api/public/provider/{providerId}` (mirror the existing authed endpoint) and `getProviderByIdPublic` in `api.ts`. Use the public call when `!user`.
   - After provider loads, call `api.getServicesByProviderId(providerId)` and render a **Services** section above the booking form:
     - Empty state: "This provider hasn't listed any services yet."
     - Each service renders as a selectable card with `serviceName`, `serviceBio` (truncated 2 lines), duration (minutes), price (formatted currency), and a radio-style selected state (violet ring + check icon).
   - Remove the "Service ID" text input entirely. Selected service is tracked in `selectedServiceId` state; booking form is disabled until a service is selected.
   - Prefill the end-time input from `startTime + duration` (derived; user can override).
   - If `!user` and the user clicks "Confirm Booking", redirect to `/login?redirect=/providers/{providerId}` instead of calling the API.
   - Update the booking card header copy to "Select a service and time" (remove the "paste UUID" helper text).

8. **Frontend: enrich appointments display (client-side resolution)**
   File: `frontend/app/appointments/page.tsx`
   - After fetching appointments for the active tab, collect unique `providerId` and `serviceId` values.
   - Add a tiny in-memory cache module: `frontend/lib/resolve-names.ts` exporting `resolveProviderNames(ids: string[])` and `resolveServiceName(serviceId, providerId)` (the latter uses `getServicesByProviderId` and memoizes per provider). Both cache results in a `Map` scoped to the module.
   - Render each appointment card with: service name (bold), provider name (subtitle), start → end formatted as `Mon, Apr 6 • 2:00 PM – 3:00 PM`, remarks (if any), status chip, and the existing cancel button on the pending tab.
   - Show a skeleton placeholder while names resolve; fall back to `"Unknown service"` / `"Unknown provider"` on lookup failure (never show a UUID).
   - Grid: 1 col mobile, 2 cols `md`, 3 cols `xl`.

9. **Frontend: provider dashboard — appointments tab**
   File: `frontend/app/dashboard/page.tsx` (new) + `frontend/app/dashboard/layout.tsx` (new)
   - `layout.tsx` wraps children in `<AuthGuard requiredRole="PROVIDER">` (extend `auth-guard.tsx` to accept an optional `requiredRole` prop — if role mismatches, redirect to `/`).
   - Sidebar nav with links: `Appointments` (default `/dashboard`), `Services` (`/dashboard/services`), `Profile` (`/profile`). Collapses to top tabs on mobile.
   - `page.tsx` shows tabbed provider appointments using `getProviderAppointments(status)` for each of the four statuses.
   - Each card has:
     - `Pending` tab → `Accept` button calling `acceptAppointment`.
     - `Accepted` tab → `Mark complete` button calling `completeAppointment`.
     - Customer name (resolved via a new `GET /api/public/user/{id}/display-name` endpoint — OR reuse `getProfile`-style fetch; if backend does not expose a by-id endpoint, show "Customer" and include the remarks instead, and add a backlog note).
   - Optimistic update: remove the card from the current tab on successful action and re-sort.

10. **Frontend: provider dashboard — services tab**
    File: `frontend/app/dashboard/services/page.tsx` (new)
    - Lists the provider's own services via `getMyServices()`.
    - "New service" button opens a modal/drawer form with fields matching `CreateServiceRequest` (`serviceName`, `serviceBio`, `duration`, `price`, `remarks?`).
    - On submit, call `createService`, refresh list, close modal.
    - Empty state illustration + CTA when the provider has no services.

### Should-Have (implement after must-haves pass)

1. **Login redirect support**
   File: `frontend/app/login/page.tsx`
   - Read `?redirect=` query param; after successful login, `router.replace(redirectTarget ?? defaultForRole(user.role))` where `defaultForRole("PROVIDER") === "/dashboard"` and everything else → `/`.

2. **Role-aware post-register landing**
   File: `frontend/app/register/page.tsx`
   - Add a "I am a…" toggle: `Customer` (default, sends `VIEWER`) vs `Service provider` (sends `PROVIDER`). Update backend register request type if needed.
   - After register, redirect providers to an onboarding note at `/dashboard` and customers to `/`.

3. **Home page polish for guests**
   File: `frontend/app/page.tsx`
   - Add a dedicated hero CTA row: `Sign up free` + `I'm a provider`.
   - "How it works" mini-section with 3 icons.
   - Footer with links to `/login`, `/register`, and a dummy `About`.

4. **Appointments page empty states**
   Each tab renders a friendly empty state (icon + headline + CTA to `/`).

5. **Provider detail page — sticky booking column**
   On `lg+`, make the booking card sticky (`lg:sticky lg:top-24`) so it stays visible while scrolling the services list.

6. **Loading skeletons**
   Create `frontend/components/skeleton.tsx` with `<SkeletonCard />` and reuse on home, appointments, dashboard, and provider detail instead of the plain spinner where a layout is known.

7. **Toast system**
   Add `frontend/components/toast.tsx` (simple context + portal) and replace inline success/error banners for booking, accept, complete, cancel, create-service actions.

### Nice-to-Have (only if time permits)

1. **Backend enrichment alternative** — add `providerName` and `serviceName` directly to `AppointmentResponse` (via mapper join). Then drop the client-side resolver. Keep behind a separate commit.
2. **Provider dashboard — schedule tab** — reuse existing `/api/schedule` endpoints if present; otherwise document as backlog.
3. **Dark-mode pass** on dashboard (class-based, no system preference).
4. **Pagination on home search** when results > 20.
5. **Favicon + metadata** — `frontend/app/layout.tsx` title = `Bookify — Book trusted service providers`.

## Acceptance Criteria
- An unauthenticated visitor to `/` sees the Bookify navbar with `Log in` and `Sign up` buttons, the hero, and can search providers.
- Clicking a provider card from the home page opens `/providers/{id}` without requiring login.
- The provider detail page lists real services as selectable cards — **nowhere** does the UI ask for a "Service ID" or show a UUID.
- A logged-out user clicking `Confirm Booking` is redirected to `/login?redirect=/providers/{id}` and, after login, lands back on the provider detail page.
- A logged-in `VIEWER` can select a service, pick times, and book successfully; the created appointment appears in `My Appointments` showing the real service name and provider name (no UUIDs).
- A logged-in `PROVIDER` is routed to `/dashboard` by default navigation, can see Pending appointments, click `Accept` (moves to Accepted tab), then click `Mark complete` (moves to Completed tab).
- A `PROVIDER` can create a new service from `/dashboard/services` and see it appear in the list immediately.
- `GET /api/public/provider/{providerId}/services` returns `200` + JSON array for a valid provider, `404` for unknown, and requires no `Authorization` header.
- No component calls `fetch` directly — all API traffic goes through `frontend/lib/api.ts`.
- No console errors in any of the above flows.

## Evaluation Rubric
Criteria the evaluator will score against (1–10 per dimension, threshold 7.0 to pass):

- **Functionality (weight 0.3)**: All acceptance-criteria flows work end-to-end. Public endpoint returns correct data; service selection replaces UUID input; provider dashboard accept/complete transitions work; appointments show resolved names.
- **Craft (weight 0.3)**: Types are accurate, error states handled (try/catch + user-visible messages), loading states present, no direct `fetch` outside `lib/api.ts`, no `any`, no dead code, navbar variants share a single component, caches are bounded and invalidated on relevant actions.
- **Design (weight 0.2)**: Consistent violet/indigo system, `rounded-2xl` + `shadow-sm`, no raw UUIDs visible, empty states have real copy, provider detail uses two-column sticky layout on desktop, dashboard feels first-class (not an afterthought).
- **Completeness (weight 0.2)**: Every Must-Have step implemented; Should-Haves attempted; docs/comments updated where behavior is non-obvious; `CLAUDE.md` frontend key-files section updated to list the new dashboard routes and `lib/resolve-names.ts`.

---
**Plan saved to `docs/plans/booking-platform-frontend.md`.**

**Before running the generator agent, please clear the context window to avoid token waste.**

In Claude Code, run `/compact` to compress the context, then start the generator agent with:
> "Implement the plan at `docs/plans/booking-platform-frontend.md`"
---
