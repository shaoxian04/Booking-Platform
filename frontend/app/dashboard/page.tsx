"use client";

import { useState, useEffect, useCallback } from "react";
import { LoadingSpinner } from "@/components/loading-spinner";
import * as api from "@/lib/api";
import type { AppointmentResponse, AppointmentStatus } from "@/lib/types";

const TABS: { key: AppointmentStatus; label: string; color: string; dot: string }[] = [
  { key: "unaccepted", label: "Pending", color: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-400" },
  { key: "accepted", label: "Accepted", color: "bg-blue-50 text-blue-700 border-blue-200", dot: "bg-blue-400" },
  { key: "not-completed", label: "In Progress", color: "bg-violet-50 text-violet-700 border-violet-200", dot: "bg-violet-400" },
  { key: "completed", label: "Completed", color: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-400" },
];

function formatAppointmentTime(startIso: string, endIso: string): string {
  const start = new Date(startIso);
  const end = new Date(endIso);
  const dateStr = start.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  const startTime = start.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  const endTime = end.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  return `${dateStr} • ${startTime} – ${endTime}`;
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<AppointmentStatus>("unaccepted");
  const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const activeTabConfig = TABS.find((t) => t.key === activeTab)!;

  const fetchAppointments = useCallback(async () => {
    setError("");
    setIsLoading(true);
    try {
      const data = await api.getProviderAppointments(activeTab);
      setAppointments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load appointments");
    } finally {
      setIsLoading(false);
    }
  }, [activeTab]);

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

  async function handleAccept(appointmentId: string) {
    setActionLoading(appointmentId);
    try {
      await api.acceptAppointment(appointmentId);
      setAppointments((prev) => prev.filter((a) => a.appointmentId !== appointmentId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to accept appointment");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleComplete(appointmentId: string) {
    setActionLoading(appointmentId);
    try {
      await api.completeAppointment(appointmentId);
      setAppointments((prev) => prev.filter((a) => a.appointmentId !== appointmentId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to complete appointment");
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Appointments</h1>
        <p className="text-slate-500 text-sm mt-1">Manage incoming and active appointments</p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm border transition-all ${
              activeTab === tab.key
                ? tab.color
                : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${activeTab === tab.key ? tab.dot : "bg-slate-300"}`} />
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="flex justify-center py-16">
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

      {!isLoading && appointments.length === 0 && !error && (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-slate-700 font-semibold">No {activeTabConfig.label.toLowerCase()} appointments</p>
          <p className="text-slate-400 text-sm mt-1">
            {activeTab === "unaccepted" ? "New bookings will appear here" : "Nothing to show here yet"}
          </p>
        </div>
      )}

      {!isLoading && appointments.length > 0 && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {appointments.map((appt) => (
            <div key={appt.appointmentId} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className={`px-5 py-2 border-b flex items-center gap-2 ${activeTabConfig.color}`}>
                <span className={`w-2 h-2 rounded-full ${activeTabConfig.dot}`} />
                <span className="text-xs font-semibold">{activeTabConfig.label}</span>
              </div>

              <div className="p-5 flex flex-col gap-3">
                {/* Customer */}
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">Customer</p>
                    <p className="text-slate-400 text-xs">Customer</p>
                  </div>
                </div>

                {/* Time */}
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <svg className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {formatAppointmentTime(appt.startTime, appt.endTime)}
                </div>

                {appt.remarks && (
                  <p className="text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
                    <span className="font-semibold text-slate-600">Note:</span> {appt.remarks}
                  </p>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-1">
                  {activeTab === "unaccepted" && (
                    <button
                      onClick={() => handleAccept(appt.appointmentId)}
                      disabled={actionLoading === appt.appointmentId}
                      className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-sm font-semibold rounded-xl py-2 transition-all disabled:opacity-60"
                    >
                      {actionLoading === appt.appointmentId && <LoadingSpinner className="h-3.5 w-3.5" />}
                      Accept
                    </button>
                  )}
                  {activeTab === "accepted" && (
                    <button
                      onClick={() => handleComplete(appt.appointmentId)}
                      disabled={actionLoading === appt.appointmentId}
                      className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-sm font-semibold rounded-xl py-2 transition-all disabled:opacity-60"
                    >
                      {actionLoading === appt.appointmentId && <LoadingSpinner className="h-3.5 w-3.5" />}
                      Mark Complete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
