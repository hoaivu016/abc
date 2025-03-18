import { useState, useCallback } from 'react';
import { CapitalShareholder, CapitalShareholderInput } from '../models/capitalShareholder';
import { capitalShareholderService } from '../services/capitalShareholderService';
import { useSnackbar } from 'notistack';

interface UseCapitalShareholderReturn {
  shareholders: CapitalShareholder[];
  loading: boolean;
  fetchShareholders: (capitalId: string) => Promise<void>;
  createShareholder: (input: CapitalShareholderInput) => Promise<void>;
  updateShareholder: (id: string, input: Partial<CapitalShareholderInput>) => Promise<void>;
  deleteShareholder: (id: string) => Promise<void>;
}

export function useCapitalShareholder(): UseCapitalShareholderReturn {
  const [shareholders, setShareholders] = useState<CapitalShareholder[]>([]);
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const fetchShareholders = useCallback(async (capitalId: string) => {
    try {
      setLoading(true);
      const data = await capitalShareholderService.getAllByCapitalId(capitalId);
      setShareholders(data);
    } catch (error) {
      console.error('Error fetching shareholders:', error);
      enqueueSnackbar('Không thể tải dữ liệu cổ đông', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [enqueueSnackbar]);

  const createShareholder = useCallback(async (input: CapitalShareholderInput) => {
    try {
      setLoading(true);
      await capitalShareholderService.create(input);
      enqueueSnackbar('Thêm thông tin cổ đông thành công', { variant: 'success' });
      await fetchShareholders(input.capital_id);
    } catch (error) {
      console.error('Error creating shareholder:', error);
      enqueueSnackbar('Không thể thêm thông tin cổ đông', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [enqueueSnackbar, fetchShareholders]);

  const updateShareholder = useCallback(async (id: string, input: Partial<CapitalShareholderInput>) => {
    try {
      setLoading(true);
      await capitalShareholderService.update(id, input);
      enqueueSnackbar('Cập nhật thông tin cổ đông thành công', { variant: 'success' });
      if (input.capital_id) {
        await fetchShareholders(input.capital_id);
      }
    } catch (error) {
      console.error('Error updating shareholder:', error);
      enqueueSnackbar('Không thể cập nhật thông tin cổ đông', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [enqueueSnackbar, fetchShareholders]);

  const deleteShareholder = useCallback(async (id: string) => {
    try {
      setLoading(true);
      await capitalShareholderService.delete(id);
      enqueueSnackbar('Xóa thông tin cổ đông thành công', { variant: 'success' });
      setShareholders(prev => prev.filter(s => s.id !== id));
    } catch (error) {
      console.error('Error deleting shareholder:', error);
      enqueueSnackbar('Không thể xóa thông tin cổ đông', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [enqueueSnackbar]);

  return {
    shareholders,
    loading,
    fetchShareholders,
    createShareholder,
    updateShareholder,
    deleteShareholder
  };
} 