"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { AuthGuard } from "@/lib/auth-guard";

const SIDEBAR_LINKS = [
  {
    href: "/dashboard",
    label: "Appointments",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    href: "/dashboard/services",
    label: "Services",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    href: "/profile",
    label: "Profile",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
];

function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar on md+, top tab bar on mobile */}
          <aside className="md:w-52 flex-shrink-0">
            {/* Mobile tab bar */}
            <div className="md:hidden flex border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm mb-4">
              {SIDEBAR_LINKS.map((link) => {
                const active = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex-1 flex flex-col items-center gap-1 py-2.5 text-xs font-medium transition-all ${
                      active
                        ? "bg-violet-50 text-violet-700"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {link.icon}
                    {link.label}
                  </Link>
                );
              })}
            </div>

            {/* Desktop sidebar */}
            <nav className="hidden md:flex flex-col gap-1 bg-white rounded-2xl border border-slate-100 shadow-sm p-3">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 pt-1 pb-2">Provider Dashboard</p>
              {SIDEBAR_LINKS.map((link) => {
                const active = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      active
                        ? "bg-violet-50 text-violet-700"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    {link.icon}
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}

export default function ProtectedDashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard requiredRole="PROVIDER">
      <DashboardLayout>{children}</DashboardLayout>
    </AuthGuard>
  );
}
