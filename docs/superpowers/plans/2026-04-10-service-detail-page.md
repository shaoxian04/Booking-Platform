# Service Detail Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let users click a service to view a dedicated detail page showing its description and image gallery, with an inline booking flow; let providers upload images when creating a service.

**Architecture:** Add a public `GET /api/public/service/{serviceId}` backend endpoint. On the frontend, convert service cards on the provider storefront to links that navigate to a new `/services/[serviceId]` page containing the full service info and a self-contained booking flow (date → slot → book). Update the dashboard create-service modal to expose image upload.

**Tech Stack:** Spring Boot 3.4.12 / Java 21 (backend), Next.js 16 / React 19 / TypeScript / Tailwind CSS 4 (frontend)

---

## File Map

**Backend — create:**
- `booking-backend/src/main/java/com/booking/controller/PublicServiceController.java` — public `GET /api/public/service/{serviceId}` endpoint

**Backend — modify:**
- `booking-backend/src/main/java/com/booking/service/provider/ServiceProvideService.java` — add `getServiceById(UUID)` method signature
- `booking-backend/src/main/java/com/booking/service/provider/impl/ServiceProvideServiceImpl.java` — implement `getServiceById`

**Frontend — create:**
- `frontend/app/services/[serviceId]/page.tsx` — service detail + inline booking page

**Frontend — modify:**
- `frontend/lib/api.ts` — add `getServiceById(serviceId: string): Promise<ServiceResponse>`
- `frontend/app/providers/[providerId]/page.tsx` — replace `ServiceGridCard` button with `<Link>`, remove right-column booking section
- `frontend/app/dashboard/services/page.tsx` — add image upload to `CreateServiceModal`

---

## Task 1: Add `getServiceById` to service layer

**Files:**
- Modify: `booking-backend/src/main/java/com/booking/service/provider/ServiceProvideService.java`
- Modify: `booking-backend/src/main/java/com/booking/service/provider/impl/ServiceProvideServiceImpl.java`

- [ ] **Step 1: Add method to the interface**

Open `ServiceProvideService.java` and add after the `updateService` signature:

```java
public CreateServiceResponse getServiceById(UUID serviceId);
```

Full interface after edit:
```java
public interface ServiceProvideService {
    public CreateServiceResponse createService(CreateServiceRequest request, List<MultipartFile> images, UserDO user);
    public List<CreateServiceResponse> getServicesByProvider(UserDO user);
    public List<CreateServiceResponse> getServicesByProviderId(UUID providerId);
    public CreateServiceResponse disableService(UUID serviceId);
    public CreateServiceResponse updateService(ServiceUpdateRequest request, List<MultipartFile> newImages, UUID serviceId);
    public CreateServiceResponse getServiceById(UUID serviceId);
}
```

- [ ] **Step 2: Implement in `ServiceProvideServiceImpl`**

Add at the end of the class, before the private `fillUpdateService` method:

```java
@Override
public CreateServiceResponse getServiceById(UUID serviceId) {
    log.info("getServiceById, serviceId = {}", serviceId);
    ServiceProvideDO serviceDo = serviceProvideRepository.findById(serviceId)
            .orElseThrow(() -> new NotFoundException("Service not found"));
    return serviceProvideMapper.toResponse(serviceDo);
}
```

- [ ] **Step 3: Build backend to verify no compile errors**

```bash
cd booking-backend && ./mvnw clean package -DskipTests -q
```

Expected: `BUILD SUCCESS`

- [ ] **Step 4: Commit**

```bash
git add booking-backend/src/main/java/com/booking/service/provider/ServiceProvideService.java \
        booking-backend/src/main/java/com/booking/service/provider/impl/ServiceProvideServiceImpl.java
git commit -m "feat: add getServiceById to ServiceProvideService"
```

---

## Task 2: Add public `GET /api/public/service/{serviceId}` endpoint

**Files:**
- Create: `booking-backend/src/main/java/com/booking/controller/PublicServiceController.java`

- [ ] **Step 1: Create the controller**

