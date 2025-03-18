import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField, 
  MenuItem,
  Grid,
  Typography,
  Paper,
  Alert,
  FormControl,
  InputLabel,
  Select,
  FormHelperText
} from '@mui/material';
import { 
  Vehicle, 
  VehicleStatus, 
  canChangeStatus, 
  createStatusHistory,
  PaymentInfo,
  calculateDebtOnStatusChange,
  getPaymentType
} from '../../../../types/vehicles/vehicle';
import { formatNumber, parseFormattedNumber, formatCurrency } from '../../../../utils/formatters';
import { Staff, StaffTeam, StaffStatus } from '../../../../types/staff/staff';

interface StatusChangeModalProps {
  open: boolean;
  vehicle: Vehicle;
  onClose: () => void;
  onStatusChange: (updatedVehicle: Vehicle) => void;
  staffList: Staff[];
}

const StatusChangeModal = ({ 
  open, 
  vehicle, 
  onClose,
  onStatusChange,
  staffList
}: StatusChangeModalProps) => {
  const [newStatus, setNewStatus] = useState(vehicle.status as VehicleStatus);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentNotes, setPaymentNotes] = useState('');
  const [validationError, setValidationError] = useState(null as string | null);
  const [previewDebt, setPreviewDebt] = useState(null as number | null);
  const [selectedStaffId, setSelectedStaffId] = useState('');

  useEffect(() => {
    if (open && vehicle) {
      setNewStatus(vehicle.status);
      
      if (vehicle.saleStaff && vehicle.saleStaff.id) {
        const staffExists = staffList.some(staff => 
          staff.id === vehicle.saleStaff.id && 
          staff.status === StaffStatus.ACTIVE
        );
        
        if (staffExists) {
          setSelectedStaffId(vehicle.saleStaff.id);
        }
      }
    }
  }, [open, vehicle, staffList]);

  useEffect(() => {
    if (vehicle && newStatus) {
      const estimatedDebt = calculateDebtOnStatusChange(vehicle, newStatus, paymentAmount);
      setPreviewDebt(estimatedDebt);
    }
  }, [vehicle, newStatus, paymentAmount]);

  useEffect(() => {
    if (newStatus === VehicleStatus.IN_STOCK) {
      setSelectedStaffId('');
    }
  }, [newStatus]);

  const handleSave = () => {
    if (!canChangeStatus(vehicle.status, newStatus)) {
      setValidationError(`Không thể chuyển từ ${vehicle.status} sang ${newStatus}`);
      return;
    }

    if (requiredPaymentStatuses.includes(newStatus) && paymentAmount <= 0) {
      setValidationError(`Trạng thái ${newStatus} yêu cầu nhập số tiền thanh toán`);
      return;
    }

    if (vehicle.status === VehicleStatus.IN_STOCK && statusRequiresSaleStaff.includes(newStatus) && !selectedStaffId) {
      setValidationError(`Vui lòng chọn nhân viên bán hàng khi chuyển sang trạng thái ${newStatus}`);
      return;
    }

    if (hiddenPaymentStatuses.includes(newStatus)) {
      setPaymentAmount(0);
    }

    const updatedVehicle = { ...vehicle };
    
    if (newStatus === VehicleStatus.IN_STOCK) {
      updatedVehicle.payments = [];
      updatedVehicle.saleStaff = {
        id: '',
        name: '',
        team: '',
        expectedCommission: 0
      };
      console.log('Đã xóa toàn bộ thanh toán khi chuyển về trạng thái Trong kho');
    } else {
      if (paymentAmount > 0) {
        const paymentType = getPaymentType(vehicle.status, newStatus);
        const newPayment: PaymentInfo = {
          id: `PAYMENT_${Date.now()}`,
          amount: paymentAmount,
          date: new Date(),
          type: paymentType,
          notes: paymentNotes || `Thanh toán khi chuyển từ ${vehicle.status} sang ${newStatus}`
        };
        
        updatedVehicle.payments = [...vehicle.payments, newPayment];
      }

      if (vehicle.status === VehicleStatus.IN_STOCK && statusRequiresSaleStaff.includes(newStatus) && selectedStaffId) {
        const selectedStaff = staffList.find(staff => staff.id === selectedStaffId);
        if (selectedStaff) {
          updatedVehicle.saleStaff = {
            id: selectedStaff.id,
            name: selectedStaff.name,
            team: selectedStaff.team,
            expectedCommission: (updatedVehicle.sellPrice * selectedStaff.commissionRate) / 100
          };
        }
      }
    }
    
    const statusHistoryEntry = {
      id: `STATUS_${Date.now()}`,
      fromStatus: vehicle.status,
      toStatus: newStatus,
      changedAt: new Date(),
      changedBy: 'User',
      notes: paymentNotes
    };
    
    updatedVehicle.statusHistory = [...vehicle.statusHistory, statusHistoryEntry];
    
    updatedVehicle.status = newStatus;
    
    if (newStatus === VehicleStatus.SOLD || newStatus === VehicleStatus.OFFSET) {
      updatedVehicle.exportDate = new Date();
      console.log(`Đã cập nhật ngày xuất kho: ${updatedVehicle.exportDate}`);
      
      if (newStatus === VehicleStatus.SOLD && vehicle.debt > 0) {
        const finalPayment: PaymentInfo = {
          id: `PAYMENT_FINAL_${Date.now()}`,
          amount: vehicle.debt,
          date: new Date(),
          type: 'FULL_PAYMENT',
          notes: paymentNotes || `Thanh toán đầy đủ khi chuyển sang trạng thái Đã bán`
        };
        
        updatedVehicle.payments = [...updatedVehicle.payments, finalPayment];
        console.log(`Đã tạo khoản thanh toán cuối cùng để xóa công nợ: ${formatCurrency(vehicle.debt)}`);
      }
    }
    
    if (newStatus === VehicleStatus.IN_STOCK && updatedVehicle.exportDate) {
      updatedVehicle.exportDate = undefined;
      console.log('Đã xóa ngày xuất kho khi chuyển về trạng thái Trong kho');
    }
    
    updatedVehicle.debt = calculateDebtOnStatusChange(vehicle, newStatus, paymentAmount);

    if (newStatus === VehicleStatus.SOLD) {
      updatedVehicle.debt = 0;
      
      console.log('Cập nhật trạng thái xe sang SOLD:', {
        vehicleId: updatedVehicle.id,
        oldDebt: vehicle.debt,
        newDebt: updatedVehicle.debt,
        paymentsMade: updatedVehicle.payments.length
      });
    }
    
    console.log('Status Change Update:', {
      from: vehicle.status,
      to: newStatus,
      paymentAmount,
      debt: updatedVehicle.debt,
      payments: updatedVehicle.payments,
      exportDate: updatedVehicle.exportDate,
      saleStaff: updatedVehicle.saleStaff
    });
    
    onStatusChange(updatedVehicle);
    resetForm();
    onClose();
  };

  const getAvailableStatuses = (): VehicleStatus[] => {
    return Object.values(VehicleStatus)
      .filter(status => canChangeStatus(vehicle.status, status));
  };

  const requiredPaymentStatuses = [
    VehicleStatus.DEPOSITED, 
    VehicleStatus.BANK_DEPOSITED, 
    VehicleStatus.OFFSET
  ];

  const statusRequiresSaleStaff = [
    VehicleStatus.DEPOSITED,
    VehicleStatus.BANK_DEPOSITED,
    VehicleStatus.SOLD
  ];

  const hiddenPaymentStatuses = [
    VehicleStatus.IN_STOCK, 
    VehicleStatus.SOLD
  ];

  const needConfirmDelivery = newStatus === VehicleStatus.SOLD || newStatus === VehicleStatus.OFFSET;
  
  const isReturningToStock = newStatus === VehicleStatus.IN_STOCK;

  const activeSalesStaff = React.useMemo(() => {
    return staffList.filter(
      (staff) =>
        (staff.team === StaffTeam.SALES_1 || 
         staff.team === StaffTeam.SALES_2 || 
         staff.team === StaffTeam.SALES_3) &&
        staff.status === StaffStatus.ACTIVE
    );
  }, [staffList]);

  const resetForm = () => {
    setNewStatus(vehicle.status);
    setPaymentAmount(0);
    setPaymentNotes('');
    setValidationError(null);
    setSelectedStaffId('');
  };

  const calculateTotalPaid = () => {
    const totalPaid = vehicle.payments.reduce((sum, p) => sum + p.amount, 0);
    return totalPaid + (paymentAmount > 0 ? paymentAmount : 0);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Thay Đổi Trạng Thái Xe</DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="body1">
              Xe hiện tại: {vehicle.name} - Trạng thái: {vehicle.status}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              select
              label="Trạng Thái Mới"
              value={newStatus}
              onChange={(e) => {
                const newStatusValue = e.target.value as VehicleStatus;
                setNewStatus(newStatusValue);
                setPaymentAmount(0);
                setPaymentNotes('');
                
                if (newStatusValue === VehicleStatus.IN_STOCK) {
                  setSelectedStaffId('');
                }
              }}
            >
              {getAvailableStatuses().map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {statusRequiresSaleStaff.includes(newStatus) && vehicle.status === VehicleStatus.IN_STOCK && (
            <Grid item xs={12}>
              <FormControl fullWidth error={statusRequiresSaleStaff.includes(newStatus) && !selectedStaffId}>
                <InputLabel id="sale-staff-label">Nhân viên bán hàng</InputLabel>
                <Select
                  labelId="sale-staff-label"
                  value={selectedStaffId}
                  onChange={(e) => setSelectedStaffId(e.target.value)}
                  label="Nhân viên bán hàng"
                  required
                >
                  {activeSalesStaff.map((staff) => (
                    <MenuItem key={staff.id} value={staff.id}>
                      {staff.name} ({staff.id})
                    </MenuItem>
                  ))}
                </Select>
                {statusRequiresSaleStaff.includes(newStatus) && !selectedStaffId && (
                  <FormHelperText>Vui lòng chọn nhân viên bán hàng</FormHelperText>
                )}
              </FormControl>
            </Grid>
          )}

          {!hiddenPaymentStatuses.includes(newStatus) && (
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Số Tiền Thanh Toán"
                type="text"
                required={requiredPaymentStatuses.includes(newStatus)}
                value={formatNumber(paymentAmount)}
                onChange={(e) => {
                  const value = parseFormattedNumber(e.target.value);
                  setPaymentAmount(value);
                }}
                InputProps={{
                  inputProps: { 
                    min: 0,
                    style: { textAlign: 'right' }
                  }
                }}
                error={requiredPaymentStatuses.includes(newStatus) && paymentAmount <= 0}
                helperText={
                  requiredPaymentStatuses.includes(newStatus) && paymentAmount <= 0
                    ? 'Vui lòng nhập số tiền thanh toán'
                    : ''
                }
              />
            </Grid>
          )}

          {!hiddenPaymentStatuses.includes(newStatus) && (
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Ghi Chú Thanh Toán"
                multiline
                rows={3}
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
              />
            </Grid>
          )}

          {needConfirmDelivery && (
            <Grid item xs={12}>
              <Alert severity="info">
                {newStatus === VehicleStatus.SOLD 
                  ? 'Xác nhận giao xe cho khách hàng. Ngày xuất kho sẽ được cập nhật tự động. Công nợ sẽ được reset về 0.'
                  : 'Xác nhận chuyển trạng thái sang đóng đối ứng. Ngày xuất kho sẽ được cập nhật tự động.'}
              </Alert>
            </Grid>
          )}

          {isReturningToStock && (
            <Grid item xs={12}>
              <Alert severity="warning">
                Cảnh báo: Khi chuyển về trạng thái Trong kho, tất cả thông tin thanh toán và ngày xuất kho sẽ bị xóa.
              </Alert>
            </Grid>
          )}

          <Grid item xs={12} sx={{ mt: 2 }}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Thông tin giao dịch
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2">Giá nhập: {formatCurrency(vehicle.purchasePrice)}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">Giá bán: {formatCurrency(vehicle.sellPrice)}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">Tổng đã thanh toán: {formatCurrency(calculateTotalPaid())}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    Công nợ sau khi thay đổi: 
                    {previewDebt !== null ? formatCurrency(previewDebt) : 'Đang tính...'}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {validationError && (
            <Grid item xs={12}>
              <Alert severity="error">{validationError}</Alert>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          Lưu Thay Đổi
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StatusChangeModal; 