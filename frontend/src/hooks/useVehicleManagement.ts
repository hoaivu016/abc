import { useState, useCallback } from 'react';
import { safeQuery } from '../lib/database/supabase';
import { Vehicle } from '../types/vehicle/vehicle';

// Enum cho trạng thái xe
export enum VehicleStatus {
  AVAILABLE = 'available',
  SOLD = 'sold',
  MAINTENANCE = 'maintenance',
  RESERVED = 'reserved'
}

export const useVehicleManagement = () => {
  const [vehicleList, setVehicleList] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Lấy danh sách xe
  const getAllVehicles = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await safeQuery('vehicles');

      if (data === null) {
        setError('Không thể tải danh sách xe');
        return [];
      }

      setVehicleList(data);
      return data;
    } catch (fetchError) {
      console.error('Lỗi không xác định khi lấy xe:', fetchError);
      setError('Không thể tải danh sách xe');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Thêm xe mới
  const addVehicle = useCallback(async (vehicleData: Partial<Vehicle>) => {
    setLoading(true);
    setError(null);

    try {
      // Chuẩn bị dữ liệu xe
      const newVehicle = {
        id: vehicleData.id || Date.now().toString(),
        name: vehicleData.name || '',
        color: vehicleData.color || '',
        manufacturing_year: vehicleData.manufacturingYear || new Date().getFullYear(),
        odo: vehicleData.odo || 0,
        purchase_price: vehicleData.purchasePrice || 0,
        sell_price: vehicleData.sellPrice || 0,
        import_date: vehicleData.importDate?.toISOString() || new Date().toISOString(),
        export_date: vehicleData.exportDate?.toISOString(),
        notes: vehicleData.notes || '',
        status: vehicleData.status || VehicleStatus.AVAILABLE,
        cost: vehicleData.cost || 0,
        debt: vehicleData.debt || 0,
        profit: vehicleData.profit || 0,
        storage_time: vehicleData.storageTime || 0,
        sales_staff_id: vehicleData.salesStaffId || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const result = await safeQuery('vehicles', {
        select: '*',
        filter: { id: newVehicle.id },
        method: 'upsert',
        body: newVehicle
      });

      if (result === null) {
        setError('Không thể thêm xe');
        return null;
      }

      // Cập nhật danh sách xe
      setVehicleList(prev => {
        // Kiểm tra và loại bỏ xe trùng
        const filteredList = prev.filter(v => v.id !== newVehicle.id);
        return [...filteredList, newVehicle];
      });

      return newVehicle;
    } catch (insertError) {
      console.error('Lỗi không xác định khi thêm xe:', insertError);
      setError('Không thể thêm xe mới');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Các hàm khác như updateVehicle, deleteVehicle... tương tự

  return {
    vehicleList,
    loading,
    error,
    getAllVehicles,
    addVehicle
  };
}; 