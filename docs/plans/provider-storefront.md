# Provider Storefront & Category System — Implementation Plan

## Goal
Add a multi-category taxonomy, lock down the registration flow so only VIEWERs can self-register and "becoming a provider" is a deliberate post-login action, build a rich public provider storefront, enable category-based browsing on the home page, and let providers manage their full profile (bio, categories, images) from the dashboard.

## Context

### Backend (`booking-backend/src/main/java/com/booking/`)
- `common/enums/Role.java` — `VIEWER`, `PROVIDER`, `ADMIN`. Add new enum `Category` alongside it.
- `common/security/SecurityConfig.java` — CORS allows only `http://localhost:3000`; needs `http://localhost` added.
- `entity/DO/ProviderProfileDO.java` — uses `@JdbcTypeCode(SqlTypes.ARRAY)` `text[]` pattern for `imagePath`. Categories will use the same pattern.
- `entity/DO/ServiceProvideDO.java` — same `text[]` pattern available for `imagePath`.
- `entity/DO/UserDO.java` — has `role` field of type `Role`; will need to be flipped to `PROVIDER` after a viewer becomes a provider.
- `entity/DTO/request/RegisterRequest.java` — currently exposes `role`; will be locked to VIEWER.
- `entity/DTO/request/ProviderRegistrationRequest.java` (and its child `ProviderUpdateRequest`) — gain `categories` field.
- `entity/DTO/request/CreateServiceRequest.java` (and its child `ServiceUpdateRequest`) — gain `categories` field.
- `entity/DTO/response/ProviderRegistrationResponse.java` and `CreateServiceResponse.java` — gain `categories` field.
- `entity/mapper/ProviderProfileMapper.java`, `entity/mapper/ServiceMapper.java` — wire categories through DO/DTO conversions.
- `controller/AuthController.java` — `POST /api/auth/register`. Multipart accepts `data` + `profileImage`.
- `controller/ProfileProviderController.java` — `POST /register` becomes VIEWER-only, must trigger role upgrade.
- `controller/PublicProviderController.java` — needs new `GET /category` endpoint.
- `controller/ServiceProvideController.java` — services already CRUD'd; just propagate new field.
- `service/auth/AuthServiceImpl.java` — registration logic; force VIEWER on register.
- `service/provider/ProfileProviderServiceImpl.java` — register provider must upgrade `UserDO.role` to `PROVIDER` and persist via `UserRepository.save()`.
- `repository/ProviderProfileRepository.java` — needs a category-filter query (native or JPQL with `MEMBER OF` / `ANY`).

### Frontend (`frontend/`)
- `lib/types.ts` — DTO mirrors; add `Category` string-union, extend `ProviderProfile`, `ServiceProvide`, request types.
- `lib/api.ts` — add `getProvidersByCategory`, `becomeProvider` (multipart), `updateProviderProfile`, propagate categories on existing service create/update.
- `app/register/page.tsx` — remove the VIEWER/PROVIDER toggle.
- `app/providers/[providerId]/page.tsx` — total redesign into hero + gallery + about + services grid.
- `app/page.tsx` — add category pill bar; switch search to category filter alongside name search.
- `app/dashboard/services/page.tsx` — add category multi-select to service creation.
- `app/dashboard/page.tsx` (provider sidebar in `app/dashboard/layout.tsx`) — add "My Profile" link.
- `components/navbar.tsx` — add "Become a Provider" link for VIEWER role.
- New: `app/become-provider/page.tsx`, `app/dashboard/profile/page.tsx`, `components/category-pills.tsx`, `components/category-multiselect.tsx`.

