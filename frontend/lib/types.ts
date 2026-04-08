export interface JwtResponse {
  token: string;
  type: string;
  id: string;
  username: string;
  email: string;
  role: string;
}

export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}

export type Category =
  | "FITNESS"
  | "BEAUTY"
  | "HEALTH"
  | "HOME_SERVICES"
  | "EDUCATION"
  | "FOOD"
  | "PETS"
  | "WELLNESS"
  | "TECH"
  | "OTHER";

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  phoneNo: string;
}

export interface UserResponse {
  userId: string;
  username: string;
  email: string;
  phoneNo: string;
  role: string;
  profileImageUrl: string | null;
  gmtCreate: string;
  gmtModified: string;
}

export interface UserProfileUpdateRequest {
  username: string;
  email: string;
  phoneNo: string;
}

export interface ProviderResponse {
  providerId: string;
  providerName: string;
  providerBio: string | null;
  profileImageUrl: string | null;
  imagePath: string[];
  location: string;
  averageRating: number | null;
  totalReviews: number | null;
  maxConcurrency: number;
  isCompleted: boolean;
  categories?: Category[];
  availableTime?: string | null;
}

export interface ServiceResponse {
  serviceId: string;
  providerId: string;
  userId: string;
  serviceName: string;
  serviceBio: string;
  duration: number;
  price: number;
  imagePath: string[];
  gmtCreate: string;
  remarks: string | null;
  categories?: Category[];
}

export interface AppointmentResponse {
  appointmentId: string;
  serviceId: string;
  providerId: string;
  userId: string;
  gmtCreate: string;
  startTime: string;
  endTime: string;
  remarks: string | null;
}

export interface CreateAppointmentRequest {
  serviceId: string;
  startTime: string;
  endTime: string;
  remarks?: string;
}

export interface CreateServiceRequest {
  serviceName: string;
  serviceBio: string;
  duration: number;
  price: number;
  remarks?: string;
  categories?: Category[];
}

export type AppointmentStatus = "unaccepted" | "accepted" | "completed" | "not-completed";
