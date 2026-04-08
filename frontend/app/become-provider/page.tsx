"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import * as api from "@/lib/api";
import type { Category } from "@/lib/types";
import { CategoryMultiSelect } from "@/components/category-multiselect";
import { LoadingSpinner } from "@/components/loading-spinner";

interface FormData {
  providerName: string;
  location: string;
  availableTime: string;
  maxConcurrency: number;
  providerBio: string;
  categories: Category[];
}

const INITIAL_FORM: FormData = {
  providerName: "",
  location: "",
  availableTime: "",
  maxConcurrency: 1,
  providerBio: "",
  categories: [],
};

const BENEFITS = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Earn on your schedule",
    desc: "Set your own hours and serve clients when it works for you.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: "Reach more clients",
    desc: "Thousands of customers actively searching for services like yours.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
    title: "Build your reputation",
    desc: "Collect reviews and grow a trusted brand on the Bookify platform.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    title: "Manage bookings easily",
    desc: "Accept, track, and complete appointments all from your dashboard.",
  },
];

export default function BecomeProviderPage() {
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [shopImages, setShopImages] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    } else if (user?.role === "PROVIDER") {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || user?.role === "PROVIDER") {
    return null;
  }

  function setField<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!form.providerName.trim()) { setError("Business name is required."); return; }
    if (!form.location.trim()) { setError("Location is required."); return; }
    if (form.maxConcurrency < 1) { setError("Max concurrent appointments must be at least 1."); return; }

    setIsLoading(true);
    try {
      await api.becomeProvider(
        {
          providerName: form.providerName.trim(),
          location: form.location.trim(),
          availableTime: form.availableTime.trim() || undefined,
          maxConcurrency: form.maxConcurrency,
          providerBio: form.providerBio.trim() || undefined,
          categories: form.categories.length > 0 ? form.categories : undefined,
        },
        profileImage ?? undefined,
        shopImages.length > 0 ? shopImages : undefined,
      );
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-10 text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center mx-auto mb-5">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">You&apos;re all set!</h1>
          <p className="text-slate-500 text-sm leading-relaxed mb-2">
            Your provider profile is live.
          </p>
          <p className="text-slate-500 text-sm leading-relaxed mb-8">
            Please <span className="font-semibold text-slate-700">log out and log back in</span> to access your provider dashboard. Your current session still identifies you as a customer.
          </p>
          <button
            onClick={() => { logout(); }}
            className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-semibold rounded-xl py-3 transition-all shadow-md shadow-violet-200"
          >
            Log out now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left marketing panel */}
      <div className="hidden lg:flex lg:w-5/12 bg-gradient-to-br from-violet-600 via-indigo-600 to-indigo-800 p-12 flex-col justify-between relative overflow-hidden">
        {/* Decorative orb */}
        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />

        <div className="relative flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <span className="text-white font-bold text-xl">Bookify</span>
        </div>

        <div className="relative">
          <div className="inline-block bg-white/15 text-white text-xs font-semibold px-3 py-1 rounded-full mb-5 tracking-wide uppercase">
            For Professionals
          </div>
          <h2 className="text-white text-4xl font-bold leading-tight mb-4">
            Grow your business<br />with Bookify.
          </h2>
          <p className="text-violet-200 text-base leading-relaxed mb-10">
            Join hundreds of service providers who use Bookify to manage bookings, attract clients, and build their reputation.
          </p>

          <div className="space-y-4">
            {BENEFITS.map((b) => (
              <div key={b.title} className="flex items-start gap-3">
                <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center text-white mt-0.5">
                  {b.icon}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{b.title}</p>
                  <p className="text-violet-300 text-xs leading-relaxed">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-violet-400 text-sm">© 2026 Bookify. All rights reserved.</p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-start justify-center p-8 bg-slate-50 overflow-y-auto">
        <div className="w-full max-w-xl py-4">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="font-bold text-lg bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">Bookify</span>
          </div>

          <h1 className="text-3xl font-bold text-slate-900 mb-1">Become a provider</h1>
          <p className="text-slate-500 mb-8">Fill in your details to set up your provider profile.</p>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Step 1 — Identity */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">1</span>
                <h2 className="text-base font-bold text-slate-800">Identity</h2>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Business / Provider Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.providerName}
                    onChange={(e) => setField("providerName", e.target.value)}
                    required
                    placeholder="e.g. Jane&apos;s Wellness Studio"
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Location <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) => setField("location", e.target.value)}
                    required
                    placeholder="e.g. New York, NY"
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent shadow-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Max Concurrent Appointments <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={form.maxConcurrency}
                      onChange={(e) => setField("maxConcurrency", Math.max(1, parseInt(e.target.value, 10) || 1))}
                      required
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent shadow-sm"
                    />
                    <p className="text-xs text-slate-400 mt-1">How many clients you can serve at the same time.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Available Hours <span className="text-slate-400 font-normal">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={form.availableTime}
                      onChange={(e) => setField("availableTime", e.target.value)}
                      placeholder="e.g. Mon–Fri 9am–5pm"
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent shadow-sm"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Step 2 — About */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">2</span>
                <h2 className="text-base font-bold text-slate-800">About</h2>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Bio <span className="text-slate-400 font-normal">(optional)</span>
                  </label>
                  <textarea
                    value={form.providerBio}
                    onChange={(e) => setField("providerBio", e.target.value)}
                    rows={4}
                    placeholder="Tell potential clients about your experience and what makes you unique..."
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent shadow-sm resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Categories <span className="text-slate-400 font-normal">(optional, up to 3)</span>
                  </label>
                  <CategoryMultiSelect
                    value={form.categories}
                    onChange={(cats) => setField("categories", cats)}
                    max={3}
                  />
                </div>
              </div>
            </section>

            {/* Step 3 — Images */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">3</span>
                <h2 className="text-base font-bold text-slate-800">Images</h2>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Profile Photo <span className="text-slate-400 font-normal">(optional)</span>
                  </label>
                  <label className="flex items-center gap-3 w-full border border-dashed border-slate-300 rounded-xl px-4 py-3 cursor-pointer hover:border-violet-400 hover:bg-violet-50 transition-all">
                    <svg className="w-5 h-5 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                    <span className="text-sm text-slate-500 truncate">
                      {profileImage ? profileImage.name : "Click to upload profile photo"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => setProfileImage(e.target.files?.[0] ?? null)}
                    />
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Shop / Portfolio Images <span className="text-slate-400 font-normal">(optional, multiple)</span>
                  </label>
                  <label className="flex items-center gap-3 w-full border border-dashed border-slate-300 rounded-xl px-4 py-3 cursor-pointer hover:border-violet-400 hover:bg-violet-50 transition-all">
                    <svg className="w-5 h-5 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                    </svg>
                    <span className="text-sm text-slate-500 truncate">
                      {shopImages.length > 0
                        ? `${shopImages.length} file${shopImages.length > 1 ? "s" : ""} selected`
                        : "Click to upload shop images"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => setShopImages(Array.from(e.target.files ?? []))}
                    />
                  </label>
                </div>
              </div>
            </section>

            {error && (
              <div className="flex items-start gap-2 text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-semibold rounded-xl py-3.5 shadow-md shadow-violet-200 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading && <LoadingSpinner className="h-4 w-4" />}
              {isLoading ? "Creating your profile…" : "Create Provider Profile"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
