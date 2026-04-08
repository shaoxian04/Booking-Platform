# Provider Storefront — Implementation State

## Phase Progress
- [x] Phase 1 — Backend: Categories + Registration Hardening: APPROVED
- [x] Phase 2 — Frontend: Registration Flow Fix + Become-a-Provider: IN PROGRESS (awaiting evaluation)
- [ ] Phase 3 — Frontend: Public Storefront + Category Browsing: IN PROGRESS (awaiting evaluation)
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

## Phase 3 Summary
### What Was Built
- `frontend/components/category-pills.tsx` — read-only display pill row; takes `categories: Category[]`; renders `bg-{color}-100 text-{color}-700 rounded-full` pills using `CATEGORY_COLORS` and `CATEGORY_LABELS`; returns null when empty
- `frontend/components/category-filter-bar.tsx` — horizontal scrollable pill bar with "All" option (violet/indigo gradient when selected) and one pill per category (filled bg from CATEGORY_COLORS when selected, white border otherwise); uses `flex gap-2 overflow-x-auto pb-2` with `flex-shrink-0` on each pill
- `frontend/app/providers/[providerId]/page.tsx` (full rewrite):
  - Hero: `h-72 md:h-96 relative overflow-hidden rounded-b-3xl`; background is `imagePath[0]` or a violet/indigo gradient with large initial letter (opacity 0.2); dark `bg-gradient-to-t from-black/70` overlay; back link top-left; provider name, CategoryPills, location pin, star rating + review count bottom-left
  - Gallery strip: only rendered when `imagePath.length > 1`; `overflow-x-auto` with `snap-x snap-mandatory`; thumbnails `w-48 h-32 rounded-2xl object-cover flex-shrink-0 snap-start`
  - Two-column layout (md:flex-row): left (flex-1) = About card (hidden when bio empty) + Services grid (1 col mobile, 2 cols md+); right (md:w-80 md:sticky) = booking form
  - Service cards: image or gradient placeholder, service name, bio excerpt, CategoryPills, duration + price row; selected state shows violet border + checkmark
  - All booking state (selectedService, startTime, endTime, remarks, bookingLoading, bookingError, bookingSuccess) fully preserved
  - Now uses `getProviderByIdPublic` for all users (public endpoint — no auth required)
- `frontend/app/page.tsx`:
  - Added `selectedCategory: Category | null` state
  - Added `<CategoryFilterBar>` in a white bar below the hero, above the guest CTA row
  - `handleCategorySelect`: fetches by category; when cleared to null and query exists, re-runs name search; when cleared with no query, resets to "How it works" landing state
  - `handleSearch`: when category is active, fetches by category and filters client-side by name; otherwise runs existing name search
  - Removed old hardcoded category chip row (emoji-based keyword shortcuts)
  - Guest CTA "I'm a provider" link updated from `/register?role=PROVIDER` to `/become-provider`
- `frontend/components/provider-card.tsx`:
  - Added import for `CategoryPills`
  - Renders `<CategoryPills categories={provider.categories} />` beneath location line when categories are present

### Build result
- `npm run build` passes with zero TypeScript/compilation errors (Turbopack, Next.js 16.0.5)

### Known Issues
- None identified

## Infrastructure
- Backend: http://localhost:8080
- Frontend: http://localhost:3000 (or http://localhost via Docker)
