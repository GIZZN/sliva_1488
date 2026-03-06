// User types
export interface User {
  id: number;
  email: string;
  name: string;
  clerk_id?: string;
  created_at: Date;
}

// Booking types
export interface Booking {
  id: number;
  user_id: number;
  service: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  created_at: Date;
}

// Auth types
export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  error?: string;
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
