"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

const VIEWER_LINKS = [
  { href: "/", label: "Browse" },
  { href: "/appointments", label: "My Appointments" },
  { href: "/profile", label: "Profile" },
];

const PROVIDER_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/services", label: "Services" },
  { href: "/profile", label: "Profile" },
];

function HamburgerButton({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  return (
    <button
      className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
      onClick={onToggle}
      aria-label="Toggle menu"
    >
      {open ? (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      )}
    </button>
  );
}

const BookifyLogo = () => (
  <Link href="/" className="flex items-center gap-2 flex-shrink-0">
    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    </div>
    <span className="font-bold text-lg bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
      Bookify
    </span>
  </Link>
);

export function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = user?.role === "PROVIDER" ? PROVIDER_LINKS : VIEWER_LINKS;

  if (!user) {
    return (
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/60 shadow-sm">
        <div className="max-w-6xl mx-auto px-4">
          <div className="h-16 flex items-center justify-between">
            <BookifyLogo />
            <div className="hidden md:flex items-center gap-2">
              <Link
                href="/login"
                className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 border border-slate-200 hover:border-violet-300 hover:text-violet-700 transition-all"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white transition-all"
              >
                Sign up
              </Link>
            </div>
            <HamburgerButton open={menuOpen} onToggle={() => setMenuOpen((o) => !o)} />
          </div>
          {menuOpen && (
            <div className="md:hidden pb-4 flex flex-col gap-2">
              <Link href="/login" onClick={() => setMenuOpen(false)} className="px-4 py-2.5 rounded-lg text-sm font-medium text-slate-700 border border-slate-200 text-center">
                Log in
              </Link>
              <Link href="/register" onClick={() => setMenuOpen(false)} className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-center">
                Sign up
              </Link>
            </div>
          )}
        </div>
      </nav>
    );
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/60 shadow-sm">
      <div className="max-w-6xl mx-auto px-4">
        <div className="h-16 flex items-center justify-between">
          <BookifyLogo />

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  pathname === link.href
                    ? "bg-violet-50 text-violet-700"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                {link.label}
              </Link>
            ))}
            {user?.role === "VIEWER" && (
              <Link
                href="/become-provider"
                className="ml-1 px-4 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white transition-all shadow-sm shadow-violet-200"
              >
                Become a Provider
              </Link>
            )}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white text-sm font-bold">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium text-slate-700">{user.username}</span>
            </div>
            <button
              onClick={logout}
              className="text-sm px-3 py-1.5 rounded-lg border border-slate-200 text-slate-500 hover:border-red-300 hover:text-red-600 hover:bg-red-50 transition-all"
            >
              Sign out
            </button>
          </div>

          <HamburgerButton open={menuOpen} onToggle={() => setMenuOpen((o) => !o)} />
        </div>

        {menuOpen && (
          <div className="md:hidden pb-4 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium ${
                  pathname === link.href
                    ? "bg-violet-50 text-violet-700"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {link.label}
              </Link>
            ))}
            {user?.role === "VIEWER" && (
              <Link
                href="/become-provider"
                onClick={() => setMenuOpen(false)}
                className="px-4 py-2.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-center mt-1"
              >
                Become a Provider
              </Link>
            )}
            <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between px-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-slate-700">{user.username}</span>
              </div>
              <button onClick={logout} className="text-sm text-red-500 hover:text-red-700 font-medium">
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
