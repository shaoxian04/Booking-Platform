# Provider Profile Management — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the simple edit form at `/dashboard/profile` with a storefront-style profile page that has view mode (customer preview) and inline edit mode with a sticky Publish bar.

**Architecture:** Single file replacement — `frontend/app/dashboard/profile/page.tsx`. View mode renders the full storefront layout (hero → gallery → about → services) so providers see exactly what customers see. Clicking "Edit Profile" enters edit mode, where each section's content is replaced by editable inputs; a sticky top bar holds Publish and Cancel. No backend or API changes.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4. Reuses existing `CategoryMultiSelect`, `LoadingSpinner`, `CategoryPills` components and `api.getMyProviderProfile`, `api.getMyServices`, `api.updateProviderProfile`.

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Modify (full rewrite) | `frontend/app/dashboard/profile/page.tsx` | Storefront-style view + edit page |

No other files change.

---

### Task 1: Scaffold the page — data fetching, loading/error states

**Files:**
- Modify: `frontend/app/dashboard/profile/page.tsx` (full rewrite)

- [ ] **Step 1: Replace the file with the scaffold below**

```tsx
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { LoadingSpinner } from "@/components/loading-spinner";
import { CategoryPills } from "@/components/category-pills";
import { CategoryMultiSelect } from "@/components/category-multiselect";
import * as api from "@/lib/api";
import type { ProviderResponse, ServiceResponse, Category } from "@/lib/types";

export default function DashboardMyProfilePage() {
  // Page state
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Loaded data
  const [provider, setProvider] = useState<ProviderResponse | null>(null);
  const [services, setServices] = useState<ServiceResponse[]>([]);

  // Edit state
  const [editName, setEditName] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editAvailableTime, setEditAvailableTime] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editCategories, setEditCategories] = useState<Category[]>([]);
  const [editMaxConcurrency, setEditMaxConcurrency] = useState(1);
  const [editExistingImages, setEditExistingImages] = useState<string[]>([]);
  const [newProfileImage, setNewProfileImage] = useState<File | null>(null);
  const [newProfileImagePreview, setNewProfileImagePreview] = useState<string | null>(null);
  const [newGalleryImages, setNewGalleryImages] = useState<File[]>([]);

  const profileImageInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function load() {
      try {
        const [profileData, servicesData] = await Promise.all([
          api.getMyProviderProfile(),
          api.getMyServices(),
        ]);
        setProvider(profileData);
        setServices(servicesData);
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : "Failed to load profile");
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  function enterEditMode() {
    if (!provider) return;
    setEditName(provider.providerName ?? "");
    setEditLocation(provider.location ?? "");
    setEditAvailableTime(provider.availableTime ?? "");
    setEditBio(provider.providerBio ?? "");
    setEditCategories((provider.categories ?? []) as Category[]);
    setEditMaxConcurrency(provider.maxConcurrency ?? 1);
    setEditExistingImages(provider.imagePath ?? []);
    setNewProfileImage(null);
    setNewProfileImagePreview(null);
    setNewGalleryImages([]);
    setSuccessMsg("");
    setErrorMsg("");
    setIsEditing(true);
  }

  function cancelEdit() {
    setIsEditing(false);
    setSuccessMsg("");
    setErrorMsg("");
  }

  async function handlePublish() {
    setIsSaving(true);
    setSuccessMsg("");
    setErrorMsg("");
    try {
      const payload = {
        providerName: editName,
        location: editLocation,
        maxConcurrency: editMaxConcurrency,
        providerBio: editBio || undefined,
        categories: editCategories,
        availableTime: editAvailableTime || undefined,
        existingImages: editExistingImages,
      };
      const updated = await api.updateProviderProfile(
        payload,
        newProfileImage ?? undefined,
        newGalleryImages.length > 0 ? newGalleryImages : undefined,
      );
      setProvider(updated);
      setNewProfileImage(null);
      setNewProfileImagePreview(null);
      setNewGalleryImages([]);
      if (profileImageInputRef.current) profileImageInputRef.current.value = "";
      if (galleryInputRef.current) galleryInputRef.current.value = "";
      setIsEditing(false);
      setSuccessMsg("Profile published successfully!");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setIsSaving(false);
    }
  }

  function handleProfileImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setNewProfileImage(file);
    setNewProfileImagePreview(URL.createObjectURL(file));
  }

  function handleGalleryImagesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    setNewGalleryImages((prev) => [...prev, ...files]);
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <LoadingSpinner />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex items-center gap-3 text-red-600 bg-red-50 border border-red-200 rounded-2xl px-5 py-4">
        <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-sm">{loadError}</p>
      </div>
    );
  }

  if (!provider) return null;

  // Hero image: in edit mode use preview if set, else first imagePath
  const heroImageSrc = isEditing
    ? (newProfileImagePreview ?? provider.imagePath?.[0] ?? null)
    : (provider.imagePath?.[0] ?? null);

  // Gallery strip images (exclude index 0 which is hero)
  const galleryImages = isEditing ? editExistingImages.slice(1) : (provider.imagePath?.slice(1) ?? []);

  return (
    <div className="-mx-4 md:-mx-0">
      {/* TODO: sticky bar, hero, gallery, about, advanced, services */}
      <p className="p-8 text-slate-400">Scaffold complete — sections coming in next tasks</p>
    </div>
  );
}
```

