import { useState, useCallback } from 'react';
import { supabase, signInAnonymously, checkAndRestoreSession } from '../lib/database/supabase';
import { Staff, StaffStatus, StaffTeam, StaffRole } from '../types/staff/staff';

export const useStaffManagement = () => {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Hàm đăng nhập và xác thực
  const ensureAuthentication = async () => {
    try {
      const session = await checkAndRestoreSession();
      if (!session) {
        await signInAnonymously();
      }
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
      // Đảm bảo đã xác thực
      await ensureAuthentication();

      const { data, error } = await supabase
        .from('staff')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Lỗi lấy danh sách nhân viên:', error);
        setError(error.message);
        throw error;
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
      // Đảm bảo đã xác thực
      await ensureAuthentication();

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
        console.error('Lỗi thêm nhân viên:', error);
        setError(error.message);
        throw error;
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