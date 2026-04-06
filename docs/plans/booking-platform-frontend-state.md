# Generator State — Iteration 001

## What Was Built

### Backend
- Added `getServicesByProviderId(UUID providerId)` to `ServiceProvideService` interface and `ServiceProvideServiceImpl` — returns published services for any given provider ID, throws `NotFoundException` for unknown providers
- Created `PublicProviderController` at `/api/public/provider` with three endpoints:
  - `GET /api/public/provider/{providerId}/services` — list active services (no auth)
  - `GET /api/public/provider/{providerId}` — get provider detail (no auth)
  - `GET /api/public/provider/search?queryName=...` — search providers (no auth)
- Confirmed `/api/public/**` already whitelisted in `SecurityConfig`

### Frontend — Must-Have
- `lib/types.ts`: Added `CreateServiceRequest` and `AppointmentStatus` union type
- `lib/api.ts`: Added `getServicesByProviderId`, `getProviderByIdPublic`, `searchProvidersPublic`, `getMyServices`, `createService`, `disableService`, `getProviderAppointments`, `acceptAppointment`, `completeAppointment`
- `lib/auth-guard.tsx`: Extended to support `requiredRole` prop; made `/` and `/providers/*` semi-public (accessible without auth)
- `lib/resolve-names.ts`: New module with in-memory caches for resolving provider names (`resolveProviderNames`) and service names (`resolveServiceName`, `resolveAppointmentNames`)
- `components/navbar.tsx`: Fixed `if (!user) return null` bug — public variant shows Log in + Sign up buttons; PROVIDER role shows Dashboard/Services/Profile links; VIEWER role shows Browse/My Appointments/Profile links
- `app/page.tsx`: Home page now uses public search API for unauthenticated users; added guest CTA row and footer with links
- `app/providers/[providerId]/page.tsx`: Replaced UUID text input with selectable service cards; auto-calculates end time from service duration; two-column sticky layout on lg+; unauthenticated booking attempt redirects to `/login?redirect=/providers/{id}`
- `app/appointments/page.tsx`: Resolves provider/service names via `resolve-names.ts`, shows skeleton while loading, 2-col grid on md, 3-col on xl, no raw UUIDs shown

### Frontend — Should-Have
- `app/login/page.tsx`: Reads `?redirect=` param; after login routes to redirect target, or PROVIDER→`/dashboard`, VIEWER→`/`
- `app/register/page.tsx`: Added Customer/Provider role toggle; pre-selects PROVIDER if `?role=PROVIDER` query param; button text adapts
- `app/dashboard/layout.tsx`: AuthGuard with `requiredRole="PROVIDER"`; sidebar nav on desktop, top tab bar on mobile
- `app/dashboard/page.tsx`: Provider appointments with 4 status tabs; Accept button on Pending tab; Mark Complete button on Accepted tab; optimistic card removal on success
- `app/dashboard/services/page.tsx`: Lists provider's own services, modal form to create a new service, disable button per service, empty state with CTA
- `app/layout.tsx`: Updated page title to "Bookify — Book trusted service providers"
- `CLAUDE.md`: Updated key frontend files section to include dashboard routes and `lib/resolve-names.ts`

## What Was Skipped or Partial

- **Nice-to-Have**: No dark-mode pass, no pagination on home search, no skeleton component (inline skeletons used in appointments page), no toast system (inline success/error banners kept), no provider schedule tab in dashboard
- **Customer name on dashboard**: No public endpoint exists to get user display name by ID. Dashboard shows "Customer" as the label — per the plan's fallback instruction. Backlog: add `GET /api/public/user/{id}/display-name` backend endpoint
- **Provider dashboard uses `resolveProviderNames` for user IDs**: Removed this since provider IDs ≠ user IDs and it would cause incorrect lookups. Dashboard simply shows "Customer" for the customer field

## Any Decisions Made

- Used `getProviderByIdPublic` (hitting the new `/api/public/provider/{id}` endpoint) in the provider detail page for unauthenticated users; authenticated users still hit the auth-required `/api/provider/{id}` endpoint
- The `ServiceResponse` frontend type uses `price: number` even though the backend returns `BigDecimal` — this works fine via JSON serialization
- The `createService` API call uses `multipart/form-data` with a JSON `data` blob part (no image upload from dashboard — images can be added later via an update endpoint)
- Auth guard now marks `/` and all `/providers/*` paths as semi-public, so they render for guests without redirect
- Dashboard layout uses `AuthGuard requiredRole="PROVIDER"` at the layout level to gate all dashboard sub-routes

## How to Run/Test

```bash
# Backend
cd booking-backend
./mvnw spring-boot:run

# Frontend
cd frontend
npm run dev
```

- Frontend runs at http://localhost:3000
- Backend runs at http://localhost:8080

### Key test flows
1. Visit http://localhost:3000 without login — should see navbar with Log in/Sign up, hero, search, How it works
2. Search for a provider — uses public endpoint, no auth needed
3. Click a provider card — opens detail page without login, shows service cards
4. Click "Log in to Book" — redirects to `/login?redirect=/providers/{id}`, returns after login
5. Log in as VIEWER — routes to `/`, navbar shows Browse/Appointments/Profile
6. Book an appointment by selecting a service card and picking a time
7. Visit /appointments — shows appointments with provider/service names resolved (no UUIDs)
8. Log in as PROVIDER — routes to `/dashboard`, sees provider appointment tabs
9. Visit /dashboard/services — can create a new service via modal
10. New public endpoint: `GET http://localhost:8080/api/public/provider/{id}/services` returns 200 with no Authorization header
