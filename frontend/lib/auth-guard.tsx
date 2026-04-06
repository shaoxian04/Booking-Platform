"use client";

import { useEffect, ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "./auth-context";

const PUBLIC_PATHS = ["/login", "/register"];
const SEMI_PUBLIC_PATH_PREFIXES = ["/providers/"];

interface AuthGuardProps {
  children: ReactNode;
  requiredRole?: string;
}

export function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const { isAuthenticated, user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isPublic = PUBLIC_PATHS.includes(pathname);
  const isSemiPublic = pathname === "/" || SEMI_PUBLIC_PATH_PREFIXES.some((p) => pathname.startsWith(p));

  useEffect(() => {
    if (!isAuthenticated && !isPublic && !isSemiPublic) {
      router.replace("/login");
    } else if (isAuthenticated && isPublic) {
      const role = user?.role;
      router.replace(role === "PROVIDER" ? "/dashboard" : "/");
    } else if (isAuthenticated && requiredRole && user?.role !== requiredRole) {
      router.replace("/");
    }
  }, [isAuthenticated, isPublic, isSemiPublic, router, requiredRole, user]);

  if (!isAuthenticated && !isPublic && !isSemiPublic) return null;
  if (isAuthenticated && isPublic) return null;
  if (isAuthenticated && requiredRole && user?.role !== requiredRole) return null;

  return <>{children}</>;
}
