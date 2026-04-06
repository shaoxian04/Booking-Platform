"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { LoadingSpinner } from "@/components/loading-spinner";
import { useAuth } from "@/lib/auth-context";
import * as api from "@/lib/api";
import type { ProviderResponse, ServiceResponse } from "@/lib/types";

function formatDateTime(value: string): string {
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return value + ":00";
  return value;
}

function addMinutes(dateTimeLocal: string, minutes: number): string {
  const dt = new Date(dateTimeLocal);
  dt.setMinutes(dt.getMinutes() + minutes);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg key={star} className={`w-4 h-4 ${star <= Math.round(rating) ? "text-amber-400" : "text-slate-200"}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function ServiceCard({
  service,
  selected,
  onSelect,
}: {
  service: ServiceResponse;
  selected: boolean;
  onSelect: (s: ServiceResponse) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(service)}
      className={`w-full text-left rounded-2xl border-2 p-4 transition-all ${
        selected
          ? "border-violet-500 bg-violet-50 ring-2 ring-violet-200"
          : "border-slate-200 bg-white hover:border-violet-300 hover:bg-violet-50/50"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {selected && (
              <div className="w-5 h-5 rounded-full bg-violet-600 flex items-center justify-center flex-shrink-0">
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
            <p className="font-semibold text-slate-900 truncate">{service.serviceName}</p>
          </div>
          {service.serviceBio && (
            <p className="text-slate-500 text-sm line-clamp-2 mb-2">{service.serviceBio}</p>
          )}
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {service.duration} min
            </span>
          </div>
        </div>
        <div className="flex-shrink-0 text-right">
          <p className="font-bold text-slate-900 text-lg">${Number(service.price).toFixed(2)}</p>
        </div>
      </div>
    </button>
  );
}

export default function ProviderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const providerId = params.providerId as string;

  const [provider, setProvider] = useState<ProviderResponse | null>(null);
  const [services, setServices] = useState<ServiceResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedService, setSelectedService] = useState<ServiceResponse | null>(null);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [remarks, setRemarks] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const providerData = user
          ? await api.getProviderById(providerId)
          : await api.getProviderByIdPublic(providerId);
        setProvider(providerData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load provider");
      } finally {
        setIsLoading(false);
      }
    }
    if (providerId) fetchData();
  }, [providerId, user]);

  useEffect(() => {
    async function fetchServices() {
      try {
        const data = await api.getServicesByProviderId(providerId);
        setServices(data);
      } catch {
        setServices([]);
      } finally {
        setServicesLoading(false);
      }
    }
    if (providerId) fetchServices();
  }, [providerId]);

  function handleSelectService(service: ServiceResponse) {
    setSelectedService(service);
    if (startTime) {
      setEndTime(addMinutes(startTime, service.duration));
    }
  }

  function handleStartTimeChange(value: string) {
    setStartTime(value);
    if (selectedService && value) {
      setEndTime(addMinutes(value, selectedService.duration));
    }
  }

  async function handleBooking(e: React.FormEvent) {
    e.preventDefault();
    setBookingError("");
    setBookingSuccess(false);

    if (!user) {
      router.push(`/login?redirect=/providers/${providerId}`);
      return;
    }

    if (!selectedService) {
      setBookingError("Please select a service first.");
      return;
    }

    setBookingLoading(true);
    try {
      await api.createAppointment({
        serviceId: selectedService.serviceId,
        startTime: formatDateTime(startTime),
        endTime: formatDateTime(endTime),
        remarks: remarks || undefined,
      });
      setBookingSuccess(true);
      setSelectedService(null);
      setStartTime("");
      setEndTime("");
      setRemarks("");
    } catch (err) {
      setBookingError(err instanceof Error ? err.message : "Booking failed");
    } finally {
      setBookingLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-10">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-violet-600 mb-8 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to search
        </Link>

        {isLoading && <div className="flex justify-center py-20"><LoadingSpinner /></div>}

        {error && (
          <div className="flex items-center gap-3 text-red-600 bg-red-50 border border-red-200 rounded-2xl px-5 py-4">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {provider && (
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            {/* Left column */}
            <div className="flex-1 flex flex-col gap-6">
              {/* Provider hero */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="bg-gradient-to-r from-violet-600 to-indigo-700 h-24" />
                <div className="px-6 pb-6">
                  <div className="flex items-end gap-5 -mt-10 mb-5">
                    {provider.profileImageUrl ? (
                      <img src={provider.profileImageUrl} alt={provider.providerName} className="w-20 h-20 rounded-2xl object-cover border-4 border-white shadow-lg" />
                    ) : (
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center border-4 border-white shadow-lg">
                        <span className="text-white text-3xl font-bold">{provider.providerName.charAt(0).toUpperCase()}</span>
                      </div>
                    )}
                    <div className="pb-1">
                      <h1 className="text-2xl font-bold text-slate-900">{provider.providerName}</h1>
                      <div className="flex items-center gap-1.5 mt-0.5 text-slate-500 text-sm">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {provider.location}
                      </div>
                    </div>
                  </div>
                  <p className="text-slate-600 leading-relaxed mb-5">{provider.providerBio}</p>
                  <div className="flex flex-wrap gap-4">
                    {provider.averageRating !== null && (
                      <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2">
                        <StarRating rating={provider.averageRating} />
                        <span className="font-bold text-slate-800">{provider.averageRating.toFixed(1)}</span>
                        {provider.totalReviews !== null && (
                          <span className="text-slate-500 text-sm">({provider.totalReviews} reviews)</span>
                        )}
                      </div>
                    )}
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2">
                      <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-sm text-slate-600">Up to <strong>{provider.maxConcurrency}</strong> concurrent bookings</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Gallery */}
              {provider.imagePath && provider.imagePath.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">Gallery</h2>
                  <div className="flex gap-3 overflow-x-auto pb-1">
                    {provider.imagePath.map((src, i) => (
                      <img key={i} src={src} alt={`Gallery ${i + 1}`} className="w-44 h-32 object-cover rounded-xl flex-shrink-0" />
                    ))}
                  </div>
                </div>
              )}

              {/* Services list */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Available Services</h2>
                {servicesLoading ? (
                  <div className="flex justify-center py-8"><LoadingSpinner /></div>
                ) : services.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-slate-600 font-medium">No services listed yet</p>
                    <p className="text-slate-400 text-sm mt-1">This provider hasn&apos;t added any services.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {services.map((service) => (
                      <ServiceCard
                        key={service.serviceId}
                        service={service}
                        selected={selectedService?.serviceId === service.serviceId}
                        onSelect={handleSelectService}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right column — sticky booking form */}
            <div className="w-full lg:w-80 lg:sticky lg:top-24 flex-shrink-0">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center">
                    <svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">Select a service & time</h2>
                    <p className="text-slate-400 text-xs">Pick a service from the list on the left</p>
                  </div>
                </div>

                {selectedService && (
                  <div className="mb-4 bg-violet-50 border border-violet-200 rounded-xl px-4 py-3">
                    <p className="text-xs text-violet-600 font-semibold mb-0.5">Selected service</p>
                    <p className="font-semibold text-slate-900 text-sm">{selectedService.serviceName}</p>
                    <p className="text-slate-500 text-xs">{selectedService.duration} min · ${Number(selectedService.price).toFixed(2)}</p>
                  </div>
                )}

                {bookingSuccess && (
                  <div className="mb-4 flex items-center gap-3 text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm font-medium">Booked! Check My Appointments.</p>
                  </div>
                )}

                <form onSubmit={handleBooking} className="flex flex-col gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Start Time</label>
                    <input
                      type="datetime-local"
                      value={startTime}
                      onChange={(e) => handleStartTimeChange(e.target.value)}
                      required
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      End Time
                      {selectedService && <span className="text-violet-500 font-normal text-xs ml-1">(auto-calculated)</span>}
                    </label>
                    <input
                      type="datetime-local"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      required
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Remarks <span className="text-slate-400 font-normal">(optional)</span>
                    </label>
                    <textarea
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      rows={3}
                      placeholder="Any special requests..."
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all resize-none"
                    />
                  </div>
                  {bookingError && (
                    <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-sm">{bookingError}</p>
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={bookingLoading || (!selectedService && !!user)}
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-semibold rounded-xl py-3 shadow-md shadow-violet-200 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {bookingLoading && <LoadingSpinner className="h-4 w-4" />}
                    {user ? "Confirm Booking" : "Log in to Book"}
                  </button>
                  {!user && (
                    <p className="text-xs text-slate-400 text-center">You&apos;ll be redirected to log in</p>
                  )}
                </form>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
