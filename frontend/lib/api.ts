import type {
  JwtResponse, LoginRequest, RegisterRequest,
  UserResponse, UserProfileUpdateRequest,
  ProviderResponse, ServiceResponse, AppointmentResponse, CreateAppointmentRequest,
  AppointmentStatus, CreateServiceRequest, AvailabilitySlot,
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api";

function getAuthHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("token");
  if (token) return { Authorization: `Bearer ${token}` };
  return {};
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text();
    try {
      const json = JSON.parse(text);
      // Backend ApiError shape: { errorMsg: string[] | string, ... }
      const msg = Array.isArray(json.errorMsg)
        ? json.errorMsg[0]
        : (json.errorMsg ?? json.message ?? `Request failed with status ${res.status}`);
      throw new Error(msg);
    } catch (e) {
      if (e instanceof Error && e.message !== text) throw e;
      throw new Error(text || `Request failed with status ${res.status}`);
    }
  }
  return res.json() as Promise<T>;
}

export async function login(data: LoginRequest): Promise<JwtResponse> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<JwtResponse>(res);
}

export async function register(data: RegisterRequest, profileImage?: File): Promise<string> {
  const formData = new FormData();
  formData.append("data", new Blob([JSON.stringify(data)], { type: "application/json" }));
  if (profileImage) formData.append("profileImage", profileImage);
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { ...getAuthHeaders() },
    body: formData,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Registration failed with status ${res.status}`);
  }
  return res.text();
}

export async function becomeProvider(
  data: object,
  profileImage?: File,
  shopImages?: File[],
): Promise<unknown> {
  const formData = new FormData();
  formData.append("data", new Blob([JSON.stringify(data)], { type: "application/json" }));
  if (profileImage) formData.append("profileImage", profileImage);
  if (shopImages) {
    shopImages.forEach((img) => formData.append("shopImages", img));
  }
  const res = await fetch(`${API_BASE}/provider/register`, {
    method: "POST",
    headers: { ...getAuthHeaders() },
    body: formData,
  });
  return handleResponse<unknown>(res);
}

export async function getProvidersByCategory(category: string): Promise<ProviderResponse[]> {
  const res = await fetch(
    `${API_BASE}/public/provider/category?category=${encodeURIComponent(category)}`,
  );
  return handleResponse<ProviderResponse[]>(res);
}

export async function getProfile(): Promise<UserResponse> {
  const res = await fetch(`${API_BASE}/user/profile`, {
    headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
  });
  return handleResponse<UserResponse>(res);
}

export async function updateProfile(data: UserProfileUpdateRequest, profileImage?: File): Promise<UserResponse> {
  const formData = new FormData();
  formData.append("data", new Blob([JSON.stringify(data)], { type: "application/json" }));
  if (profileImage) formData.append("profileImage", profileImage);
  const res = await fetch(`${API_BASE}/user/profile`, {
    method: "PUT",
    headers: { ...getAuthHeaders() },
    body: formData,
  });
  return handleResponse<UserResponse>(res);
}

export async function searchProviders(queryName: string): Promise<ProviderResponse[]> {
  const res = await fetch(`${API_BASE}/provider/?queryName=${encodeURIComponent(queryName)}`, {
    headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
  });
  return handleResponse<ProviderResponse[]>(res);
}

export async function getProviderById(providerId: string): Promise<ProviderResponse> {
  const res = await fetch(`${API_BASE}/provider/${providerId}`, {
    headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
  });
  return handleResponse<ProviderResponse>(res);
}

export async function getMyProviderProfile(): Promise<ProviderResponse> {
  const res = await fetch(`${API_BASE}/provider/me`, {
    headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
  });
  return handleResponse<ProviderResponse>(res);
}

export async function updateProviderProfile(
  data: object,
  profileImage?: File,
  providerImages?: File[],
): Promise<ProviderResponse> {
  const formData = new FormData();
  formData.append("data", new Blob([JSON.stringify(data)], { type: "application/json" }));
  if (profileImage) formData.append("profileImage", profileImage);
  if (providerImages) {
    providerImages.forEach((img) => formData.append("providerImages", img));
  }
  const res = await fetch(`${API_BASE}/provider/`, {
    method: "PUT",
    headers: { ...getAuthHeaders() },
    body: formData,
  });
  return handleResponse<ProviderResponse>(res);
}

export async function createAppointment(data: CreateAppointmentRequest): Promise<AppointmentResponse> {
  const res = await fetch(`${API_BASE}/appointment/`, {
    method: "POST",
    headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<AppointmentResponse>(res);
}

export async function deleteAppointment(appointmentId: string): Promise<AppointmentResponse> {
  const res = await fetch(`${API_BASE}/appointment/${appointmentId}`, {
    method: "DELETE",
    headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
  });
  return handleResponse<AppointmentResponse>(res);
}

export async function getUserAppointments(status: AppointmentStatus): Promise<AppointmentResponse[]> {
  const res = await fetch(`${API_BASE}/appointment/user/${status}`, {
    headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
  });
  return handleResponse<AppointmentResponse[]>(res);
}

export async function getProviderAppointments(status: AppointmentStatus): Promise<AppointmentResponse[]> {
  const res = await fetch(`${API_BASE}/appointment/provider/${status}`, {
    headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
  });
  return handleResponse<AppointmentResponse[]>(res);
}

export async function acceptAppointment(id: string): Promise<AppointmentResponse> {
  const res = await fetch(`${API_BASE}/appointment/${id}/accept`, {
    method: "PUT",
    headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
  });
  return handleResponse<AppointmentResponse>(res);
}

export async function completeAppointment(id: string): Promise<AppointmentResponse> {
  const res = await fetch(`${API_BASE}/appointment/${id}/complete`, {
    method: "PUT",
    headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
  });
  return handleResponse<AppointmentResponse>(res);
}

export async function getServicesByProviderId(providerId: string): Promise<ServiceResponse[]> {
  const res = await fetch(`${API_BASE}/public/provider/${providerId}/services`);
  return handleResponse<ServiceResponse[]>(res);
}

export async function getServiceById(serviceId: string): Promise<ServiceResponse> {
  const res = await fetch(`${API_BASE}/public/service/${serviceId}`);
  return handleResponse<ServiceResponse>(res);
}

export async function getProviderByIdPublic(providerId: string): Promise<ProviderResponse> {
  const res = await fetch(`${API_BASE}/public/provider/${providerId}`);
  return handleResponse<ProviderResponse>(res);
}

export async function searchProvidersPublic(queryName: string): Promise<ProviderResponse[]> {
  const res = await fetch(`${API_BASE}/public/provider/search?queryName=${encodeURIComponent(queryName)}`);
  return handleResponse<ProviderResponse[]>(res);
}

export async function getMyServices(): Promise<ServiceResponse[]> {
  const res = await fetch(`${API_BASE}/service/provider-all`, {
    headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
  });
  return handleResponse<ServiceResponse[]>(res);
}

export async function createService(data: CreateServiceRequest): Promise<ServiceResponse> {
  const formData = new FormData();
  formData.append("data", new Blob([JSON.stringify(data)], { type: "application/json" }));
  const res = await fetch(`${API_BASE}/service`, {
    method: "POST",
    headers: { ...getAuthHeaders() },
    body: formData,
  });
  return handleResponse<ServiceResponse>(res);
}

export async function disableService(serviceId: string): Promise<ServiceResponse> {
  const res = await fetch(`${API_BASE}/service/disabled/${serviceId}`, {
    method: "PUT",
    headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
  });
  return handleResponse<ServiceResponse>(res);
}

export async function getProviderAvailability(
  providerId: string,
  date: string,
  serviceId: string,
): Promise<AvailabilitySlot[]> {
  const params = new URLSearchParams({ date, serviceId });
  const res = await fetch(`${API_BASE}/public/provider/${providerId}/availability?${params}`);
  return handleResponse<AvailabilitySlot[]>(res);
}
