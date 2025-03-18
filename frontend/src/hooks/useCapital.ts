import { useState, useCallback } from 'react';
import { Capital, CapitalInput } from '../models/capital';
import { capitalService } from '../services/capitalService';
import { useSnackbar } from 'notistack';

interface UseCapitalReturn {
  capitals: Capital[];
  loading: boolean;
  fetchCapitals: () => Promise<void>;
  createCapital: (input: CapitalInput) => Promise<void>;
  updateCapital: (id: string, input: Partial<CapitalInput>) => Promise<void>;
  deleteCapital: (id: string) => Promise<void>;
}

export function useCapital(): UseCapitalReturn {
  const [capitals, setCapitals] = useState<Capital[]>([]);
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const fetchCapitals = useCallback(async () => {
    try {
      setLoading(true);
      const data = await capitalService.getAll();
      setCapitals(data);
    } catch (error) {
      console.error('Error fetching capitals:', error);
      enqueueSnackbar('Không thể tải dữ liệu vốn', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [enqueueSnackbar]);

  const createCapital = useCallback(async (input: CapitalInput) => {
    try {
      setLoading(true);
      await capitalService.create(input);
      enqueueSnackbar('Thêm thông tin vốn thành công', { variant: 'success' });
      await fetchCapitals();
    } catch (error) {
      console.error('Error creating capital:', error);
      enqueueSnackbar('Không thể thêm thông tin vốn', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [enqueueSnackbar, fetchCapitals]);

  const updateCapital = useCallback(async (id: string, input: Partial<CapitalInput>) => {
    try {
      setLoading(true);
      await capitalService.update(id, input);
      enqueueSnackbar('Cập nhật thông tin vốn thành công', { variant: 'success' });
      await fetchCapitals();
    } catch (error) {
      console.error('Error updating capital:', error);
      enqueueSnackbar('Không thể cập nhật thông tin vốn', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [enqueueSnackbar, fetchCapitals]);

  const deleteCapital = useCallback(async (id: string) => {
    try {
      setLoading(true);
      await capitalService.delete(id);
      enqueueSnackbar('Xóa thông tin vốn thành công', { variant: 'success' });
      await fetchCapitals();
    } catch (error) {
      console.error('Error deleting capital:', error);
      enqueueSnackbar('Không thể xóa thông tin vốn', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [enqueueSnackbar, fetchCapitals]);

  return {
    capitals,
    loading,
    fetchCapitals,
    createCapital,
    updateCapital,
    deleteCapital
  };
} 