- [ ] **Step 2: Verify the frontend compiles without errors**

```bash
cd frontend && npm run build 2>&1 | tail -20
```

Expected: No TypeScript errors. The page renders a placeholder paragraph.

- [ ] **Step 3: Commit**

```bash
git add frontend/app/dashboard/profile/page.tsx
git commit -m "feat: scaffold storefront-style profile page with data fetching"
```

---

### Task 2: Add sticky edit bar and hero section

**Files:**
- Modify: `frontend/app/dashboard/profile/page.tsx`

Replace the `return` block's inner content (the placeholder `<p>` and its parent `<div>`) with the full layout below. Keep all code above the `return` statement unchanged.

- [ ] **Step 1: Replace the return block with hero + sticky bar**

Replace:
```tsx
  return (
    <div className="-mx-4 md:-mx-0">
      {/* TODO: sticky bar, hero, gallery, about, advanced, services */}
      <p className="p-8 text-slate-400">Scaffold complete — sections coming in next tasks</p>
    </div>
  );
```

With:
```tsx
  return (
    <div className="-mx-4 md:-mx-0">
      {/* ── Sticky edit bar (edit mode only) ─────────────────────────── */}
      {isEditing && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-b border-slate-100 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-slate-700">Editing profile</p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={cancelEdit}
                disabled={isSaving}
                className="px-4 py-2 text-sm font-semibold rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePublish}
                disabled={isSaving}
                className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-semibold rounded-xl px-5 py-2 text-sm transition-all disabled:opacity-60 shadow-md shadow-violet-200"
              >
                {isSaving && <LoadingSpinner className="h-4 w-4" />}
                {isSaving ? "Publishing..." : "Publish"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* top padding when sticky bar is shown */}
      {isEditing && <div className="h-14" />}

      {/* ── Banners ───────────────────────────────────────────────────── */}
      {successMsg && (
        <div className="mx-4 md:mx-0 mb-4 flex items-center gap-3 text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-4">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm font-medium">{successMsg}</p>
        </div>
      )}
      {errorMsg && (
        <div className="mx-4 md:mx-0 mb-4 flex items-center gap-3 text-red-600 bg-red-50 border border-red-200 rounded-2xl px-5 py-4">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm">{errorMsg}</p>
        </div>
      )}

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <div className="h-72 md:h-96 relative overflow-hidden rounded-b-3xl">
        {/* Hero background */}
        {heroImageSrc ? (
          <img src={heroImageSrc} alt={provider.providerName} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center">
            <span className="text-white font-bold select-none"
              style={{ fontSize: "clamp(6rem, 20vw, 12rem)", lineHeight: 1, opacity: 0.2 }}>
              {(isEditing ? editName : provider.providerName).charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Edit Profile button (view mode) */}
        {!isEditing && (
          <div className="absolute top-4 right-4">
            <button
              type="button"
              onClick={enterEditMode}
              className="inline-flex items-center gap-1.5 text-sm text-white bg-black/40 hover:bg-black/60 backdrop-blur-sm px-4 py-2 rounded-xl transition-all font-semibold"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Profile
            </button>
          </div>
        )}

        {/* Edit mode: click hero to change profile image */}
        {isEditing && (
          <div className="absolute top-4 right-4">
            <input
              ref={profileImageInputRef}
              type="file"
              accept="image/*"
              onChange={handleProfileImageChange}
              className="hidden"
              id="hero-image-input"
            />
            <label
              htmlFor="hero-image-input"
              className="inline-flex items-center gap-1.5 text-sm text-white bg-black/40 hover:bg-black/60 backdrop-blur-sm px-4 py-2 rounded-xl transition-all font-semibold cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Change photo
            </label>
          </div>
        )}

        {/* Hero bottom content */}
        <div className="absolute bottom-0 left-0 right-0 px-6 pb-6">
          {isEditing ? (
            <div className="flex flex-col gap-2">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Provider name"
                className="w-full max-w-xs border border-white/30 rounded-xl px-3 py-2 text-lg font-bold text-white bg-white/10 backdrop-blur-sm placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              <input
                type="text"
                value={editLocation}
                onChange={(e) => setEditLocation(e.target.value)}
                placeholder="Location"
                className="w-full max-w-xs border border-white/30 rounded-xl px-3 py-2 text-sm text-white bg-white/10 backdrop-blur-sm placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              <input
                type="text"
                value={editAvailableTime}
                onChange={(e) => setEditAvailableTime(e.target.value)}
                placeholder="Available hours (e.g. Mon–Fri 9am–5pm)"
                className="w-full max-w-xs border border-white/30 rounded-xl px-3 py-2 text-sm text-white bg-white/10 backdrop-blur-sm placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
            </div>
          ) : (
            <>
              <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-sm">{provider.providerName}</h1>
              {provider.categories && provider.categories.length > 0 && (
                <div className="mb-2">
                  <CategoryPills categories={provider.categories} />
                </div>
              )}
              <div className="flex flex-wrap items-center gap-4 text-white/80 text-sm">
                {provider.location && (
                  <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {provider.location}
                  </span>
                )}
                {provider.availableTime && (
                  <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {provider.availableTime}
                  </span>
                )}
              </div>
              {/* View Public Page link — below hero metadata */}
              <div className="mt-3">
                <Link
                  href={`/providers/${provider.providerId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-white/70 hover:text-white underline underline-offset-2 transition-colors"
                >
                  View Public Page
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Placeholder for remaining sections ────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <p className="text-slate-400">Gallery, About, Services coming in next tasks</p>
      </div>
    </div>
  );
