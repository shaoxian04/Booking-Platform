"use client";

import type { Category } from "@/lib/types";
import { CATEGORIES, CATEGORY_COLORS, CATEGORY_LABELS } from "@/lib/categories";

interface CategoryFilterBarProps {
  selected: Category | null;
  onSelect: (cat: Category | null) => void;
}

export function CategoryFilterBar({ selected, onSelect }: CategoryFilterBarProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {/* "All" pill */}
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-all border ${
          selected === null
            ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-transparent shadow-sm"
            : "bg-white border-slate-200 text-gray-600 hover:border-violet-300 hover:text-violet-700"
        }`}
      >
        All
      </button>

      {CATEGORIES.map((cat) => {
        const isSelected = selected === cat;
        const colors = CATEGORY_COLORS[cat];
        return (
          <button
            key={cat}
            type="button"
            onClick={() => onSelect(cat)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-all border ${
              isSelected
                ? `${colors.bg} ${colors.text} border-transparent`
                : "bg-white border-slate-200 text-gray-600 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        );
      })}
    </div>
  );
}