```java
package com.booking.controller;

import com.booking.entity.DTO.response.CreateServiceResponse;
import com.booking.service.provider.ServiceProvideService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/public/service")
@RequiredArgsConstructor
@Slf4j
public class PublicServiceController {

    private final ServiceProvideService serviceProvideService;

    @GetMapping("/{serviceId}")
    public ResponseEntity<CreateServiceResponse> getServiceById(@PathVariable UUID serviceId) {
        log.info("public getServiceById, serviceId = {}", serviceId);
        CreateServiceResponse response = serviceProvideService.getServiceById(serviceId);
        return ResponseEntity.ok(response);
    }
}
```

- [ ] **Step 2: Build and verify no compile errors**

```bash
cd booking-backend && ./mvnw clean package -DskipTests -q
```

Expected: `BUILD SUCCESS`

- [ ] **Step 3: Commit**

```bash
git add booking-backend/src/main/java/com/booking/controller/PublicServiceController.java
git commit -m "feat: add public GET /api/public/service/{serviceId} endpoint"
```

---

## Task 3: Add `getServiceById` to frontend API client

**Files:**
- Modify: `frontend/lib/api.ts`

- [ ] **Step 1: Add the function**

In `frontend/lib/api.ts`, after the `getServicesByProviderId` function (find it by searching for `public/provider` with `services` in the URL), add:

```ts
export async function getServiceById(serviceId: string): Promise<ServiceResponse> {
  const res = await fetch(`${API_BASE}/public/service/${serviceId}`);
  return handleResponse<ServiceResponse>(res);
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd frontend && npm run build 2>&1 | head -30
```

Expected: no TypeScript errors referencing `api.ts`

- [ ] **Step 3: Commit**

```bash
git add frontend/lib/api.ts
git commit -m "feat: add getServiceById to API client"
```

---

## Task 4: Create the service detail page

**Files:**
- Create: `frontend/app/services/[serviceId]/page.tsx`

This page fetches the service by ID, fetches the provider, shows images/description, and includes an inline booking flow (date → slot → book).

- [ ] **Step 1: Create the file**

Create `frontend/app/services/[serviceId]/page.tsx` with this content:

```tsx
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
```

- [ ] **Step 2: Verify the page renders without TypeScript errors**

```bash
cd frontend && npm run build 2>&1 | head -40
```

Expected: no errors referencing `app/services`

- [ ] **Step 3: Commit**

```bash
git add frontend/app/services/
git commit -m "feat: add service detail page with inline booking flow"
```

---

## Task 5: Update provider storefront — service cards become links

**Files:**
- Modify: `frontend/app/providers/[providerId]/page.tsx`

The `ServiceGridCard` component currently renders as a `<button>` that selects a service. We replace it with a `<Link>` to the detail page. The right-column booking card and all its associated state are removed since booking now lives on the detail page.

- [ ] **Step 1: Replace `ServiceGridCard` component**

Find the `ServiceGridCard` function (lines ~43–111). Replace the entire function with:

```tsx
function ServiceGridCard({ service }: { service: ServiceResponse }) {
  return (
    <Link
      href={`/services/${service.serviceId}`}
      className="block rounded-2xl overflow-hidden transition-all border-2 border-slate-100 hover:border-violet-300 bg-white shadow-sm hover:shadow-md"
    >
      {service.imagePath && service.imagePath.length > 0 ? (
        <img
          src={service.imagePath[0]}
          alt={service.serviceName}
          className="w-full h-40 object-cover"
        />
      ) : (
        <div className="w-full h-40 bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center">
          <span className="text-4xl font-bold text-violet-300">
            {service.serviceName.charAt(0).toUpperCase()}
          </span>
        </div>
      )}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <p className="font-semibold text-slate-900 truncate">{service.serviceName}</p>
        </div>
        {service.serviceBio && (
          <p className="text-slate-500 text-xs mt-0.5 line-clamp-2">{service.serviceBio}</p>
        )}
        {service.categories && service.categories.length > 0 && (
          <div className="mb-2 mt-2">
            <CategoryPills categories={service.categories} />
          </div>
        )}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {service.duration} min
          </div>
          <p className="font-bold text-slate-900">${Number(service.price).toFixed(2)}</p>
        </div>
      </div>
    </Link>
  );
}
```