```

- [ ] **Step 2: Verify no TypeScript errors**

```bash
cd frontend && npm run build 2>&1 | tail -20
```

Expected: Successful build.

- [ ] **Step 3: Commit**

```bash
git add frontend/app/dashboard/profile/page.tsx
git commit -m "feat: add sticky edit bar and hero section to profile page"
```

---

### Task 3: Add gallery strip, about section, categories edit, advanced section

**Files:**
- Modify: `frontend/app/dashboard/profile/page.tsx`

Replace the `{/* ── Placeholder for remaining sections ── */}` block with the full `<main>` block below.

- [ ] **Step 1: Replace the placeholder with the main content sections**

Replace:
```tsx
      {/* ── Placeholder for remaining sections ────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <p className="text-slate-400">Gallery, About, Services coming in next tasks</p>
      </div>
```

With:
```tsx
      {/* ── Gallery strip ─────────────────────────────────────────────── */}
      {isEditing ? (
        <div className="max-w-6xl mx-auto px-4 mt-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Gallery</p>
          <div className="flex flex-wrap gap-3 mb-3">
            {editExistingImages.slice(1).map((url) => (
              <div key={url} className="relative group w-32 h-24 rounded-2xl overflow-hidden flex-shrink-0 border border-slate-200">
                <img src={url} alt="Gallery" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setEditExistingImages((prev) => prev.filter((u) => u !== url))}
                  className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  aria-label="Remove image"
                >
                  ×
                </button>
              </div>
            ))}
            {newGalleryImages.map((file, idx) => (
              <div key={idx} className="relative group w-32 h-24 rounded-2xl overflow-hidden flex-shrink-0 border border-violet-200">
                <img src={URL.createObjectURL(file)} alt={file.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-violet-900/10" />
                <button
                  type="button"
                  onClick={() => setNewGalleryImages((prev) => prev.filter((_, i) => i !== idx))}
                  className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  aria-label="Remove new image"
                >
                  ×
                </button>
              </div>
            ))}
            <div>
              <input
                ref={galleryInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleGalleryImagesChange}
                className="hidden"
                id="gallery-images-input"
              />
              <label
                htmlFor="gallery-images-input"
                className="flex flex-col items-center justify-center w-32 h-24 rounded-2xl border-2 border-dashed border-slate-300 text-slate-500 hover:border-violet-400 hover:text-violet-600 cursor-pointer transition-all text-xs font-medium gap-1"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Add images
              </label>
            </div>
          </div>
        </div>
      ) : (
        provider.imagePath && provider.imagePath.length > 1 && (
          <div className="max-w-6xl mx-auto px-4 mt-4">
            <div className="overflow-x-auto">
              <div className="flex gap-3 snap-x snap-mandatory pb-2">
                {provider.imagePath.slice(1).map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt={`Gallery ${i + 2}`}
                    className="w-48 h-32 rounded-2xl object-cover flex-shrink-0 snap-start"
                  />
                ))}
              </div>
            </div>
          </div>
        )
      )}

      {/* ── Main content ──────────────────────────────────────────────── */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col gap-6">

          {/* Categories (edit mode only as a card; in view mode shown in hero) */}
          {isEditing && (
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
              <h2 className="text-lg font-bold text-slate-900 mb-3">Categories</h2>
              <CategoryMultiSelect value={editCategories} onChange={setEditCategories} />
            </div>
          )}

          {/* About */}
          {isEditing ? (
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
              <h2 className="text-lg font-bold text-slate-900 mb-3">About</h2>
              <textarea
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                rows={5}
                placeholder="Tell customers about yourself and what makes your services unique..."
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all resize-none"
              />
            </div>
          ) : (
            provider.providerBio && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-3">About</h2>
                <p className="text-slate-600 leading-relaxed">{provider.providerBio}</p>
              </div>
            )
          )}

          {/* Advanced (edit mode: max concurrency; view mode: hidden) */}
          {isEditing && (
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
              <h2 className="text-lg font-bold text-slate-900 mb-3">Advanced</h2>
              <div className="flex items-center gap-4">
                <label className="text-sm font-semibold text-slate-700 whitespace-nowrap">
                  Max concurrent bookings
                </label>
                <input
                  type="number"
                  value={editMaxConcurrency}
                  onChange={(e) => setEditMaxConcurrency(Number(e.target.value))}
                  min={1}
                  className="w-24 border border-slate-200 rounded-xl px-4 py-3 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
          )}

          {/* Services */}
          <div className={isEditing ? "relative" : ""}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">
                {isEditing ? "Services" : "Available Services"}
              </h2>
              {isEditing && (
                <Link
                  href="/dashboard/services"
                  className="text-sm font-semibold text-violet-600 hover:text-violet-800 transition-colors"
                >
                  Manage Services →
                </Link>
              )}
            </div>

            {services.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-slate-600 font-medium">No services yet</p>
                {isEditing && (
                  <Link href="/dashboard/services" className="text-sm text-violet-600 hover:underline mt-1 inline-block">
                    Add your first service →
                  </Link>
                )}
              </div>
            ) : (
              <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${isEditing ? "pointer-events-none opacity-70" : ""}`}>
                {services.map((service) => (
                  <div
                    key={service.serviceId}
                    className="block rounded-2xl overflow-hidden border-2 border-slate-100 bg-white shadow-sm relative"
                  >
                    {/* disabled badge — services from getMyServices() may be disabled */}
                    {"isDisabled" in service && (service as { isDisabled?: boolean }).isDisabled && (
                      <span className="absolute top-2 right-2 z-10 bg-slate-100 text-slate-400 text-xs rounded-full px-2 py-0.5">
                        Disabled
                      </span>
                    )}
                    {service.imagePath && service.imagePath.length > 0 ? (
                      <img
                        src={service.imagePath[0]}
                        alt={service.serviceName}
                        className="w-full h-40 object-cover"
                      />
                    ) : (
                      <div className="w-full h-40 bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center">
                        <span className="text-4xl font-bold text-violet-300">
                          {service.serviceName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="p-4">
                      <p className="font-semibold text-slate-900 truncate">{service.serviceName}</p>
                      {service.serviceBio && (
                        <p className="text-slate-500 text-xs mt-0.5 line-clamp-2">{service.serviceBio}</p>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {service.duration} min
                        </div>
                        <p className="font-bold text-slate-900">${Number(service.price).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
```

- [ ] **Step 2: Verify no TypeScript errors**

```bash
cd frontend && npm run build 2>&1 | tail -20
```

Expected: Successful build with no errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/app/dashboard/profile/page.tsx
git commit -m "feat: add gallery, about, categories, advanced, and services sections to profile page"
```

---

### Task 4: Verify end-to-end in browser

**Files:** None (read-only verification)

- [ ] **Step 1: Start the stack**

```bash
docker-compose up -d --build
docker-compose ps
```

Expected: All services `Up`.

- [ ] **Step 2: Log in as a PROVIDER account and navigate to `/dashboard/profile`**

Verify view mode:
- Hero image (or gradient fallback) fills `h-72 md:h-96`
- Provider name, location, availableTime shown in hero overlay
- Category pills visible in hero
- "Edit Profile" button overlaid top-right of hero
- "View Public Page →" link appears below hero metadata
- Gallery strip shows if provider has >1 image
- About card shows bio
- Services grid shows all provider services (including disabled if any)

- [ ] **Step 3: Click "Edit Profile" and verify edit mode**

Verify:
- Sticky bar appears at top with "Publish" and "Cancel" buttons
- Hero shows text inputs for name, location, available time
- "Change photo" button appears top-right of hero
- Categories card shows `CategoryMultiSelect`
- About section shows textarea
- Advanced card shows max concurrent bookings number input
- Services grid is greyed out / non-clickable with "Manage Services →" link

- [ ] **Step 4: Edit fields and click "Publish"**

Verify:
- Page exits edit mode
- Success banner "Profile published successfully!" appears
- Updated values are reflected in view mode
- Public storefront at `/providers/[providerId]` shows updated values (may need a refresh)

- [ ] **Step 5: Test cancel flow**

Enter edit mode → change some fields → click "Cancel"
Verify: Page returns to view mode with original values restored. No API call is made.

- [ ] **Step 6: Commit final state**

```bash
git add -p  # stage only if any fixes were needed
git commit -m "fix: profile page browser verification fixes"
```

(Skip commit if no changes were needed.)
