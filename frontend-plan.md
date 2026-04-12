# Frontend Implementation Plan

## Progress

| Phase | Status |
|-------|--------|
| Phase 1: Auth + User Profile + Provider Browsing + Appointment Booking | ✅ Complete |
| Phase 2: Provider Dashboard | 🔲 Not started |
| Phase 3: Appointment Management | 🔲 Not started |

---

## Overview

Build a Next.js 16 App Router frontend for the booking platform. The frontend connects to the Spring Boot backend at `http://localhost:8080` and supports user authentication, provider browsing, and appointment booking.

---

## Phase 1: Auth + User Profile + Provider Browsing + Appointment Booking (USER side)

### Goal

Deliver a fully functional customer-facing frontend: register/login, view/edit profile, browse providers and their services, and book appointments.

### Context

| File / Resource | Why It Matters |
|---|---|
| `booking-backend/.../security/SecurityConfig.java` | Must add CORS config here to allow `localhost:3000` |
| `booking-backend/.../controller/AuthController.java` | `POST /api/auth/register` (multipart), `POST /api/auth/login` (JSON) |
| `booking-backend/.../controller/UserController.java` | `GET /api/user/profile`, `PUT /api/user/profile` (multipart) |
| `booking-backend/.../controller/ProfileProviderController.java` | `GET /api/provider/{id}`, `GET /api/provider/?queryName=` |
| `booking-backend/.../controller/ServiceProvideController.java` | `GET /api/service/provider-all` (authenticated, provider's own services) |
| `booking-backend/.../controller/AppointmentController.java` | `POST /api/appointment/`, `DELETE /api/appointment/{id}`, `GET /api/appointment/user/*` |
| `booking-backend/.../entity/DTO/response/JwtResponse.java` | Login returns: `token`, `type`, `id`, `username`, `email`, `role` |
| `booking-backend/.../entity/DTO/response/ProviderRegistrationResponse.java` | Provider card data: `providerId`, `providerName`, `providerBio`, `profileImageUrl`, `imagePath`, `location`, `averageRating`, `totalReviews`, `maxConcurrency`, `isCompleted` |
| `booking-backend/.../entity/DTO/response/CreateServiceResponse.java` | Service card: `serviceId`, `providerId`, `userId`, `serviceName`, `serviceBio`, `duration`, `price`, `imagePath`, `gmtCreate`, `remarks` |
| `booking-backend/.../entity/DTO/response/AppointmentResponse.java` | Appointment: `appointmentId`, `serviceId`, `providerId`, `userId`, `gmtCreate`, `startTime`, `endTime`, `remarks` |
| `booking-backend/.../entity/DTO/request/CreateAppointmentRequest.java` | Body: `serviceId` (UUID), `startTime` (LocalDateTime), `endTime` (LocalDateTime), `remarks` (optional) |
| `booking-backend/.../entity/DTO/request/RegisterRequest.java` | Body: `username`, `email`, `password`, `phoneNo`, `role` (enum: `VIEWER`, `PROVIDER`, `ADMIN`) |
| `booking-backend/.../entity/DTO/request/LoginRequest.java` | Body: `usernameOrEmail`, `password` |
| `booking-backend/.../entity/DTO/request/UserProfileUpdateRequest.java` | Body: `username`, `email`, `phoneNo` |
| `booking-backend/.../common/enums/Role.java` | Values: `PROVIDER`, `ADMIN`, `VIEWER` -- regular customers are `VIEWER` |
| `frontend/app/layout.tsx` | Root layout -- must wrap with AuthProvider |
| `frontend/tsconfig.json` | Path alias `@/*` maps to `./*` |
| `frontend/package.json` | Next.js 16, React 19, Tailwind CSS 4 |

### Constraints & Risks

- **Role naming**: The backend `Role` enum uses `VIEWER` for regular customers, NOT `USER`. The frontend must send `"VIEWER"` when registering a customer.
- **Register is multipart**: `POST /api/auth/register` expects `multipart/form-data` with a `data` JSON part and optional `profileImage` file part. The frontend must use `FormData`.
- **Profile update is multipart**: `PUT /api/user/profile` also uses `multipart/form-data` with `data` JSON part and optional `profileImage`.
- **No public service list endpoint**: `GET /api/service/provider-all` requires authentication and returns the current provider's own services. There is no endpoint to list services for a specific provider by ID as a customer. The provider detail page will show the `ProviderRegistrationResponse` fields only; a separate endpoint or a workaround may be needed later. For Phase 1, the provider detail page displays provider info only.
- **DateTime format**: Backend uses `LocalDateTime`. The frontend must send ISO 8601 format without timezone (e.g., `"2026-04-10T14:00:00"`).
- **CORS must be configured before any frontend API call works**.
- **JWT token**: Stored in `localStorage` under key `token`. User info (`id`, `username`, `role`) stored under key `user`.
- **All pages except `/login` and `/register` require authentication**. Unauthenticated users are redirected to `/login`.

### Implementation Steps

#### Step 1: Backend CORS Configuration

**File**: `booking-backend/src/main/java/com/booking/common/security/SecurityConfig.java`

**What**: Add a `CorsConfigurationSource` bean and wire it into the security filter chain.

- Add import: `org.springframework.web.cors.CorsConfiguration`, `org.springframework.web.cors.CorsConfigurationSource`, `org.springframework.web.cors.UrlBasedCorsConfigurationSource`
- Add a `@Bean` method `corsConfigurationSource()` that:
  - Creates a `CorsConfiguration`
  - Sets allowed origins: `http://localhost:3000`
  - Sets allowed methods: `GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`
  - Sets allowed headers: `*`
  - Sets `allowCredentials(true)`
  - Registers this config for pattern `/**` via `UrlBasedCorsConfigurationSource`
- In the `securityFilterChain` method, add `.cors(cors -> cors.configurationSource(corsConfigurationSource()))` before the `.csrf(...)` call.

**Why**: Without this, the browser blocks all frontend-to-backend API calls.

#### Step 2: Frontend TypeScript Types

**File (new)**: `frontend/lib/types.ts`

**What**: Define TypeScript interfaces matching the backend DTOs:

- `JwtResponse` -- `{ token: string; type: string; id: string; username: string; email: string; role: string }`
- `LoginRequest` -- `{ usernameOrEmail: string; password: string }`
- `RegisterRequest` -- `{ username: string; email: string; password: string; phoneNo: string; role: string }`
- `UserResponse` -- `{ userId: string; username: string; email: string; phoneNo: string; role: string; profileImageUrl: string | null; gmtCreate: string; gmtModified: string }`
- `UserProfileUpdateRequest` -- `{ username: string; email: string; phoneNo: string }`
- `ProviderResponse` -- `{ providerId: string; providerName: string; providerBio: string; profileImageUrl: string | null; imagePath: string[]; location: string; averageRating: number | null; totalReviews: number | null; maxConcurrency: number; isCompleted: boolean }`
- `ServiceResponse` -- `{ serviceId: string; providerId: string; userId: string; serviceName: string; serviceBio: string; duration: number; price: number; imagePath: string[]; gmtCreate: string; remarks: string | null }`
- `AppointmentResponse` -- `{ appointmentId: string; serviceId: string; providerId: string; userId: string; gmtCreate: string; startTime: string; endTime: string; remarks: string | null }`
- `CreateAppointmentRequest` -- `{ serviceId: string; startTime: string; endTime: string; remarks?: string }`

**Why**: Typed API contracts prevent runtime errors and document the backend interface.

#### Step 3: API Client Module

**File (new)**: `frontend/lib/api.ts`

**What**: Create a centralized API client with these characteristics:

- Constant `API_BASE = "http://localhost:8080/api"`
- Helper function `authHeaders(): HeadersInit` that reads `token` from `localStorage` and returns `{ Authorization: "Bearer <token>" }` (or empty object if no token).
- Helper function `handleResponse<T>(res: Response): Promise<T>` that checks `res.ok`, throws an error with the response text if not ok, and returns `res.json()` otherwise.
- Auth functions:
  - `login(data: LoginRequest): Promise<JwtResponse>` -- POST `/api/auth/login`, JSON body
  - `register(data: RegisterRequest, profileImage?: File): Promise<string>` -- POST `/api/auth/register`, multipart (FormData with `data` as JSON Blob and optional `profileImage`)
- User functions:
  - `getProfile(): Promise<UserResponse>` -- GET `/api/user/profile`, authenticated
  - `updateProfile(data: UserProfileUpdateRequest, profileImage?: File): Promise<UserResponse>` -- PUT `/api/user/profile`, multipart, authenticated
- Provider functions:
  - `searchProviders(queryName: string): Promise<ProviderResponse[]>` -- GET `/api/provider/?queryName=`, authenticated
  - `getProviderById(providerId: string): Promise<ProviderResponse>` -- GET `/api/provider/{providerId}`, authenticated
- Appointment functions:
  - `createAppointment(data: CreateAppointmentRequest): Promise<AppointmentResponse>` -- POST `/api/appointment/`, JSON body, authenticated
  - `deleteAppointment(appointmentId: string): Promise<AppointmentResponse>` -- DELETE `/api/appointment/{appointmentId}`, authenticated
  - `getUserAppointments(status: "unaccepted" | "accepted" | "completed" | "not-completed"): Promise<AppointmentResponse[]>` -- GET `/api/appointment/user/{status}`, authenticated

**Why**: Centralizes all fetch logic, token handling, and error handling in one place.

#### Step 4: Auth Context Provider

**File (new)**: `frontend/lib/auth-context.tsx`

**What**: Create a React Context for auth state. Mark this file `"use client"`.

- `AuthContextType` interface: `{ token: string | null; user: { id: string; username: string; role: string } | null; login: (jwtResponse: JwtResponse) => void; logout: () => void; isAuthenticated: boolean }`
- `AuthContext` created via `createContext<AuthContextType>`
- `AuthProvider` component:
  - State: `token` and `user`, initialized from `localStorage` on mount (inside `useEffect` to avoid SSR issues)
  - `login(jwtResponse)`: saves `token` and `{ id, username, role }` to both state and `localStorage`
  - `logout()`: clears state and `localStorage`, redirects to `/login` via `useRouter()`
  - Renders `<AuthContext.Provider value={...}>{children}</AuthContext.Provider>`
- `useAuth()` custom hook: calls `useContext(AuthContext)`, throws if used outside provider.

**Why**: All pages need access to auth state; Context is the simplest approach without adding a state management library.

#### Step 5: Auth Guard Component

**File (new)**: `frontend/lib/auth-guard.tsx`

**What**: A `"use client"` component `AuthGuard` that wraps children:

- Uses `useAuth()` to check `isAuthenticated`
- Uses `usePathname()` from `next/navigation`
- If not authenticated and path is not `/login` or `/register`, redirect to `/login` via `useRouter().replace("/login")`
- While checking (initial load), render a loading spinner or null
- If authenticated or on public path, render `{children}`

**Why**: Enforces the requirement that all pages except login/register require authentication.

#### Step 6: Update Root Layout

**File (modify)**: `frontend/app/layout.tsx`

**What**:
- Import `AuthProvider` from `@/lib/auth-context`
- Import `AuthGuard` from `@/lib/auth-guard`
- Update metadata: title to `"Booking Platform"`, description to `"Book appointments with service providers"`
- Wrap `{children}` with `<AuthProvider><AuthGuard>{children}</AuthGuard></AuthProvider>`

**Why**: All pages need auth context and route protection.

#### Step 7: Login Page

**File (new)**: `frontend/app/login/page.tsx`

**What**: A `"use client"` page component at route `/login`:

- Form fields: `usernameOrEmail` (text input), `password` (password input)
- Submit handler calls `api.login()`, then calls `auth.login(jwtResponse)` from context, then redirects to `/` via `router.push("/")`
- Error state displayed below the form
- Loading state disables the submit button
- Link to `/register` at the bottom
- Styled with Tailwind: centered card layout, clean form styling

**Why**: Entry point for existing users.

#### Step 8: Register Page

**File (new)**: `frontend/app/register/page.tsx`

**What**: A `"use client"` page component at route `/register`:

- Form fields: `username`, `email`, `password`, `phoneNo`, optional `profileImage` (file input)
- The `role` field is hardcoded to `"VIEWER"` (hidden from the user -- Phase 1 is customer-only)
- Submit handler builds the request and calls `api.register()`, then redirects to `/login` with a success message (via query param or state)
- Client-side validation: username 3-20 chars, email format, password min 8 chars, phone 10-15 digits
- Error state and loading state
- Link to `/login` at the bottom
- Styled with Tailwind: centered card layout

**Why**: Entry point for new customers.

#### Step 9: Navigation Bar Component

**File (new)**: `frontend/components/navbar.tsx`

**What**: A `"use client"` component `Navbar`:

- Shows app name/logo on the left
- Navigation links: Home (providers list), My Appointments, Profile
- Shows username and logout button on the right (from `useAuth()`)
- Only renders when authenticated
- Responsive: hamburger menu on mobile
- Styled with Tailwind

**Why**: Persistent navigation across all authenticated pages.

#### Step 10: Home Page -- Provider Search & List

**File (modify)**: `frontend/app/page.tsx`

**What**: Replace the default Next.js page. Make it a `"use client"` component:

- Search bar at the top: text input + search button
- Calls `api.searchProviders(queryName)` on search
- Displays results as a grid of provider cards
- Each card shows: `providerName`, `providerBio` (truncated), `location`, `averageRating`, `profileImageUrl`, `totalReviews`
- Clicking a card navigates to `/providers/[providerId]`
- Empty state when no results
- Loading state during fetch
- Includes `Navbar` at the top

**Why**: Main landing page for authenticated users to discover providers.

#### Step 11: Provider Detail Page

**File (new)**: `frontend/app/providers/[providerId]/page.tsx`

**What**: A `"use client"` page component:

- Calls `api.getProviderById(providerId)` on mount (providerId from route params)
- Displays full provider info: name, bio, location, rating, images (carousel or grid from `imagePath`), profile image
- Shows a "Book Appointment" section with:
  - A date-time picker for start time
  - A date-time picker for end time (or auto-calculate from service duration if known)
  - A remarks text field
  - A service ID input (text field for now since there is no endpoint to list a provider's services by provider ID; the user must know the service ID -- document this limitation)
  - Submit button calls `api.createAppointment()`
- Success/error feedback after booking
- Back button to return to home
- Includes `Navbar`

**Note on limitation**: The backend lacks a public endpoint to list services by provider ID. The booking form requires a `serviceId` which the user must input manually. This will be improved when a public service listing endpoint is added.

**Why**: Users need to view provider details and book appointments.

#### Step 12: My Appointments Page

**File (new)**: `frontend/app/appointments/page.tsx`

**What**: A `"use client"` page component:

- Tab bar or filter buttons: "Pending" (unaccepted), "Accepted", "Completed", "In Progress" (not-completed)
- Default tab: "Pending"
- Each tab calls the corresponding `api.getUserAppointments(status)` on selection
- Displays appointments as a list/cards showing: `startTime`, `endTime`, `remarks`, `serviceId`, `providerId`, `gmtCreate`
- "Pending" appointments show a "Cancel" button that calls `api.deleteAppointment(appointmentId)` with confirmation dialog
- Loading and empty states
- Includes `Navbar`

**Why**: Users need to track their appointment status.

#### Step 13: User Profile Page

**File (new)**: `frontend/app/profile/page.tsx`

**What**: A `"use client"` page component:

- Calls `api.getProfile()` on mount to fetch current profile
- Displays profile info in a form (pre-filled): `username`, `email`, `phoneNo`
- Profile image display and file input for changing it
- "Save" button calls `api.updateProfile()` with FormData
- Success/error feedback
- Read-only display of `role`, `gmtCreate`
- Includes `Navbar`

**Why**: Users need to view and edit their profile.

#### Step 14: Shared UI Components

**File (new)**: `frontend/components/loading-spinner.tsx`

**What**: A simple Tailwind-styled loading spinner component (animated SVG or CSS spinner).

**File (new)**: `frontend/components/provider-card.tsx`

**What**: A reusable card component for displaying a provider in the search results grid. Props: `ProviderResponse`. Renders name, bio snippet, location, rating stars, image.

**Why**: Reusable UI pieces keep page components clean.

### Acceptance Criteria

- CORS: Frontend at `http://localhost:3000` can make API calls to `http://localhost:8080` without browser CORS errors.
- Register: A new user can register with username, email, password, phone number. The role `VIEWER` is sent automatically. After successful registration, the user is redirected to the login page.
- Login: A user can log in with username/email and password. On success, the JWT token and user info are stored in `localStorage` and the user is redirected to the home page.
- Auth guard: Navigating to any page other than `/login` or `/register` without a token redirects to `/login`.
- Logout: Clicking logout clears the token and redirects to `/login`.
- Provider search: Entering a query in the search bar and submitting fetches and displays matching providers as cards.
- Provider detail: Clicking a provider card navigates to the detail page showing full provider info.
- Appointment booking: Filling in the booking form on the provider detail page and submitting creates an appointment via the API.
- My appointments: The appointments page shows the user's appointments filtered by status tab, with the ability to cancel pending appointments.
- Profile: The profile page loads and displays current user info, and the update form saves changes successfully.
- All pages include the navigation bar when authenticated.
- All API errors are displayed to the user with meaningful messages.

---

## Phase 2: Provider Dashboard (future work)

### Scope

Build the provider-facing pages for managing their business:

- **Provider registration flow**: Page for a `VIEWER` to upgrade to `PROVIDER` by filling in `ProviderRegistrationRequest` (name, bio, location, max concurrency, shop images) via `POST /api/provider/register`.
- **Provider profile management**: Edit provider profile via `PUT /api/provider/` (name, bio, location, images).
- **Service management**: CRUD for services (`POST /api/service`, `PUT /api/service/{id}`, `PUT /api/service/disabled/{id}`). List own services via `GET /api/service/provider-all`.
- **Schedule management**: Set weekly schedule via `POST /api/provider/schedule`, update via `PUT /api/provider/schedule`.
- **Schedule overrides**: Create/manage override blocks (requires reading `ScheduleOverrideController` endpoints).
- **Role-based routing**: Provider-only pages protected with `@PreAuthorize("hasAuthority('PROVIDER')")` equivalent on the frontend (check `user.role === "PROVIDER"`).

### Key Backend Endpoints

- `POST /api/provider/register` -- multipart
- `PUT /api/provider/` -- multipart
- `POST /api/provider/schedule` -- JSON array
- `PUT /api/provider/schedule` -- JSON array
- `POST /api/service` -- multipart
- `PUT /api/service/{serviceId}` -- multipart
- `PUT /api/service/disabled/{serviceId}` -- toggle
- `GET /api/service/provider-all` -- list own services
- Schedule override endpoints (TBD -- read controller)

---

## Phase 3: Appointment Management (future work)

### Scope

Build the full appointment lifecycle for both providers and customers:

- **Provider appointment views**: Pages for unaccepted, accepted, completed, and in-progress appointments (`GET /api/appointment/provider/*`).
- **Accept appointment**: Provider clicks accept, calls `PUT /api/appointment/{id}/accept`.
- **Complete appointment**: Provider marks appointment done, calls `PUT /api/appointment/{id}/complete`.
- **User cancel**: Already partially built in Phase 1 (delete endpoint). Refine UX with confirmation and status feedback.
- **Appointment history**: Combined history view for user with sorting/filtering.
- **Notifications**: Optional -- toast notifications or badge counts for new/accepted appointments.
- **Reviews**: Submit reviews after completed appointments (requires `ReviewDO` service to be built on backend).

### Key Backend Endpoints

- `GET /api/appointment/provider/unaccepted`
- `GET /api/appointment/provider/accepted`
- `GET /api/appointment/provider/completed`
- `GET /api/appointment/provider/not-completed`
- `PUT /api/appointment/{id}/accept`
- `PUT /api/appointment/{id}/complete`
- `DELETE /api/appointment/{id}` (user cancel)
- Review endpoints (TBD)
