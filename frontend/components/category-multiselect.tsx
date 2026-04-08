"use client";

import type { Category } from "@/lib/types";
import { CATEGORIES, CATEGORY_LABELS, CATEGORY_COLORS } from "@/lib/categories";

interface CategoryMultiSelectProps {
  value: Category[];
  onChange: (categories: Category[]) => void;
  max?: number;
}

export function CategoryMultiSelect({ value, onChange, max }: CategoryMultiSelectProps) {
  const atLimit = max !== undefined && value.length >= max;

  function toggle(cat: Category) {
    if (value.includes(cat)) {
      onChange(value.filter((c) => c !== cat));
    } else if (!atLimit) {
      onChange([...value, cat]);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => {
          const selected = value.includes(cat);
          const disabled = !selected && atLimit;
          const colors = CATEGORY_COLORS[cat];

          return (
            <button
              key={cat}
              type="button"
              onClick={() => toggle(cat)}
              disabled={disabled}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all select-none ${
                selected
                  ? `${colors.bg} ${colors.text} border-transparent ring-2 ring-offset-1 ring-current`
                  : disabled
                  ? "bg-white border-slate-200 text-slate-300 cursor-not-allowed"
                  : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50 cursor-pointer"
              }`}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-slate-400">
        {max !== undefined
          ? `${value.length} of ${max} selected`
          : `${value.length} selected`}
      </p>
    </div>
  );
}
