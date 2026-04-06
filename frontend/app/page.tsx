"use client";

import { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { ProviderCard } from "@/components/provider-card";
import { LoadingSpinner } from "@/components/loading-spinner";
import { useAuth } from "@/lib/auth-context";
import * as api from "@/lib/api";
import type { ProviderResponse } from "@/lib/types";

const CATEGORIES = [
  { icon: "🧖", label: "Beauty & Wellness" },
  { icon: "🏋️", label: "Fitness" },
  { icon: "🩺", label: "Health" },
  { icon: "🐾", label: "Pet Care" },
  { icon: "🏠", label: "Home Services" },
];

const HOW_IT_WORKS = [
  {
    step: "1",
    title: "Search Providers",
    desc: "Browse hundreds of verified service providers by name or category.",
    icon: (
      <svg className="w-6 h-6 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
  },
  {
    step: "2",
    title: "Pick a Time",
    desc: "Choose a convenient date and time that works for your schedule.",
    icon: (
      <svg className="w-6 h-6 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    step: "3",
    title: "Enjoy Your Service",
    desc: "Show up and enjoy. Track your appointment status in real time.",
    icon: (
      <svg className="w-6 h-6 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

export default function HomePage() {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [providers, setProviders] = useState<ProviderResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  async function handleSearch(searchQuery?: string) {
    const q = searchQuery ?? query;
    setError("");
    setIsLoading(true);
    try {
      const results = user
        ? await api.searchProviders(q)
        : await api.searchProvidersPublic(q);
      setProviders(results);
      setHasSearched(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") handleSearch();
  }

  function handleCategory(label: string) {
    setQuery(label);
    handleSearch(label);
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      {/* Hero */}
      <div className="bg-gradient-to-br from-violet-600 via-indigo-600 to-indigo-700 pt-14 pb-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center gap-1.5 bg-white/15 text-violet-100 text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 3l14 9-14 9V3z" />
            </svg>
            Discover top-rated providers
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
            Find & Book the Best<br />Services Near You
          </h1>
          <p className="text-violet-200 text-lg mb-8">
            Search from hundreds of verified service providers and book your next appointment instantly.
          </p>

          {/* Search bar */}
          <div className="flex gap-2 bg-white rounded-2xl p-2 shadow-xl shadow-indigo-900/20 max-w-xl mx-auto mb-6">
            <div className="flex items-center gap-2 flex-1 px-3">
              <svg className="w-5 h-5 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search providers by name..."
                className="flex-1 text-sm text-slate-800 placeholder-slate-400 focus:outline-none bg-transparent py-1"
              />
            </div>
            <button
              onClick={() => handleSearch()}
              disabled={isLoading}
              className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-semibold px-6 py-2.5 rounded-xl transition-all disabled:opacity-60 flex-shrink-0 text-sm"
            >
              Search
            </button>
          </div>

          {/* Category chips */}
          <div className="flex flex-wrap gap-2 justify-center">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.label}
                onClick={() => handleCategory(cat.label)}
                className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white text-sm font-medium px-4 py-2 rounded-full transition-all border border-white/20"
              >
                <span>{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Guest CTA row */}
      {!user && (
        <div className="bg-white border-b border-slate-100">
          <div className="max-w-4xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-slate-900">Ready to get started?</p>
              <p className="text-slate-500 text-sm">Join thousands of users already on Bookify.</p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/register"
                className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white transition-all shadow-md shadow-violet-200"
              >
                Sign up free
              </Link>
              <Link
                href="/register?role=PROVIDER"
                className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 text-slate-700 hover:border-violet-300 hover:text-violet-700 transition-all"
              >
                I&apos;m a provider
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Results / Landing content */}
      <main className="max-w-6xl mx-auto w-full px-4 py-10 flex-1">
        {isLoading && (
          <div className="flex justify-center py-20">
            <LoadingSpinner />
          </div>
        )}

        {error && (
          <div className="flex items-center gap-3 text-red-600 bg-red-50 border border-red-200 rounded-2xl px-5 py-4 mb-6">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {!isLoading && hasSearched && providers.length === 0 && (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-slate-700 font-semibold text-lg">No providers found</p>
            <p className="text-slate-400 text-sm mt-1">Try a different search term or category</p>
          </div>
        )}

        {!isLoading && providers.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-slate-600 text-sm">
                <span className="font-semibold text-slate-900">{providers.length}</span> provider{providers.length !== 1 ? "s" : ""} found
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {providers.map((provider) => (
                <ProviderCard key={provider.providerId} provider={provider} />
              ))}
            </div>
          </>
        )}

        {/* How it works — shown only before any search */}
        {!hasSearched && !isLoading && (
          <div className="mt-4">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-slate-900">How Bookify Works</h2>
              <p className="text-slate-500 mt-1">Get started in three simple steps</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {HOW_IT_WORKS.map((item) => (
                <div key={item.step} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center">
                    {item.icon}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-violet-500 uppercase tracking-wider">Step {item.step}</span>
                    <h3 className="text-slate-900 font-bold mt-0.5">{item.title}</h3>
                    <p className="text-slate-500 text-sm mt-1 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="font-bold text-sm bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">Bookify</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-slate-500">
            <Link href="/login" className="hover:text-violet-600 transition-colors">Log in</Link>
            <Link href="/register" className="hover:text-violet-600 transition-colors">Register</Link>
            <span>© 2026 Bookify</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
