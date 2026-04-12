"use client";

import { useState, useEffect, useCallback } from "react";
import { Navbar } from "@/components/navbar";
import { LoadingSpinner } from "@/components/loading-spinner";
import * as api from "@/lib/api";
import { resolveAppointmentNames } from "@/lib/resolve-names";
import { formatAppointmentTime, formatDate } from "@/lib/date-utils";
import type { AppointmentResponse } from "@/lib/types";

type TabKey = "unaccepted" | "accepted" | "completed" | "not-completed";

const TABS: { key: TabKey; label: string; color: string; dot: string }[] = [
  { key: "unaccepted", label: "Pending", color: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-400" },
  { key: "accepted", label: "Accepted", color: "bg-blue-50 text-blue-700 border-blue-200", dot: "bg-blue-400" },
  { key: "not-completed", label: "In Progress", color: "bg-violet-50 text-violet-700 border-violet-200", dot: "bg-violet-400" },
  { key: "completed", label: "Completed", color: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-400" },
];

export default function AppointmentsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("unaccepted");
  const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [providerNames, setProviderNames] = useState<Map<string, string>>(new Map());
  const [serviceNames, setServiceNames] = useState<Map<string, string>>(new Map());
  const [namesLoading, setNamesLoading] = useState(false);

  const activeTabConfig = TABS.find((t) => t.key === activeTab)!;

  const fetchAppointments = useCallback(async () => {
    setError("");
    setIsLoading(true);
    try {
      const data = await api.getUserAppointments(activeTab);
      setAppointments(data);

      if (data.length > 0) {
        setNamesLoading(true);
        try {
          const { providerNames: pn, serviceNames: sn } = await resolveAppointmentNames(data);
          setProviderNames(pn);
          setServiceNames(sn);
        } catch {
          // silently continue with empty maps — names will show fallbacks
        } finally {
          setNamesLoading(false);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load appointments");
    } finally {
      setIsLoading(false);
    }
  }, [activeTab]);

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

  async function handleCancel(appointmentId: string) {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
    try {
      await api.deleteAppointment(appointmentId);
      fetchAppointments();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cancel appointment");
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">My Appointments</h1>
          <p className="text-slate-500 mt-1">Track and manage all your bookings</p>
        </div>

        {/* Tab bar */}
        <div className="flex gap-2 mb-8 flex-wrap">
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

        {!isLoading && appointments.length === 0 && !error && (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-slate-700 font-semibold">No {activeTabConfig.label.toLowerCase()} appointments</p>
            <p className="text-slate-400 text-sm mt-1">
              {activeTab === "unaccepted"
                ? "Book a service to get started"
                : "Nothing to show here yet"}
            </p>
          </div>
        )}

        {!isLoading && appointments.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {appointments.map((appt) => {
              const serviceName = serviceNames.get(`${appt.serviceId}::${appt.providerId}`);
              const providerName = providerNames.get(appt.providerId);

              return (
                <div key={appt.appointmentId} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
                  {/* Status bar */}
                  <div className={`px-5 py-2 border-b flex items-center gap-2 ${activeTabConfig.color}`}>
                    <span className={`w-2 h-2 rounded-full ${activeTabConfig.dot}`} />
                    <span className="text-xs font-semibold">{activeTabConfig.label}</span>
                  </div>

                  <div className="p-5 flex flex-col gap-3 flex-1">
                    {/* Service & provider names */}
                    <div>
                      {namesLoading && !serviceName ? (
                        <div className="h-4 bg-slate-100 rounded animate-pulse w-3/4 mb-1" />
                      ) : (
                        <p className="font-bold text-slate-900 text-sm">
                          {serviceName ?? "Unknown service"}
                        </p>
                      )}
                      {namesLoading && !providerName ? (
                        <div className="h-3 bg-slate-100 rounded animate-pulse w-1/2 mt-1" />
                      ) : (
                        <p className="text-slate-500 text-xs mt-0.5">
                          by {providerName ?? "Unknown provider"}
                        </p>
                      )}
                    </div>

                    {/* Date & time */}
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <svg className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{formatAppointmentTime(appt.startTime, appt.endTime)}</span>
                    </div>

                    {/* Booked date */}
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>Booked {formatDate(appt.gmtCreate)}</span>
                    </div>

                    {appt.remarks && (
                      <p className="text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
                        <span className="font-semibold text-slate-600">Note:</span> {appt.remarks}
                      </p>
                    )}

                    {activeTab === "unaccepted" && (
                      <div className="mt-auto pt-2">
                        <button
                          onClick={() => handleCancel(appt.appointmentId)}
                          className="w-full text-xs font-medium px-3 py-2 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300 transition-all"
                        >
                          Cancel appointment
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