## Constraints & Risks
- `ddl-auto=update`: Hibernate will create `categories text[]` columns automatically — no migration required.
- `ProviderUpdateRequest extends ProviderRegistrationRequest` and `ServiceUpdateRequest extends CreateServiceRequest`: adding `categories` to the parents covers the children.
- **[SECURITY]** `RegisterRequest` currently lets a client self-assign `PROVIDER`. This is privilege escalation — must be fixed in Phase 1.
- **[SECURITY]** `POST /api/provider/register` must require `hasAuthority('VIEWER')`; otherwise an existing PROVIDER could double-register or an ADMIN path could be misused.
- After role upgrade, the user's existing JWT still says VIEWER. They must re-login. The `/become-provider` success screen must say so explicitly.
- Category enum must be the same string set on both ends. Backend enum is the source of truth; frontend hardcodes the same labels (acceptable since the enum is fixed and small).
- CORS: add `http://localhost` (no port — Docker/Traefik) alongside `http://localhost:3000`.
- Storing `Category` as `List<String>` (not `List<Category>`) keeps the existing `text[]` pattern and avoids Hibernate enum-array headaches; service layer must validate each value parses into the `Category` enum before persisting.
- Public category-filter query on PostgreSQL `text[]`: use a native query with `:category = ANY(categories)` to leverage the array column.

## Design Direction (frontend changes)
- **Color palette**: keep violet/indigo gradient (`from-violet-600 to-indigo-600`) for primary CTAs. Categories get a fixed color map (e.g., FITNESS=emerald, BEAUTY=pink, HEALTH=rose, HOME_SERVICES=amber, EDUCATION=sky, FOOD=orange, PETS=lime, WELLNESS=teal, TECH=indigo, OTHER=slate) — used as soft `bg-{color}-100 text-{color}-700` pills.
- **Layout philosophy**:
  - Storefront: full-bleed hero image with dark gradient overlay, provider name + categories overlaid bottom-left. Gallery is a horizontal scroll strip (`overflow-x-auto snap-x`). About + services in a two-column layout on desktop, stacked on mobile.
  - Become-provider: split-panel like login/register — left is a gradient marketing panel, right is the multi-step form.
  - Dashboard profile: single centered card with sectioned form (Identity / About / Categories / Images).
  - Home category bar: horizontal scrollable pill row above the existing search; selected pill becomes filled gradient.
