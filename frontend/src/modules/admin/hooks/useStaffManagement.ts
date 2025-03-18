import { useState, useCallback } from 'react';
import type { Staff } from '../../../types/staff/staff';
import type { Severity } from '../types/admin.types';

interface UseStaffManagementProps {
  onAddStaff: (staffData: Partial<Staff>) => void;
  onEditStaff: (staffData: Partial<Staff>) => void;
  onDeleteStaff: (staffId: string) => void;
  showSnackbar: (message: string, severity: Severity) => void;
}

interface UseStaffManagementReturn {
  isFormOpen: boolean;
  editingStaff: Staff | null;
  handleOpenAddForm: () => void;
  handleOpenEditForm: (staff: Staff) => void;
  handleCloseForm: () => void;
  handleSubmitForm: (staffData: Partial<Staff>) => void;
  handleDelete: (staffId: string, staffName: string) => void;
}

export const useStaffManagement = ({
  onAddStaff,
  onEditStaff,
  onDeleteStaff,
  showSnackbar
}: UseStaffManagementProps): UseStaffManagementReturn => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);

  const handleOpenAddForm = useCallback(() => {
    setEditingStaff(null);
    setIsFormOpen(true);
  }, []);

  const handleOpenEditForm = useCallback((staff: Staff) => {
    setEditingStaff(staff);
    setIsFormOpen(true);
  }, []);

  const handleCloseForm = useCallback(() => {
    setIsFormOpen(false);
    setEditingStaff(null);
  }, []);

  const handleSubmitForm = useCallback((staffData: Partial<Staff>) => {
    if (editingStaff?.id) {
      onEditStaff({ ...staffData, id: editingStaff.id });
      showSnackbar(`Đã cập nhật thông tin nhân viên ${staffData.name}`, 'success');
    } else {
      onAddStaff(staffData);
      showSnackbar(`Đã thêm nhân viên ${staffData.name}`, 'success');
    }
    handleCloseForm();
  }, [editingStaff, onAddStaff, onEditStaff, showSnackbar]);

  const handleDelete = useCallback((staffId: string, staffName: string) => {
    onDeleteStaff(staffId);
    showSnackbar(`Đã xóa nhân viên ${staffName}`, 'info');
  }, [onDeleteStaff, showSnackbar]);

  return {
    isFormOpen,
    editingStaff,
    handleOpenAddForm,
    handleOpenEditForm,
    handleCloseForm,
    handleSubmitForm,
    handleDelete
  };
}; 