"use client";

import { useState, useEffect, useRef } from "react";
import { LoadingSpinner } from "@/components/loading-spinner";
import { CategoryMultiSelect } from "@/components/category-multiselect";
import * as api from "@/lib/api";
import type { Category } from "@/lib/types";

export default function DashboardProfilePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Identity fields
  const [providerName, setProviderName] = useState("");
  const [location, setLocation] = useState("");
  const [maxConcurrency, setMaxConcurrency] = useState(1);
  const [availableTime, setAvailableTime] = useState("");

  // About
  const [providerBio, setProviderBio] = useState("");

  // Categories
  const [categories, setCategories] = useState<Category[]>([]);

  // Images
  const [currentProfileImageUrl, setCurrentProfileImageUrl] = useState<string | null>(null);
  const [newProfileImage, setNewProfileImage] = useState<File | null>(null);
  const [newProfileImagePreview, setNewProfileImagePreview] = useState<string | null>(null);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newGalleryImages, setNewGalleryImages] = useState<File[]>([]);

  const profileImageRef = useRef<HTMLInputElement>(null);
  const galleryImagesRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function load() {
      try {
        const profile = await api.getMyProviderProfile();
        setProviderName(profile.providerName ?? "");
        setLocation(profile.location ?? "");
        setMaxConcurrency(profile.maxConcurrency ?? 1);
        setAvailableTime(profile.availableTime ?? "");
        setProviderBio(profile.providerBio ?? "");
        setCategories((profile.categories ?? []) as Category[]);
        setCurrentProfileImageUrl(profile.profileImageUrl ?? null);
        setExistingImages(profile.imagePath ?? []);
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : "Failed to load profile");
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  function handleProfileImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setNewProfileImage(file);
    const url = URL.createObjectURL(file);
    setNewProfileImagePreview(url);
  }

  function handleGalleryImagesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    setNewGalleryImages((prev) => [...prev, ...files]);
  }

  function removeExistingImage(url: string) {
    setExistingImages((prev) => prev.filter((u) => u !== url));
  }

  function removeNewGalleryImage(index: number) {
    setNewGalleryImages((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");
    setIsSaving(true);

    try {
      const payload = {
        providerName,
        location,
        maxConcurrency,
        providerBio: providerBio || undefined,
        categories,
        availableTime: availableTime || undefined,
        existingImages,
      };

      const updated = await api.updateProviderProfile(
        payload,
        newProfileImage ?? undefined,
        newGalleryImages.length > 0 ? newGalleryImages : undefined,
      );

      // Refresh state from response
      setCurrentProfileImageUrl(updated.profileImageUrl ?? null);
      setExistingImages(updated.imagePath ?? []);
      setNewProfileImage(null);
      setNewProfileImagePreview(null);
      setNewGalleryImages([]);
      if (profileImageRef.current) profileImageRef.current.value = "";
      if (galleryImagesRef.current) galleryImagesRef.current.value = "";

      setSuccessMsg("Profile updated successfully");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
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

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
        <p className="text-slate-500 text-sm mt-1">Update your provider profile visible to customers</p>
      </div>

      {successMsg && (
        <div className="flex items-center gap-3 text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-4 mb-6">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm font-medium">{successMsg}</p>
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center gap-3 text-red-600 bg-red-50 border border-red-200 rounded-2xl px-5 py-4 mb-6">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm">{errorMsg}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto flex flex-col gap-5">
        {/* Identity */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col gap-4">
          <h2 className="text-base font-bold text-slate-800 pb-1 border-b border-slate-100">Identity</h2>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Provider Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={providerName}
              onChange={(e) => setProviderName(e.target.value)}
              required
              placeholder="Your business or display name"
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Location <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
              placeholder="City, neighborhood, or address"
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Max Concurrent Bookings <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={maxConcurrency}
                onChange={(e) => setMaxConcurrency(Number(e.target.value))}
                required
                min={1}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Available Time <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={availableTime}
                onChange={(e) => setAvailableTime(e.target.value)}
                placeholder="e.g. Mon–Fri 9am–5pm"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
              />
            </div>
          </div>
        </div>

        {/* About */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col gap-4">
          <h2 className="text-base font-bold text-slate-800 pb-1 border-b border-slate-100">About</h2>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Bio <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={providerBio}
              onChange={(e) => setProviderBio(e.target.value)}
              rows={4}
              placeholder="Tell customers about yourself and what makes your services unique..."
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all resize-none"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col gap-4">
          <h2 className="text-base font-bold text-slate-800 pb-1 border-b border-slate-100">Categories</h2>
          <p className="text-xs text-slate-500 -mt-1">Select all categories that describe your services</p>
          <CategoryMultiSelect value={categories} onChange={setCategories} />
        </div>

        {/* Images */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col gap-6">
          <h2 className="text-base font-bold text-slate-800 pb-1 border-b border-slate-100">Images</h2>

          {/* Profile image */}
          <div>
            <p className="text-sm font-semibold text-slate-700 mb-3">Profile Image</p>
            <div className="flex items-center gap-4">
              {(newProfileImagePreview ?? currentProfileImageUrl) ? (
                <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 border border-slate-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={newProfileImagePreview ?? currentProfileImageUrl!}
                    alt="Profile preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center flex-shrink-0 border border-slate-200">
                  <svg className="w-8 h-8 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
              <div className="flex-1">
                <input
                  ref={profileImageRef}
                  type="file"
                  accept="image/*"
                  onChange={handleProfileImageChange}
                  className="hidden"
                  id="profile-image-input"
                />
                <label
                  htmlFor="profile-image-input"
                  className="inline-flex items-center gap-2 cursor-pointer px-4 py-2 text-sm font-semibold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {currentProfileImageUrl ? "Replace image" : "Upload image"}
                </label>
                {newProfileImage && (
                  <p className="text-xs text-slate-500 mt-1.5">{newProfileImage.name}</p>
                )}
              </div>
            </div>
          </div>

          {/* Gallery images */}
          <div>
            <p className="text-sm font-semibold text-slate-700 mb-3">Gallery Images</p>
            {existingImages.length > 0 && (
              <div className="flex flex-wrap gap-3 mb-4">
                {existingImages.map((url) => (
                  <div key={url} className="relative group w-24 h-20 rounded-xl overflow-hidden border border-slate-200 flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="Gallery" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(url)}
                      className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      aria-label="Remove image"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {newGalleryImages.length > 0 && (
              <div className="flex flex-wrap gap-3 mb-4">
                {newGalleryImages.map((file, idx) => (
                  <div key={idx} className="relative group w-24 h-20 rounded-xl overflow-hidden border border-violet-200 flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-violet-900/10" />
                    <button
                      type="button"
                      onClick={() => removeNewGalleryImage(idx)}
                      className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      aria-label="Remove new image"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <input
              ref={galleryImagesRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleGalleryImagesChange}
              className="hidden"
              id="gallery-images-input"
            />
            <label
              htmlFor="gallery-images-input"
              className="inline-flex items-center gap-2 cursor-pointer px-4 py-2 text-sm font-semibold rounded-xl border border-dashed border-slate-300 text-slate-600 hover:bg-slate-50 hover:border-violet-400 hover:text-violet-700 transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add gallery images
            </label>
            <p className="text-xs text-slate-400 mt-1.5">Hover an image to reveal the remove button</p>
          </div>
        </div>

        <div className="flex justify-end pb-4">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-semibold rounded-xl px-6 py-2.5 transition-all disabled:opacity-60 shadow-md shadow-violet-200"
          >
            {isSaving && <LoadingSpinner className="h-4 w-4" />}
            {isSaving ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </form>
    </div>
  );
}
