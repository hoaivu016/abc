import React, { useCallback, useMemo } from 'react';
import { Grid } from '@mui/material';
import AdminCard from '../shared/AdminCard';
import StaffList from '../StaffList';
import StaffForm from '../StaffForm';
import { useStaffManagement } from '../../hooks/useStaffManagement';
import type { StaffTabProps } from '../../types/admin.types';
import type { Staff } from '../../../../types/staff/staff';

const StaffTab: React.FC<StaffTabProps> = React.memo(({
  staffList,
  vehicles,
  onAddStaff,
  onEditStaff,
  onDeleteStaff,
  showSnackbar
}) => {
  const {
    isFormOpen,
    editingStaff,
    handleOpenAddForm,
    handleOpenEditForm,
    handleCloseForm,
    handleSubmitForm,
    handleDelete
  } = useStaffManagement({
    onAddStaff,
    onEditStaff,
    onDeleteStaff,
    showSnackbar
  });

  const handleStaffDelete = useCallback((staffId: string) => {
    const staff = staffList.find(s => s.id === staffId);
    if (staff) {
      handleDelete(staffId, staff.name);
    }
  }, [staffList, handleDelete]);

  const memoizedStaffList = useMemo(() => (
    <StaffList
      staffList={staffList}
      vehicles={vehicles}
      onEdit={handleOpenEditForm}
      onDelete={handleStaffDelete}
      onAdd={handleOpenAddForm}
    />
  ), [staffList, vehicles, handleOpenEditForm, handleStaffDelete, handleOpenAddForm]);

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        {memoizedStaffList}
      </Grid>

      {isFormOpen && (
        <StaffForm
          open={isFormOpen}
          onClose={handleCloseForm}
          onSave={handleSubmitForm}
          staff={editingStaff}
        />
      )}
    </Grid>
  );
});

StaffTab.displayName = 'StaffTab';

export default StaffTab; 