- [ ] **Step 2: Remove booking-related state and the right-column booking card**

In `ProviderDetailPage`, remove these state declarations (no longer needed):
```tsx
// REMOVE these lines:
const [selectedService, setSelectedService] = useState<ServiceResponse | null>(null);
const [selectedDate, setSelectedDate] = useState("");
const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
const [slotsLoading, setSlotsLoading] = useState(false);
const [slotsError, setSlotsError] = useState("");
const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);
const [minDate, setMinDate] = useState("");
const [maxDate, setMaxDate] = useState("");
const [remarks, setRemarks] = useState("");
const [bookingLoading, setBookingLoading] = useState(false);
const [bookingError, setBookingError] = useState("");
const [bookingSuccess, setBookingSuccess] = useState(false);
```

Also remove:
- The `useEffect` that sets `minDate`/`maxDate`
- The `useEffect` that loads slots (the one with `selectedService`, `selectedDate`)
- The `handleSelectService`, `handleSelectDate`, `handleSelectSlot`, `handleBooking` functions

- [ ] **Step 3: Remove router import and booking-unused imports**

Remove `useRouter` from the import if it was only used in `handleBooking`. Remove `AvailabilitySlot` from the types import. The updated imports should be:

```tsx
import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { LoadingSpinner } from "@/components/loading-spinner";
import { CategoryPills } from "@/components/category-pills";
import * as api from "@/lib/api";
import type { ProviderResponse, ServiceResponse } from "@/lib/types";
```

- [ ] **Step 4: Update the services grid in the JSX**

Find the `services.map(...)` section (~line 438–447) and replace with:

```tsx
{services.map((service) => (
  <ServiceGridCard
    key={service.serviceId}
    service={service}
  />
))}
```

- [ ] **Step 5: Remove the right-column booking card**

Find and delete the entire right-column `<div className="w-full md:w-80 md:sticky md:top-24 ...">` block (the booking card JSX with date picker, slot grid, etc.). The `main` content should now just be a single-column or left-column-only layout. Change the flex container to remove the right column:

```tsx
{/* Main content */}
<main className="max-w-6xl mx-auto px-4 py-8">
  <div className="flex flex-col gap-6">
    {/* About */}
    {provider.providerBio && (
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-3">About</h2>
        <p className="text-slate-600 leading-relaxed">{provider.providerBio}</p>
      </div>
    )}

    {/* Services grid */}
    <div>
      <h2 className="text-lg font-bold text-slate-900 mb-4">Available Services</h2>
      {servicesLoading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      ) : services.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-slate-600 font-medium">No services listed yet</p>
          <p className="text-slate-400 text-sm mt-1">This provider hasn&apos;t added any services.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service) => (
            <ServiceGridCard
              key={service.serviceId}
              service={service}
            />
          ))}
        </div>
      )}
    </div>
  </div>
</main>
```

- [ ] **Step 6: Also remove `useAuth` import since it's no longer used on this page**

- [ ] **Step 7: Build to verify no TypeScript errors**

```bash
cd frontend && npm run build 2>&1 | head -40
```

Expected: no errors

- [ ] **Step 8: Commit**

```bash
git add frontend/app/providers/
git commit -m "feat: service cards on storefront link to detail page"
```

---

## Task 6: Add image upload to dashboard create service modal

**Files:**
- Modify: `frontend/app/dashboard/services/page.tsx`

- [ ] **Step 1: Add image state to `CreateServiceModal`**

Inside the `CreateServiceModal` function, add after the existing `const [error, setError] = useState("")` line:

```tsx
const [images, setImages] = useState<File[]>([]);
const [imagePreviews, setImagePreviews] = useState<string[]>([]);
```

- [ ] **Step 2: Add image change handler inside `CreateServiceModal`**

Add after the state declarations:

```tsx
function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
  const files = Array.from(e.target.files ?? []).slice(0, 5);
  setImages(files);
  setImagePreviews(files.map((f) => URL.createObjectURL(f)));
}
```

- [ ] **Step 3: Update `handleSubmit` to send images as multipart**

