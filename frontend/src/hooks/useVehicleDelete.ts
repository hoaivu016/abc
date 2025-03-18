import { useState } from 'react';
import { Vehicle } from '../types/vehicles/vehicle';
import { SupabaseClient } from '@supabase/supabase-js';

interface UseVehicleDeleteProps {
  supabase: SupabaseClient;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

interface UseVehicleDeleteReturn {
  isDeleting: boolean;
  error: Error | null;
  deleteVehicle: (vehicleId: string) => Promise<void>;
  resetError: () => void;
}

export const useVehicleDelete = ({ 
  supabase, 
  onSuccess, 
  onError 
}: UseVehicleDeleteProps): UseVehicleDeleteReturn => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const deleteVehicle = async (vehicleId: string) => {
    try {
      setIsDeleting(true);
      setError(null);

      // 1. Kiểm tra xem xe có tồn tại không và lấy thông tin liên quan
      const { data: vehicle, error: checkError } = await supabase
        .from('vehicles')
        .select('id')
        .eq('id', vehicleId)
        .single();

      if (checkError) {
        throw new Error('Không tìm thấy xe cần xóa');
      }

      // 2. Xóa tất cả dữ liệu liên quan đến xe
      try {
        // Xóa chi phí
        await supabase
          .from('costs')
          .delete()
          .eq('vehicle_id', vehicleId)
          .throwOnError();

        // Xóa thanh toán
        await supabase
          .from('payments')
          .delete()
          .eq('vehicle_id', vehicleId)
          .throwOnError();

        // Xóa lịch sử trạng thái xe (nếu có)
        await supabase
          .from('vehicle_status_history')
          .delete()
          .eq('vehicle_id', vehicleId)
          .throwOnError();

        // Xóa ghi chú xe (nếu có)
        await supabase
          .from('vehicle_notes')
          .delete()
          .eq('vehicle_id', vehicleId)
          .throwOnError();

        // Xóa tài liệu xe (nếu có)
        await supabase
          .from('vehicle_documents')
          .delete()
          .eq('vehicle_id', vehicleId)
          .throwOnError();

        // Xóa các bản ghi liên quan khác (nếu có)
        await supabase
          .from('vehicle_maintenance')
          .delete()
          .eq('vehicle_id', vehicleId)
          .throwOnError();

        // 3. Cuối cùng xóa xe
        const { error: deleteError } = await supabase
          .from('vehicles')
          .delete()
          .eq('id', vehicleId);

        if (deleteError) {
          throw new Error('Không thể xóa xe. Vui lòng thử lại sau.');
        }

        // 4. Xóa khỏi localStorage
        try {
          const localVehicles = JSON.parse(localStorage.getItem('vehicles') || '[]');
          localStorage.setItem(
            'vehicles', 
            JSON.stringify(localVehicles.filter((v: Vehicle) => v.id !== vehicleId))
          );
        } catch (e) {
          console.error('Lỗi khi xóa xe khỏi localStorage:', e);
        }

        // 5. Gọi callback thành công
        onSuccess?.();

      } catch (err) {
        console.error('Lỗi khi xóa dữ liệu liên quan:', err);
        throw new Error('Có lỗi xảy ra khi xóa dữ liệu liên quan đến xe');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra khi xóa xe';
      const error = new Error(errorMessage);
      setError(error);
      onError?.(error);
      throw error;
    } finally {
      setIsDeleting(false);
    }
  };

  const resetError = () => setError(null);

  return {
    isDeleting,
    error,
    deleteVehicle,
    resetError
  };
}; 