- **Anti-patterns to avoid**: no generic "feature card grid" hero, no placeholder stock photos in the storefront fallback (use an elegant gradient with the provider's initial), no full-width purple banners on every section, no duplicated category pills inside a single card.

---

## Phases

### Phase 1 — Backend: Categories + Registration Hardening

**Scope:** Land the data model + secure the registration flow without touching the storefront yet. After this phase the backend should accept categories on every relevant endpoint and refuse PROVIDER self-registration.

**Steps:**

1. **Create `common/enums/Category.java`** — enum with values `FITNESS, BEAUTY, HEALTH, HOME_SERVICES, EDUCATION, FOOD, PETS, WELLNESS, TECH, OTHER`. Add a static `isValid(String)` helper.

2. **Add `categories` to `ProviderProfileDO`** — `@JdbcTypeCode(SqlTypes.ARRAY)` `@Column(name = "categories", columnDefinition = "text[]")` `private List<String> categories;`. Default to empty list in builder/no-args.

3. **Add `categories` to `ServiceProvideDO`** — same pattern.

4. **Add `categories` to request DTOs** — `ProviderRegistrationRequest` (`List<String> categories`, optional, validated server-side); inherited automatically by `ProviderUpdateRequest`. Same for `CreateServiceRequest` → inherited by `ServiceUpdateRequest`.

5. **Add `categories` to response DTOs** — `ProviderRegistrationResponse`, `CreateServiceResponse`.

6. **Update mappers** — `ProviderProfileMapper` and `ServiceMapper` (or whatever the existing converters are called) to copy `categories` in both directions. Null-safe: treat null incoming list as empty.

7. **Validate categories at the service layer** — in `ProfileProviderServiceImpl` (register + update) and `ServiceProvideServiceImpl` (create + update), iterate the incoming list, call `Category.isValid`, and throw a `BusinessException` (or whatever `ResultCode.PARAM_ERROR` style exception the codebase uses) on first invalid value.

8. **[SECURITY] Lock `RegisterRequest` to VIEWER** — in `entity/DTO/request/RegisterRequest.java`, remove the `role` field entirely. In `AuthServiceImpl.register`, hardcode `userDO.setRole(Role.VIEWER)`. Update any test fixtures that previously sent `role`.

9. **[SECURITY] Restrict `POST /api/provider/register`** — annotate `ProfileProviderController.registerProvider` with `@PreAuthorize("hasAuthority('VIEWER')")`. After successful provider profile creation in `ProfileProviderServiceImpl`, fetch the `UserDO`, set `role = Role.PROVIDER`, and `userRepository.save(user)`. Wrap in the same transaction as the provider profile create.

10. **Add category-filter repository query** — in `ProviderProfileRepository`, add `@Query(value = "SELECT * FROM provider_profile WHERE :category = ANY(categories)", nativeQuery = true) List<ProviderProfileDO> findByCategory(@Param("category") String category);`.

11. **Add public category endpoint** — in `PublicProviderController`, add `GET /category?category=FITNESS`. Validate the category string with `Category.isValid`, call the new repository method via the service layer, map to `ProviderRegistrationResponse` list, return wrapped in the standard `RequestResult` envelope.

12. **CORS fix** — in `SecurityConfig`, add `http://localhost` to the allowed origins list alongside `http://localhost:3000`.

**Phase 1 Acceptance Criteria:**
- [ ] `Category` enum exists with all 10 values.
- [ ] `provider_profile.categories` and `service_provide.categories` columns exist (verify via `\d` in psql or app startup logs).
- [ ] `POST /api/auth/register` returns 400 if `role` is sent (or silently ignores it) and always creates a VIEWER.
- [ ] `POST /api/provider/register` returns 403 when called by a PROVIDER user; succeeds for a VIEWER and the user's role in DB flips to PROVIDER.
- [ ] `POST /api/service` accepts a `categories` array; invalid values return 400.
- [ ] `GET /api/public/provider/category?category=FITNESS` returns providers tagged FITNESS; invalid category returns 400.
- [ ] CORS preflight from `http://localhost` returns 200.

---

### Phase 2 — Frontend: Registration Flow Fix + Become-a-Provider

**Scope:** Realign the frontend with the locked-down registration flow so VIEWERs can deliberately upgrade to PROVIDER. No storefront work yet.

**Steps:**

1. **Update `lib/types.ts`** — add `export type Category = "FITNESS" | "BEAUTY" | ... | "OTHER"`. Add `categories?: Category[]` to `ProviderProfile`, `ServiceProvide`, `ProviderRegistrationRequest`-equivalent client types. Remove `role` from `RegisterRequest` client type.

2. **Add a `lib/categories.ts` constants file** — exports the ordered list of all categories, a `CATEGORY_LABELS` map (`FITNESS -> "Fitness"`), and a `CATEGORY_COLORS` map for the pill color classes.

3. **Update `lib/api.ts`**:
   - `register` no longer sends `role`.
   - Add `becomeProvider(data, profileImage, shopImages[])` — multipart `POST /api/provider/register` with the JWT.
   - Add `getProvidersByCategory(category)` — `GET /api/public/provider/category?category=`.

4. **Update `app/register/page.tsx`** — remove the VIEWER/PROVIDER toggle UI and any state related to role. Always submit as a viewer. Update the hero copy to say "Create your customer account."

5. **Create `app/become-provider/page.tsx`** — auth-guarded page that:
   - Redirects to `/login` if not authenticated.
   - Redirects to `/dashboard` if `user.role === 'PROVIDER'`.
   - Renders a multi-step form (single page is fine, sections labeled Step 1/2/3): identity (providerName, location, maxConcurrency), about (providerBio, categories multi-select), images (profileImage + shopImages).
   - On submit, calls `becomeProvider`, then shows a success screen explaining: "Your provider profile is live. Please log out and log back in to access your dashboard." with a "Log out now" button that calls the auth-context logout and redirects to `/login`.

6. **Create `components/category-multiselect.tsx`** — a reusable pill-toggle multi-select. Props: `value: Category[]`, `onChange`, `max?`. Uses the color map from `lib/categories.ts`.

7. **Update `components/navbar.tsx`** — when authenticated and `user.role === 'VIEWER'`, show a "Become a Provider" link in both desktop and mobile menus.

8. **Smoke check existing pages** — verify nothing else read `RegisterRequest.role` (search for `role:` in `app/register`, `lib/api.ts`).

**Phase 2 Acceptance Criteria:**
- [ ] `/register` no longer shows a VIEWER/PROVIDER toggle.
- [ ] A new VIEWER user sees "Become a Provider" in the navbar; a PROVIDER user does not.
- [ ] `/become-provider` is unreachable without auth; reachable for VIEWER; redirects PROVIDERs to `/dashboard`.
- [ ] Submitting the become-provider form successfully calls the backend and shows the "log out and log back in" success screen.
- [ ] After re-login the same user is now a PROVIDER and can reach `/dashboard`.

---

### Phase 3 — Frontend: Public Storefront + Category Browsing

**Scope:** The customer-visible payoff: rich provider page and category-driven home page.

**Steps:**

1. **Create `components/category-pills.tsx`** — read-only display variant: takes `categories: Category[]` and renders soft-color pills using `CATEGORY_COLORS`. Used on cards and storefront hero.

2. **Create `components/category-filter-bar.tsx`** — horizontal scrollable pill bar with all categories + an "All" option. Props: `selected: Category | null`, `onSelect`. Selected pill uses the violet/indigo gradient; others use `bg-white border`.

3. **Rewrite `app/providers/[providerId]/page.tsx`**:
   - Fetch via existing `getProviderByIdPublic` and `getServicesByProviderId`.
   - **Hero**: full-bleed `h-72 md:h-96` section. Background is `imagePath[0]` if present, else a violet/indigo gradient with a large initial letter. Dark `bg-gradient-to-t from-black/70` overlay. Bottom-left shows provider name (large white serif/display), star rating + review count, location with pin icon, and a `<CategoryPills>` row.
   - **Gallery strip**: if `imagePath.length > 1`, render a horizontal `overflow-x-auto snap-x` row of `imagePath.slice(1)` thumbnails (`w-48 h-32 rounded-2xl`).
   - **About section**: `rounded-2xl bg-white shadow-sm p-6` card with `providerBio`. If empty, hide.
   - **Services grid**: existing service cards but redesigned — each card has the service's `imagePath[0]` as a top image (`h-40 object-cover`), name, `<CategoryPills>` for service categories, price and duration row, and a "Book" button that opens the existing booking modal/flow.
   - Preserve all existing booking functionality (modal, time slot picker, submit).

4. **Update `app/page.tsx` (home)**:
   - Add `<CategoryFilterBar>` above the existing search bar.
   - State: `selectedCategory: Category | null`, `searchQuery: string`.
   - When `selectedCategory` changes, call `getProvidersByCategory`. When the search bar is used with no category, fall back to the existing `searchProvidersPublic`. When both are set, prefer category and filter results client-side by name match.
   - Render results using the existing `ProviderCard` but ensure it now shows `<CategoryPills>` on each card (update `components/provider-card.tsx`).

5. **Update `components/provider-card.tsx`** — add a `<CategoryPills>` row beneath the provider name when categories are present.

**Phase 3 Acceptance Criteria:**
- [ ] `/providers/{id}` shows hero with image-or-gradient, name, categories, rating, location.
- [ ] Gallery strip appears when the provider has 2+ images and is horizontally scrollable.
- [ ] About section renders `providerBio`; service cards show categories, price, duration, and image.
- [ ] Booking flow still works end-to-end from the new storefront.
- [ ] Home page shows a category filter bar; selecting a category fetches and displays only matching providers.
- [ ] Provider result cards show their category pills.

---

### Phase 4 — Provider Dashboard: Profile + Service Categories

**Scope:** Let providers actually populate the categories and images that Phase 3 displays.

**Steps:**

1. **Add `updateProviderProfile` to `lib/api.ts`** — multipart `PUT /api/provider` mirroring backend signature: `data: ProviderUpdateRequest` (includes `existingImages`, `categories`), `profileImage?`, `providerImages?`.

2. **Add `getMyProviderProfile` to `lib/api.ts`** — reuses existing `GET /api/provider/{providerId}` (provider auth) using the current user's id, OR calls the public endpoint. Pick the auth'd one to ensure private fields are included.

3. **Create `app/dashboard/profile/page.tsx`** — provider-only auth-guarded page:
   - Loads the current provider profile on mount.
   - Form sections: **Identity** (providerName, location, maxConcurrency), **About** (providerBio textarea), **Categories** (`<CategoryMultiSelect>`), **Profile image** (single file picker with preview), **Gallery** (list of existing image URLs with remove buttons + multi-file picker for new uploads).
   - On submit, builds a `ProviderUpdateRequest` with `existingImages` = the list after removals, calls `updateProviderProfile`, shows toast/success state.

4. **Update `app/dashboard/layout.tsx`** — add a "My Profile" link to the sidebar nav, between Appointments and Services.

5. **Update `app/dashboard/services/page.tsx`** — add `<CategoryMultiSelect>` to the service create form and to the edit form (if present). Wire `categories` into the create/update payloads. Display category pills on the existing service list rows.

6. **Verify update payloads round-trip** — create a service with categories, edit it, confirm categories persist; same for provider profile.

**Phase 4 Acceptance Criteria:**
- [ ] Provider sidebar shows "My Profile" link.
- [ ] `/dashboard/profile` loads the provider's current data and lets them edit every field listed above.
- [ ] Saving the profile updates the public storefront (refresh `/providers/{id}` to confirm).
- [ ] Removing an existing gallery image and saving actually removes it from the storefront.
- [ ] Service create/edit forms include category multi-select; saved categories appear on the storefront service cards.
- [ ] No regression in existing dashboard appointment / service-disable functionality.

---

## Overall Acceptance Criteria
- A new user cannot register as PROVIDER directly; they must register as VIEWER then go through `/become-provider`.
- Becoming a provider flips the user's role server-side and the user is told to re-login.
- Providers and services can each carry multiple categories from a fixed enum of 10.
- Customers can browse providers by category from the home page.
- Each provider has a rich storefront page with hero, gallery, bio, categories, and a services grid.
- Providers can fully edit their profile (text, categories, images) from the dashboard, and changes are reflected on the public storefront.
- All previously working flows (login, booking, appointment management, service create/disable) still work.
- CORS from `http://localhost` (Docker) and `http://localhost:3000` (dev) both succeed.

## Evaluation Rubric
Each dimension scored 1–10; weighted average must be ≥ 7.0 to pass.

- **Functionality (0.30)** — Categories persist and filter correctly; registration lock-down works (PROVIDER role cannot be self-assigned at `/api/auth/register`); become-provider flow upgrades the role; storefront renders real data; dashboard profile edits round-trip.
- **Craft (0.30)** — Category validation is centralized; mappers are null-safe; the role-upgrade write is in the same transaction as the provider profile create; no `console.log` left behind; error states handled on all new pages; image removal logic correctly diff's existing vs. new.
- **Design (0.20)** — Storefront feels like a real business profile (not a generic dashboard); category pills are consistently colored across cards, storefront, and filter bar; become-provider page matches the existing split-panel auth pages; no AI-slop hero patterns; mobile layouts work.
- **Completeness (0.20)** — Every acceptance criterion in every phase is checked; both backend endpoints (`/category` filter, locked-down `/provider/register`) exist and are wired into the frontend; CORS fix applied; navbar "Become a Provider" link present for VIEWERs only.
