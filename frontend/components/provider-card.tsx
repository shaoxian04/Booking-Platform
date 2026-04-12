"use client";

import Link from "next/link";
import type { ProviderResponse } from "@/lib/types";
import { CategoryPills } from "@/components/category-pills";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-3.5 h-3.5 ${star <= Math.round(rating) ? "text-amber-400" : "text-slate-200"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export function ProviderCard({ provider }: { provider: ProviderResponse }) {
  const bio = (provider.providerBio ?? "").length > 90
    ? (provider.providerBio ?? "").slice(0, 90) + "…"
    : (provider.providerBio ?? "");

  return (
    <Link href={`/providers/${provider.providerId}`}>
      <div className="group bg-white rounded-2xl shadow-sm hover:shadow-lg border border-slate-100 hover:border-violet-200 transition-all duration-200 overflow-hidden flex flex-col h-full cursor-pointer">
        {/* Card header with avatar */}
        <div className="p-5 flex-1">
          <div className="flex items-start gap-4 mb-3">
            {provider.profileImageUrl ? (
              <img
                src={provider.profileImageUrl}
                alt={provider.providerName}
                className="w-14 h-14 rounded-xl object-cover flex-shrink-0 shadow-sm"
              />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                <span className="text-white text-xl font-bold">
                  {provider.providerName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-slate-900 truncate group-hover:text-violet-700 transition-colors">
                {provider.providerName}
              </h3>
              <div className="flex items-center gap-1 mt-0.5">
                <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p className="text-sm text-slate-400 truncate">{provider.location}</p>
              </div>
              {provider.categories && provider.categories.length > 0 && (
                <div className="mt-2">
                  <CategoryPills categories={provider.categories} />
                </div>
              )}
            </div>
          </div>
          <p className="text-slate-500 text-sm leading-relaxed">{bio}</p>
        </div>

        {/* Card footer */}
        <div className="px-5 py-3 border-t border-slate-50 bg-slate-50/50 flex items-center justify-between">
          {provider.averageRating !== null ? (
            <div className="flex items-center gap-2">
              <StarRating rating={provider.averageRating} />
              <span className="text-sm font-semibold text-slate-700">{provider.averageRating.toFixed(1)}</span>
              {provider.totalReviews !== null && (
                <span className="text-xs text-slate-400">({provider.totalReviews})</span>
              )}
            </div>
          ) : (
            <span className="text-xs text-slate-400">No reviews yet</span>
          )}
          <span className="text-xs font-medium text-violet-600 group-hover:text-violet-700">
            View profile →
          </span>
        </div>
      </div>
    </Link>
  );
}
