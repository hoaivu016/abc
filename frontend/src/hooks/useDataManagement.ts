import { useState, useCallback } from 'react';
import { safeQuery } from '../lib/database/supabase';

export const useDataManagement = <T>(tableName: string) => {
  const [dataList, setDataList] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Lấy danh sách dữ liệu
  const getAllData = useCallback(async (options: any = {}) => {
    setLoading(true);
    setError(null);

    try {
      const data = await safeQuery(tableName, options);

      if (data === null) {
        setError(`Không thể tải danh sách ${tableName}`);
        return [];
      }

      setDataList(data);
      return data;
    } catch (fetchError) {
      console.error(`Lỗi không xác định khi lấy ${tableName}:`, fetchError);
      setError(`Không thể tải danh sách ${tableName}`);
      return [];
    } finally {
      setLoading(false);
    }
  }, [tableName]);

  // Thêm dữ liệu mới
  const addData = useCallback(async (dataItem: Partial<T>) => {
    setLoading(true);
    setError(null);

    try {
      const result = await safeQuery(tableName, {
        select: '*',
        method: 'upsert',
        body: dataItem
      });

      if (result === null) {
        setError(`Không thể thêm ${tableName}`);
        return null;
      }

      // Cập nhật danh sách dữ liệu
      setDataList(prev => {
        // Kiểm tra và loại bỏ dữ liệu trùng
        const filteredList = prev.filter(item => 
          (item as any).id !== (dataItem as any).id
        );
        return [...filteredList, result[0]];
      });

      return result[0];
    } catch (insertError) {
      console.error(`Lỗi không xác định khi thêm ${tableName}:`, insertError);
      setError(`Không thể thêm ${tableName} mới`);
      return null;
    } finally {
      setLoading(false);
    }
  }, [tableName]);

  // Cập nhật dữ liệu
  const updateData = useCallback(async (id: string, updates: Partial<T>) => {
    setLoading(true);
    setError(null);

    try {
      const result = await safeQuery(tableName, {
        select: '*',
        method: 'update',
        filter: { id },
        body: updates
      });

      if (result === null) {
        setError(`Không thể cập nhật ${tableName}`);
        return null;
      }

      // Cập nhật danh sách dữ liệu
      setDataList(prev => 
        prev.map(item => 
          (item as any).id === id ? { ...(item as any), ...updates } : item
        )
      );

      return result[0];
    } catch (updateError) {
      console.error(`Lỗi không xác định khi cập nhật ${tableName}:`, updateError);
      setError(`Không thể cập nhật ${tableName}`);
      return null;
    } finally {
      setLoading(false);
    }
  }, [tableName]);

  // Xóa dữ liệu
  const deleteData = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await safeQuery(tableName, {
        method: 'delete',
        filter: { id }
      });

      if (result === null) {
        setError(`Không thể xóa ${tableName}`);
        return false;
      }

      // Cập nhật danh sách dữ liệu
      setDataList(prev => 
        prev.filter(item => (item as any).id !== id)
      );

      return true;
    } catch (deleteError) {
      console.error(`Lỗi không xác định khi xóa ${tableName}:`, deleteError);
      setError(`Không thể xóa ${tableName}`);
      return false;
    } finally {
      setLoading(false);
    }
  }, [tableName]);

  return {
    dataList,
    loading,
    error,
    getAllData,
    addData,
    updateData,
    deleteData
  };
};