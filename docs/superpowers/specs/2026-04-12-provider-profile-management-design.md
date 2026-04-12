# Provider Profile Management Page — Design Spec

**Date:** 2026-04-12  
**Status:** Approved

---

## Overview

Replace the current minimal form at `/dashboard/profile` with a rich, storefront-style profile management page. Providers see their profile exactly as customers would, with an "Edit Profile" button that transitions the page into inline edit mode. Pressing "Publish" saves changes immediately to the live public profile.

---

## Goals

- Providers can view their own public profile presentation inside the dashboard.
- Providers can edit every profile field inline on the same page without navigating to a separate form.
- Providers can open their actual public storefront in a new tab to verify the customer view.
- No backend changes required.

---

## Route & Access

| Property | Value |
|---|---|
| Route | `/dashboard/profile` (replaces existing page) |
| Auth guard | `AuthGuard` with `requiredRole="PROVIDER"` (inherited from dashboard layout) |
| Sidebar link | "My Profile" — no change needed |

---

## Data

### On load

1. `getMyProviderProfile()` — `GET /api/provider/me` — returns `ProviderResponse` including `providerId`, all profile fields, images.
2. `getMyServices()` — `GET /api/service/provider-all` — returns the provider's own services (including disabled). Used instead of the public endpoint so disabled services are visible to the owner.

### On publish

`updateProviderProfile(payload, profileImage?, providerImages?)` — `PUT /api/provider/` — multipart form with a `data` JSON blob, optional `profileImage`, optional `providerImages[]`. Returns updated `ProviderResponse`. No backend changes needed.

---

## Page Modes

The page has two modes controlled by a `isEditing: boolean` state variable.

### View Mode (default)

Renders the full storefront layout — same visual structure as `/providers/[providerId]` — so the provider sees exactly what customers see. Two controls visible only on this dedicated page:

- **"Edit Profile" button** — overlaid top-right on the hero image (semi-transparent dark pill button). Clicking it enters Edit Mode.
- **"View Public Page →" link** — opens `/providers/[providerId]` in a new tab. Positioned below the hero alongside provider metadata.

Services section shows `getMyServices()` results (all services, including disabled). Disabled services display a faded "Disabled" badge so the provider can distinguish them from live services.

### Edit Mode

Activated by "Edit Profile". A **sticky top bar** slides in at the top of the page containing:
- "Publish" button (violet gradient, disabled while saving)
- "Cancel" button (slate outline)
- Loading spinner during save

The storefront layout remains intact but each section's content is replaced with editable inputs:

| Section | Editable controls |
|---|---|
| Hero | Text input: provider name; text input: location; text input: available time; file input: profile image (clicking the hero image opens picker) |
| Categories | `CategoryMultiSelect` component (replaces read-only category pills) |
| About | Textarea: bio |
| Gallery | Existing images shown with a remove (×) button on hover; "Add images" button appends new files |
| Advanced | Number input: max concurrent bookings |
| Services | Read-only grid (greyed overlay with "Manage Services →" link — edits happen on `/dashboard/services`) |

#### Publish flow

1. User clicks "Publish".
2. Build `payload` from current edit state fields.
3. Call `updateProviderProfile(payload, newProfileImage?, newGalleryImages?)`.
4. On success: update page state from response, clear pending image files, exit Edit Mode, show brief success banner.
5. On error: show error banner, remain in Edit Mode.

#### Cancel flow

Discard all local edit state, restore original values from the last successful load/publish, exit Edit Mode. No API call.

---

## Component Structure

All logic lives in a single file: `frontend/app/dashboard/profile/page.tsx`.

No shared components are extracted — the public storefront and this page diverge enough in behaviour (edit controls, auth data source, disabled-service display) that extracting shared components would add indirection without benefit.

Internal structure:

```
DashboardMyProfilePage (default export)
  ├── sticky edit bar (Edit Mode only)
  ├── HeroSection  — view or edit variant
  ├── GalleryStrip — view or edit variant  
  ├── AboutSection — view or edit variant
  ├── AdvancedSection — view or edit variant (max concurrency)
  ├── ServicesSection — always read-only grid
  └── success/error banners
```

Each "section" is a conditional render block inside the page component, not a separate exported component.

---

## State Variables

```ts
// Page state
isLoading: boolean
loadError: string
isEditing: boolean
isSaving: boolean
successMsg: string
errorMsg: string

// Loaded data (source of truth in view mode)
provider: ProviderResponse | null
services: ServiceResponse[]

// Edit state (mirrors provider fields, copied from `provider` state when "Edit Profile" is clicked)
editName: string
editLocation: string
editAvailableTime: string
editBio: string
editCategories: Category[]
editMaxConcurrency: number
editExistingImages: string[]   // gallery URLs to keep
newProfileImage: File | null
newProfileImagePreview: string | null
newGalleryImages: File[]
```

---

## Visual Design

Follows the existing design system: `bg-slate-50` page background, `rounded-2xl` cards, `shadow-sm` borders, `from-violet-600 to-indigo-600` gradient for primary actions.

- Hero height: `h-72 md:h-96`, same as public storefront.
- Edit Mode inputs: `border border-slate-200 rounded-xl px-4 py-3 text-sm bg-slate-50 focus:ring-2 focus:ring-violet-500` — same style used across the dashboard.
- Sticky bar: `fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-b border-slate-100 shadow-sm`.
- "Disabled" badge on services: `bg-slate-100 text-slate-400 text-xs rounded-full px-2 py-0.5`.

---

## What Does NOT Change

- Backend: no new endpoints, no schema changes.
- `frontend/lib/api.ts`: no new functions.
- `frontend/lib/types.ts`: no new types.
- Public storefront `frontend/app/providers/[providerId]/page.tsx`: unchanged.
- Dashboard sidebar and layout: unchanged.
- Dashboard services page: unchanged.

---

## Out of Scope

- Schedule management (weekly hours, overrides) — separate feature.
- Review management — separate feature.
- Real-time preview while typing (edit state is committed on Publish only).
