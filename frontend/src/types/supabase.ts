/**
 * Types cho Supabase để sử dụng trong toàn bộ ứng dụng
 */
import type { Session, User } from '@supabase/supabase-js';

// Export lại các type từ Supabase để sử dụng nhất quán
export type { Session, User };

// Định nghĩa interface cho user trong database
export interface UserProfile {
  id: string;
  email: string;
  role: 'admin' | 'manager' | 'staff';
  created_at: string;
  updated_at: string;
}

// Định nghĩa interface cho vehicle trong database
export interface Vehicle {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'inactive' | 'maintenance';
  created_at: string;
  updated_at: string;
}

// Định nghĩa interface cho staff trong database
export interface Staff {
  id: string;
  name: string;
  position: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

// Định nghĩa interface cho kpi_targets trong database
export interface KpiTarget {
  id: string;
  target_value: number;
  current_value: number;
  period: string;
  created_at: string;
  updated_at: string;
}

// Định nghĩa type Database chính
export type Database = {
  public: {
    Tables: {
      users: {
        Row: UserProfile;
        Insert: Omit<UserProfile, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>>;
      };
      vehicles: {
        Row: Vehicle;
        Insert: Omit<Vehicle, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Vehicle, 'id' | 'created_at' | 'updated_at'>>;
      };
      staff: {
        Row: Staff;
        Insert: Omit<Staff, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Staff, 'id' | 'created_at' | 'updated_at'>>;
      };
      kpi_targets: {
        Row: KpiTarget;
        Insert: Omit<KpiTarget, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<KpiTarget, 'id' | 'created_at' | 'updated_at'>>;
      };
    };
    Views: {
      [key: string]: {
        Row: Record<string, unknown>;
      };
    };
    Functions: {
      [key: string]: {
        Args: Record<string, unknown>;
        Returns: unknown;
      };
    };
    Enums: {
      [key: string]: string[];
    };
  };
}; 