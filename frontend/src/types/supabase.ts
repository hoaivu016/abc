/**
 * Types cho Supabase để sử dụng trong toàn bộ ứng dụng
 */
import { Session as SupabaseSession, User as SupabaseUser } from '@supabase/supabase-js';

// Export lại các type từ Supabase để sử dụng nhất quán
export type Session = SupabaseSession;
export type User = SupabaseUser;

// Định nghĩa interface cho user trong database
export interface UserProfile {
  id: string;
  email: string;
  role: 'admin' | 'manager' | 'staff';
  created_at: string;
  updated_at: string;
} 