import { useState } from 'react';
import { Vehicle } from '../types/vehicles/vehicle';
import { createClient } from '@supabase/supabase-js';

interface UseVehicleDeleteProps {
  supabase: ReturnType<typeof createClient>;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

interface UseVehicleDeleteReturn {
  deleteVehicle: (vehicleId: string) => Promise<void>;
  isDeleting: boolean;
  error: Error | null;
}

export const useVehicleDelete = ({ 
  supabase, 
  onSuccess, 
  onError 
}: UseVehicleDeleteProps): UseVehicleDeleteReturn => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const deleteVehicle = async (vehicleId: string) => {
    if (!vehicleId) {
      throw new Error('ID xe không hợp lệ');
    }

    try {
      setIsDeleting(true);
      setError(null);

      console.log('Bắt đầu xóa xe:', vehicleId);

      // 1. Xóa xe (các bảng liên quan sẽ tự động xóa nhờ ON DELETE CASCADE)
      const { error: deleteError } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', vehicleId);

      if (deleteError) {
        console.error('Lỗi khi xóa xe:', deleteError);
        throw new Error(`Không thể xóa xe: ${deleteError.message}`);
      }

      console.log('Xóa xe thành công');

      // 2. Cập nhật local storage
      try {
        const localVehicles = JSON.parse(localStorage.getItem('vehicles') || '[]');
        const updatedVehicles = localVehicles.filter((v: Vehicle) => v.id !== vehicleId);
        localStorage.setItem('vehicles', JSON.stringify(updatedVehicles));

        // Lưu log xóa xe để đồng bộ sau này nếu mất kết nối
        const syncLog = {
          action: 'DELETE',
          table: 'vehicles',
          record_id: vehicleId,
          timestamp: new Date().toISOString()
        };
        const existingLogs = JSON.parse(localStorage.getItem('sync_logs') || '[]');
        existingLogs.push(syncLog);
        localStorage.setItem('sync_logs', JSON.stringify(existingLogs));

        console.log('Đã cập nhật local storage');
      } catch (e) {
        console.error('Lỗi khi cập nhật cache:', e);
      }

      setIsDeleting(false);
      onSuccess?.();
    } catch (error) {
      console.error('Lỗi chung:', error);
      setIsDeleting(false);
      setError(error instanceof Error ? error : new Error('Lỗi không xác định'));
      onError?.(error instanceof Error ? error : new Error('Lỗi không xác định'));
      throw error;
    }
  };

  return {
    deleteVehicle,
    isDeleting,
    error
  };
}; 