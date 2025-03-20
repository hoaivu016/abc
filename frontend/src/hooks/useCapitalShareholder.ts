import { useState } from 'react';
import { useSnackbar } from 'notistack';
import { CapitalShareholder, CapitalShareholderInput } from '../models/capitalShareholder';
import { capitalShareholderService } from '../services/capitalShareholderService';

export const useCapitalShareholder = (capitalId: string) => {
  const [shareholders, setShareholders] = useState<CapitalShareholder[]>([]);
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const fetchShareholders = async () => {
    try {
      setLoading(true);
      const data = await capitalShareholderService.getShareholdersByCapitalId(capitalId);
      setShareholders(data);
    } catch (error) {
      console.error('Error fetching shareholders:', error);
      enqueueSnackbar('Lỗi khi tải danh sách cổ đông', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const createShareholder = async (shareholder: CapitalShareholderInput) => {
    try {
      setLoading(true);
      await capitalShareholderService.createShareholder(shareholder);
      enqueueSnackbar('Thêm cổ đông thành công', { variant: 'success' });
      await fetchShareholders();
    } catch (error) {
      console.error('Error creating shareholder:', error);
      enqueueSnackbar('Lỗi khi thêm cổ đông', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const updateShareholder = async (id: string, shareholder: Partial<CapitalShareholderInput>) => {
    try {
      setLoading(true);
      await capitalShareholderService.updateShareholder(id, shareholder);
      enqueueSnackbar('Cập nhật thông tin cổ đông thành công', { variant: 'success' });
      if (shareholder.capital_id === capitalId) {
        await fetchShareholders();
      }
    } catch (error) {
      console.error('Error updating shareholder:', error);
      enqueueSnackbar('Lỗi khi cập nhật thông tin cổ đông', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const deleteShareholder = async (id: string) => {
    try {
      setLoading(true);
      await capitalShareholderService.deleteShareholder(id);
      setShareholders(shareholders.filter(s => s.id !== id));
      enqueueSnackbar('Xóa cổ đông thành công', { variant: 'success' });
    } catch (error) {
      console.error('Error deleting shareholder:', error);
      enqueueSnackbar('Lỗi khi xóa cổ đông', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return {
    shareholders,
    loading,
    fetchShareholders,
    createShareholder,
    updateShareholder,
    deleteShareholder
  };
}; 