Replace the current `handleSubmit` with:

```tsx
async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();
  setError("");
  const priceNum = parseFloat(price);
  if (isNaN(priceNum) || priceNum < 0) {
    setError("Please enter a valid price.");
    return;
  }
  setIsLoading(true);
  try {
    const formData = new FormData();
    formData.append(
      "data",
      new Blob(
        [JSON.stringify({
          serviceName,
          serviceBio: serviceBio || undefined,
          duration,
          price: priceNum,
          remarks: remarks || undefined,
          categories: categories.length > 0 ? categories : undefined,
        })],
        { type: "application/json" }
      )
    );
    images.forEach((img) => formData.append("images", img));

    const token = localStorage.getItem("token");
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api"}/service`,
      {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      }
    );
    if (!res.ok) {
      const text = await res.text();
      let msg = `Request failed with status ${res.status}`;
      try {
        const json = JSON.parse(text);
        msg = Array.isArray(json.errorMsg) ? json.errorMsg[0] : (json.errorMsg ?? json.message ?? msg);
      } catch { /* ignore */ }
      throw new Error(msg);
    }
    const created = await res.json() as ServiceResponse;
    onCreated(created);
  } catch (err) {
    setError(err instanceof Error ? err.message : "Failed to create service");
  } finally {
    setIsLoading(false);
  }
}
```

- [ ] **Step 4: Add image upload UI to the form**

Inside the `<form>` JSX in `CreateServiceModal`, add after the Categories field and before the error block:

```tsx
<div>
  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
    Images <span className="text-slate-400 font-normal">(optional, up to 5)</span>
  </label>
  <input
    type="file"
    accept="image/*"
    multiple
    onChange={handleImageChange}
    className="w-full text-sm text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100 transition-all"
  />
  {imagePreviews.length > 0 && (
    <div className="flex gap-2 mt-2 flex-wrap">
      {imagePreviews.map((src, i) => (
        <img
          key={i}
          src={src}
          alt={`Preview ${i + 1}`}
          className="w-16 h-16 rounded-xl object-cover border border-slate-200"
        />
      ))}
    </div>
  )}
</div>
```

- [ ] **Step 5: Build to verify no TypeScript errors**

```bash
cd frontend && npm run build 2>&1 | head -40
```

Expected: no errors

- [ ] **Step 6: Commit**

```bash
git add frontend/app/dashboard/services/page.tsx
git commit -m "feat: add image upload to create service modal"
```

---

## Task 7: Rebuild Docker and smoke-test end-to-end

- [ ] **Step 1: Rebuild Docker stack**

```bash
cd C:/Users/shaoxian04/Documents/booking-platform
docker-compose up -d --build
```

Wait ~60 seconds for services to start.

- [ ] **Step 2: Verify all services healthy**

```bash
docker-compose ps
curl -s http://localhost/api/actuator/health | python -m json.tool
```

Expected: all containers `Up`, health `{"status":"UP"}`

- [ ] **Step 3: Smoke-test the new endpoint**

```bash
# List providers to get a provider ID
curl -s "http://localhost/api/public/provider/category?category=FITNESS" | python -m json.tool | head -20
```

Use the `providerId` from the output to get a service:

```bash
curl -s "http://localhost/api/public/provider/<providerId>/services" | python -m json.tool | head -20
```

Use a `serviceId` from that output:

```bash
curl -s "http://localhost/api/public/service/<serviceId>" | python -m json.tool
```

Expected: JSON with `serviceId`, `serviceName`, `serviceBio`, `imagePath`, `price`, `duration`

- [ ] **Step 4: Browser verification**

Open `http://localhost` in a browser:
1. Navigate to any provider's storefront — service cards should be links (no click-to-select behavior)
2. Click a service card — should navigate to `/services/{serviceId}` showing image, description, and booking form
3. As a logged-in user, select a date and slot, confirm booking
4. In the provider dashboard → Services, click "New Service" — image upload field should appear at the bottom of the form

- [ ] **Step 5: Final commit (if any fixes needed)**

```bash
git add -A
git commit -m "fix: address smoke-test issues in service detail feature"
```
