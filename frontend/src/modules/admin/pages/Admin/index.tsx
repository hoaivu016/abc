import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  CircularProgress,
  Container,
  Alert,
  Snackbar,
  Grid,
  Paper,
  Divider
} from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../../store';
import { getAllStaff, addStaff, updateStaff, deleteStaff } from '../../../../store/slices/staffSlice';
import StaffList from '../../components/StaffList';
import StaffForm from '../../components/StaffForm';
import { getAllVehicles } from '../../../../store/slices/vehicleSlice';
import { Staff } from '../../../../types/staff/staff';
import { AppDispatch } from '../../../../store';

type Severity = 'success' | 'info' | 'warning' | 'error';

interface SnackbarState {
  open: boolean;
  message: string;
  severity: Severity;
}

const AdminPage: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentStaff, setCurrentStaff] = useState<Staff | null>(null);
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'success'
  });
  
  const dispatch = useDispatch<AppDispatch>();
  
  const { staffList, loading: staffLoading, error: staffError } = useSelector((state: RootState) => state.staff);
  const { vehicles, loading: vehiclesLoading } = useSelector((state: RootState) => state.vehicles);

  useEffect(() => {
    dispatch(getAllStaff());
    dispatch(getAllVehicles());
  }, [dispatch]);

  const handleAddStaff = () => {
    setCurrentStaff(null);
    setIsFormOpen(true);
  };

  const handleEditStaff = (staff: Staff) => {
    setCurrentStaff(staff);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
  };

  const handleSaveStaff = async (staffData: Partial<Staff>) => {
    try {
      if (currentStaff) {
        await dispatch(updateStaff({
          ...currentStaff,
          ...staffData
        }));
        setSnackbar({
          open: true,
          message: 'Cập nhật thông tin nhân viên thành công',
          severity: 'success'
        });
      } else {
        await dispatch(addStaff(staffData as Staff));
        setSnackbar({
          open: true,
          message: 'Thêm nhân viên mới thành công',
          severity: 'success'
        });
      }
      setIsFormOpen(false);
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Đã xảy ra lỗi: ' + (error as Error).message,
        severity: 'error'
      });
    }
  };

  const handleDeleteStaff = async (staffId: string) => {
    try {
      await dispatch(deleteStaff(staffId));
      setSnackbar({
        open: true,
        message: 'Xóa nhân viên thành công',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Đã xảy ra lỗi khi xóa nhân viên: ' + (error as Error).message,
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({
      ...prev,
      open: false
    }));
  };

  if (staffLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl">
      {staffError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {staffError}
        </Alert>
      )}

      <Box sx={{ mb: 4 }}>
        <StaffList 
          staffList={staffList} 
          onEdit={handleEditStaff} 
          onDelete={handleDeleteStaff}
          vehicles={vehicles}
          onAdd={handleAddStaff}
        />
      </Box>

      <Divider sx={{ my: 4 }} />

      <Typography variant="h5" sx={{ mb: 3 }}>Tính năng quản trị khác</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} lg={6}>
          <Paper 
            sx={{ 
              p: 3,
              height: '100%',
              backgroundColor: 'background.default'
            }}
          >
            <Typography variant="h6" gutterBottom>
              Cấu hình hệ thống
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Tính năng đang phát triển...
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} lg={6}>
          <Paper 
            sx={{ 
              p: 3,
              height: '100%',
              backgroundColor: 'background.default'
            }}
          >
            <Typography variant="h6" gutterBottom>
              Phân quyền người dùng
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Tính năng đang phát triển...
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} lg={6}>
          <Paper 
            sx={{ 
              p: 3,
              height: '100%',
              backgroundColor: 'background.default'
            }}
          >
            <Typography variant="h6" gutterBottom>
              KPI & Thưởng
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Tính năng đang phát triển...
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} lg={6}>
          <Paper 
            sx={{ 
              p: 3,
              height: '100%',
              backgroundColor: 'background.default'
            }}
          >
            <Typography variant="h6" gutterBottom>
              Báo cáo quản trị
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Tính năng đang phát triển...
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {isFormOpen && (
        <StaffForm
          open={isFormOpen}
          staff={currentStaff}
          onClose={handleCloseForm}
          onSave={handleSaveStaff}
        />
      )}

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AdminPage; 