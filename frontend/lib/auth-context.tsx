"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { JwtResponse } from "./types";

type StoredUser = { id: string; username: string; role: string };

type AuthContextType = {
  token: string | null;
  user: StoredUser | null;
  isAuthenticated: boolean;
  login: (jwt: JwtResponse) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<StoredUser | null>(null);

  // Hydrate auth state from localStorage after mount (keeps SSR and first paint identical)
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (storedToken) setToken(storedToken);
    if (storedUser) {
      try { setUser(JSON.parse(storedUser) as StoredUser); } catch { /* ignore */ }
    }
  }, []);

  function login(jwt: JwtResponse) {
    const newUser: StoredUser = { id: jwt.id, username: jwt.username, role: jwt.role };
    setToken(jwt.token);
    setUser(newUser);
    localStorage.setItem("token", jwt.token);
    localStorage.setItem("user", JSON.stringify(newUser));
  }

  function logout() {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  }

  const isAuthenticated = token !== null && user !== null;

  return (
    <AuthContext.Provider value={{ token, user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
