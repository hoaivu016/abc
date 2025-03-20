import { useState, useCallback } from 'react';
import { supabase, handleAuthError } from '../lib/database/supabase';
import { Staff, StaffStatus, StaffTeam, StaffRole } from '../types/staff/staff';
import type { Session } from '@supabase/supabase-js';

export const useStaffManagement = () => {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Hàm đảm bảo xác thực
  const ensureAuthentication = async (): Promise<Session | null> => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        const { data: authData, error } = await supabase.auth.signInAnonymously();
        if (error) throw error;
        return authData.session;
      }
      return sessionData.session;
    } catch (authError) {
      console.error('Lỗi xác thực:', authError);
      throw authError;
    }
  };

  // Lấy danh sách nhân viên
  const getAllStaff = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('staff')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        // Thử xử lý lỗi xác thực
        const handled = await handleAuthError(error);
        if (handled) {
          // Thử lại sau khi xử lý lỗi
          return getAllStaff();
        }

        console.error('Lỗi lấy danh sách nhân viên:', error);
        setError(error.message);
        return [];
      }

      setStaffList(data || []);
      return data || [];
    } catch (fetchError) {
      console.error('Lỗi không xác định khi lấy nhân viên:', fetchError);
      setError('Không thể tải danh sách nhân viên');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Thêm nhân viên mới
  const addStaff = useCallback(async (staffData: Partial<Staff>) => {
    setLoading(true);
    setError(null);

    try {
      // Chuẩn bị dữ liệu nhân viên
      const newStaff = {
        id: Date.now().toString(),
        name: staffData.name || '',
        phone: staffData.phone || '',
        email: staffData.email || '',
        team: staffData.team || StaffTeam.SALES_1,
        role: staffData.role || StaffRole.STAFF,
        status: staffData.status || StaffStatus.ACTIVE,
        join_date: staffData.joinDate?.toISOString() || new Date().toISOString(),
        base_salary: staffData.salary || 0,
        commission_rate: staffData.commissionRate || 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('staff')
        .insert(newStaff)
        .select();

      if (error) {
        // Thử xử lý lỗi xác thực
        const handled = await handleAuthError(error);
        if (handled) {
          // Thử lại sau khi xử lý lỗi
          return addStaff(staffData);
        }

        console.error('Lỗi thêm nhân viên:', error);
        setError(error.message);
        return null;
      }

      // Cập nhật danh sách nhân viên
      if (data) {
        setStaffList(prev => [...prev, data[0]]);
      }

      return data ? data[0] : null;
    } catch (insertError) {
      console.error('Lỗi không xác định khi thêm nhân viên:', insertError);
      setError('Không thể thêm nhân viên mới');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Các hàm khác như updateStaff, deleteStaff... tương tự

  return {
    staffList,
    loading,
    error,
    getAllStaff,
    addStaff
  };
}; 