"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { LoadingSpinner } from "@/components/loading-spinner";
import { CategoryPills } from "@/components/category-pills";
import { useAuth } from "@/lib/auth-context";
import * as api from "@/lib/api";
import type { ServiceResponse, ProviderResponse, AvailabilitySlot } from "@/lib/types";

function formatTime(timeStr: string): string {
  const [h, m] = timeStr.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, "0")} ${period}`;
}

function toLocalDateTime(date: string, timeStr: string): string {
  const [h, m, s] = timeStr.split(":");
  return `${date}T${h}:${m}:${s ?? "00"}`;
}

function SlotPill({
  slot,
  selected,
  onSelect,
}: {
  slot: AvailabilitySlot;
  selected: boolean;
  onSelect: (slot: AvailabilitySlot) => void;
}) {
  if (!slot.available) {
    return (
      <div className="relative flex flex-col items-center justify-center rounded-xl px-3 py-2.5 text-center bg-slate-100 cursor-not-allowed select-none">
        <span className="text-xs font-medium text-slate-400 line-through">{formatTime(slot.startTime)}</span>
        <span className="text-[10px] text-slate-400 mt-0.5">Booked</span>
      </div>
    );
  }
  return (
    <button
      type="button"
      onClick={() => onSelect(slot)}
      className={`flex flex-col items-center justify-center rounded-xl px-3 py-2.5 text-center transition-all border ${
        selected
          ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-transparent shadow-md shadow-violet-200"
          : "bg-white border-slate-200 text-slate-700 hover:border-violet-400 hover:bg-violet-50"
      }`}
    >
      <span className="text-xs font-semibold">{formatTime(slot.startTime)}</span>
      <span className={`text-[10px] mt-0.5 ${selected ? "text-violet-100" : "text-slate-400"}`}>
        {formatTime(slot.endTime)}
      </span>
    </button>
  );
}

export default function ServiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const serviceId = params.serviceId as string;

  const [service, setService] = useState<ServiceResponse | null>(null);
  const [provider, setProvider] = useState<ProviderResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeImage, setActiveImage] = useState(0);
  const [selectedDate, setSelectedDate] = useState("");
  const [minDate, setMinDate] = useState("");
  const [maxDate, setMaxDate] = useState("");
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);
  const [remarks, setRemarks] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    const today = new Date();
    setMinDate(today.toISOString().split("T")[0]);
    const max = new Date();
    max.setDate(max.getDate() + 60);
    setMaxDate(max.toISOString().split("T")[0]);
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        const svc = await api.getServiceById(serviceId);
        setService(svc);
        const prov = await api.getProviderByIdPublic(svc.providerId);
        setProvider(prov);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load service");
      } finally {
        setIsLoading(false);
      }
    }
    if (serviceId) fetchData();
  }, [serviceId]);

  useEffect(() => {
    if (!service || !selectedDate || selectedDate.length < 10) {
      setSlots([]);
      setSelectedSlot(null);
      return;
    }
    setSlotsLoading(true);
    setSlotsError("");
    setSelectedSlot(null);
    setSlots([]);
    const timer = setTimeout(() => {
      api
        .getProviderAvailability(service.providerId, selectedDate, service.serviceId)
        .then(setSlots)
        .catch((err) => {
          setSlotsError(err instanceof Error ? err.message : "Failed to load availability");
          setSlots([]);
        })
        .finally(() => setSlotsLoading(false));
    }, 400);
    return () => clearTimeout(timer);
  }, [service, selectedDate]);

  async function handleBooking(e: React.FormEvent) {
    e.preventDefault();
    setBookingError("");
    setBookingSuccess(false);

    if (!user) {
      router.push(`/login?redirect=/services/${serviceId}`);
      return;
    }
    if (!selectedSlot || !service) {
      setBookingError("Please select a time slot.");
      return;
    }
    setBookingLoading(true);
    try {
      await api.createAppointment({
        serviceId: service.serviceId,
        startTime: toLocalDateTime(selectedDate, selectedSlot.startTime),
        endTime: toLocalDateTime(selectedDate, selectedSlot.endTime),
        remarks: remarks || undefined,
      });
      setBookingSuccess(true);
      setSelectedDate("");
      setSelectedSlot(null);
      setSlots([]);
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

      {isLoading && (
        <div className="flex justify-center py-32">
          <LoadingSpinner />
        </div>
      )}

      {error && (
        <div className="max-w-4xl mx-auto px-4 py-10">
          <div className="flex items-center gap-3 text-red-600 bg-red-50 border border-red-200 rounded-2xl px-5 py-4">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {service && (
        <main className="max-w-6xl mx-auto px-4 py-8">
          {/* Back link */}
          {provider && (
            <Link
              href={`/providers/${provider.providerId}`}
              className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-violet-600 mb-6 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to {provider.providerName}
            </Link>
          )}

          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Left: images + info */}
            <div className="flex-1 min-w-0 flex flex-col gap-6">

              {/* Image gallery */}
              {service.imagePath && service.imagePath.length > 0 ? (
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  <img
                    src={service.imagePath[activeImage]}
                    alt={service.serviceName}
                    className="w-full h-72 md:h-96 object-cover"
                  />
                  {service.imagePath.length > 1 && (
                    <div className="flex gap-2 p-4 overflow-x-auto scrollbar-hide">
                      {service.imagePath.map((src, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setActiveImage(i)}
                          className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                            i === activeImage ? "border-violet-500" : "border-transparent opacity-60 hover:opacity-100"
                          }`}
                        >
                          <img src={src} alt={`Thumbnail ${i + 1}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-gradient-to-br from-violet-100 to-indigo-100 rounded-2xl shadow-sm h-72 md:h-96 flex items-center justify-center">
                  <span className="text-8xl font-bold text-violet-300">
                    {service.serviceName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}

              {/* Service info */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <h1 className="text-2xl font-bold text-slate-900">{service.serviceName}</h1>
                  <p className="text-2xl font-bold text-violet-600 flex-shrink-0">${Number(service.price).toFixed(2)}</p>
                </div>

                <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
                  <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {service.duration} min
                  </span>
                </div>

                {service.categories && service.categories.length > 0 && (
                  <div className="mb-4">
                    <CategoryPills categories={service.categories} />
                  </div>
                )}

                {service.serviceBio && (
                  <>
                    <h2 className="text-sm font-semibold text-slate-700 mb-2">About this service</h2>
                    <p className="text-slate-600 leading-relaxed">{service.serviceBio}</p>
                  </>
                )}

                {service.remarks && (
                  <p className="text-slate-400 text-sm mt-3 italic">{service.remarks}</p>
                )}
              </div>

              {/* Provider card */}
              {provider && (
                <Link
                  href={`/providers/${provider.providerId}`}
                  className="bg-white rounded-2xl shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow"
                >
                  {provider.profileImageUrl ? (
                    <img src={provider.profileImageUrl} alt={provider.providerName} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-xl font-bold text-white">{provider.providerName.charAt(0).toUpperCase()}</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-400 mb-0.5">Offered by</p>
                    <p className="font-bold text-slate-900">{provider.providerName}</p>
                    {provider.location && <p className="text-slate-500 text-sm">{provider.location}</p>}
                  </div>
                  <svg className="w-5 h-5 text-slate-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              )}
            </div>

            {/* Right: booking card */}
            <div className="w-full lg:w-80 lg:sticky lg:top-24 flex-shrink-0">
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center">
                    <svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">Book Now</h2>
                    <p className="text-slate-400 text-xs">{service.duration} min · ${Number(service.price).toFixed(2)}</p>
                  </div>
                </div>

                {!user && (
                  <div className="mb-4 bg-violet-50 border border-violet-200 rounded-xl px-4 py-3 text-center">
                    <p className="text-sm text-violet-700 font-medium mb-2">Log in to book this service</p>
                    <Link
                      href={`/login?redirect=/services/${serviceId}`}
                      className="inline-block bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-semibold rounded-xl px-4 py-2 hover:from-violet-700 hover:to-indigo-700 transition-all"
                    >
                      Log in
                    </Link>
                  </div>
                )}

                {bookingSuccess && (
                  <div className="mb-4 flex items-center gap-3 text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm font-medium">Booking confirmed!</p>
                  </div>
                )}

                <form onSubmit={handleBooking} className="flex flex-col gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Select Date</label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => { setSelectedDate(e.target.value); setSelectedSlot(null); setBookingError(""); }}
                      min={minDate}
                      max={maxDate}
                      disabled={!user}
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all disabled:opacity-50"
                    />
                  </div>

                  {selectedDate && selectedDate.length >= 10 && (
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Available Slots</label>
                      {slotsLoading && (
                        <div className="flex justify-center py-4">
                          <LoadingSpinner className="h-5 w-5" />
                        </div>
                      )}
                      {slotsError && <p className="text-red-500 text-sm">{slotsError}</p>}
                      {!slotsLoading && !slotsError && slots.length === 0 && (
                        <p className="text-slate-400 text-sm text-center py-3">No slots available for this date.</p>
                      )}
                      {!slotsLoading && slots.length > 0 && (
                        <div className="grid grid-cols-2 gap-2">
                          {slots.map((slot, i) => (
                            <SlotPill
                              key={i}
                              slot={slot}
                              selected={selectedSlot?.startTime === slot.startTime}
                              onSelect={(s) => { setSelectedSlot(s); setBookingError(""); }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {selectedSlot && (
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                        Notes <span className="text-slate-400 font-normal">(optional)</span>
                      </label>
                      <textarea
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        rows={2}
                        placeholder="Any special requests..."
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all resize-none"
                      />
                    </div>
                  )}

                  {bookingError && (
                    <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-sm">{bookingError}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={!user || !selectedSlot || bookingLoading}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-sm font-semibold rounded-xl py-3 transition-all disabled:opacity-50 shadow-md shadow-violet-200"
                  >
                    {bookingLoading && <LoadingSpinner className="h-4 w-4" />}
                    Confirm Booking
                  </button>
                </form>
              </div>
            </div>
          </div>
        </main>
      )}
    </div>
  );
}
