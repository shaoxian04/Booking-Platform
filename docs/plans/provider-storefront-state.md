# Provider Storefront — Implementation State

## Phase Progress
- [x] Phase 1 — Backend: Categories + Registration Hardening: APPROVED
- [ ] Phase 2 — Frontend: Registration Flow Fix + Become-a-Provider: IN PROGRESS (awaiting evaluation)
- [ ] Phase 3 — Frontend: Public Storefront + Category Browsing: NOT STARTED
- [ ] Phase 4 — Provider Dashboard: Profile + Service Categories: NOT STARTED

## Phase 1 Summary
### What Was Built
- `Category` enum with 10 values (FITNESS, BEAUTY, HEALTH, HOME_SERVICES, EDUCATION, FOOD, PETS, WELLNESS, TECH, OTHER) and static `isValid()` helper
- `categories` field (`text[]`) added to `ProviderProfileDO` and `ServiceProvideDO` with default empty list
- `categories: List<String>` added to `ProviderRegistrationRequest` and `CreateServiceRequest` (optional, defaults to empty list)
- `categories` added to `ProviderRegistrationResponse` and `CreateServiceResponse`
- `ProviderMapper` and `ServiceProvideMapper` updated to map categories in both directions, null-safe
- Category validation in `ProviderProfileServiceImpl` (register + update) and `ServiceProvideServiceImpl` (create + update) — throws `IllegalArgumentException` (caught as 400) on invalid value
- `role` field removed from `RegisterRequest`; `AuthServiceImpl` already hardcoded `Role.VIEWER`
- `POST /api/provider/register` annotated with `@PreAuthorize("hasAuthority('VIEWER')")` — PROVIDER users get 403
- `findByCategory` native query added to `ProviderProfileRepository`
- `queryByCategory` method added to `ProviderProfileService` interface and implemented in `ProviderProfileServiceImpl`
- `GET /api/public/provider/category?category=FITNESS` endpoint added to `PublicProviderController`
- `http://localhost` added to CORS allowed origins in `SecurityConfig`

## Phase 2 Summary
### What Was Built
- `Category` type union added to `frontend/lib/types.ts`; `categories?: Category[]` added to `ProviderResponse` and `ServiceResponse`; `role` removed from `RegisterRequest`
- `frontend/lib/categories.ts` — exports `CATEGORIES` (ordered list), `CATEGORY_LABELS` (human-readable), `CATEGORY_COLORS` (Tailwind bg/text per category)
- `frontend/lib/api.ts` — `register()` no longer sends `role` field; added `becomeProvider()` (multipart POST /api/provider/register with JWT) and `getProvidersByCategory()` (GET /api/public/provider/category)
- `frontend/app/register/page.tsx` — role toggle UI removed; form always submits as customer; hero copy updated to "Create your customer account"
- `frontend/components/category-multiselect.tsx` — pill-based multi-select for all 10 categories with per-category color highlighting, `max` cap with disabled state, and selected count label
- `frontend/app/become-provider/page.tsx` — auth-guarded split-panel page with 3 labeled form sections (Identity, About, Images); redirects PROVIDER users to /dashboard; success screen instructs user to re-login with "Log out now" button
- `frontend/components/navbar.tsx` — "Become a Provider" gradient CTA button added to desktop nav and mobile menu for VIEWER users only

### Known Issues
- None identified

## Infrastructure
- Backend: http://localhost:8080
- Frontend: http://localhost:3000 (or http://localhost via Docker)
