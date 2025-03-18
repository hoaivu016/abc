import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField, 
  Grid, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Typography,
  Box,
  InputAdornment,
  FormHelperText,
  SelectChangeEvent
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import viLocale from 'date-fns/locale/vi';
import { 
  Staff, 
  StaffTeam, 
  StaffRole, 
  StaffStatus
} from '../../../../types/staff/staff';
import { formatCurrency, formatNumber } from '../../../../utils/formatters';

// Định nghĩa props cho component
interface StaffFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (staffData: Partial<Staff>) => void;
  staff: Staff | null;
}

// Component form thêm/sửa nhân viên
const StaffForm: React.FC<StaffFormProps> = ({ 
  open, 
  onClose, 
  onSave, 
  staff 
}) => {
  // State cho dữ liệu form
  const [formData, setFormData] = useState<Partial<Staff>>({
    name: '',
    phone: '',
    email: '',
    address: '',
    team: StaffTeam.SALES_1,
    role: StaffRole.STAFF,
    status: StaffStatus.ACTIVE,
    joinDate: new Date(),
    terminationDate: undefined,
    salary: 0,
    commissionRate: 0,
    vehiclesSold: 0,
    totalCommission: 0,
    note: ''
  });

  // State cho lỗi validation
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Cập nhật dữ liệu form khi có initialData
  useEffect(() => {
    if (staff) {
      setFormData(prevData => ({
        ...prevData,
        ...staff
      }));
    }
  }, [staff]);

  // Xử lý thay đổi input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Xóa lỗi khi người dùng sửa
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Xử lý thay đổi select
  const handleSelectChange = (e: SelectChangeEvent) => {
    const name = e.target.name as string;
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Xử lý thay đổi ngày
  const handleDateChange = (name: string, date: Date | null) => {
    setFormData(prev => ({
      ...prev,
      [name]: date
    }));
  };

  // Xử lý thay đổi số
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = value === '' ? 0 : parseFloat(value.replace(/[,.]/g, ''));
    
    setFormData(prev => ({
      ...prev,
      [name]: numValue
    }));
  };

  // Validate form trước khi submit
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Vui lòng nhập họ tên';
    }

    if (!formData.phone?.trim()) {
      newErrors.phone = 'Vui lòng nhập số điện thoại';
    } else if (!/^[0-9]{10,11}$/.test(formData.phone)) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!formData.address?.trim()) {
      newErrors.address = 'Vui lòng nhập địa chỉ';
    }

    if (!formData.joinDate) {
      newErrors.joinDate = 'Vui lòng chọn ngày vào làm';
    }

    if (formData.status === StaffStatus.TERMINATED && !formData.terminationDate) {
      newErrors.terminationDate = 'Vui lòng chọn ngày nghỉ việc';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Xử lý submit form
  const handleSubmit = () => {
    if (validateForm()) {
      onSave(formData);
    }
  };

  // Xử lý đóng form
  const handleClose = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      address: '',
      team: StaffTeam.SALES_1,
      role: StaffRole.STAFF,
      status: StaffStatus.ACTIVE,
      joinDate: new Date(),
      terminationDate: undefined,
      salary: 0,
      commissionRate: 0,
      vehiclesSold: 0,
      totalCommission: 0,
      note: ''
    });
    setErrors({});
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        {staff?.id ? 'Chỉnh Sửa Nhân Viên' : 'Thêm Nhân Viên Mới'}
      </DialogTitle>
      <DialogContent dividers>
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={viLocale}>
          <Grid container spacing={2}>
            {/* Thông tin cơ bản */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Thông tin cơ bản
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                name="name"
                label="Họ tên"
                fullWidth
                value={formData.name || ''}
                onChange={handleChange}
                error={!!errors.name}
                helperText={errors.name}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                name="phone"
                label="Số điện thoại"
                fullWidth
                value={formData.phone || ''}
                onChange={handleChange}
                error={!!errors.phone}
                helperText={errors.phone}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                name="email"
                label="Email"
                fullWidth
                value={formData.email || ''}
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                name="address"
                label="Địa chỉ"
                fullWidth
                value={formData.address || ''}
                onChange={handleChange}
                error={!!errors.address}
                helperText={errors.address}
                required
              />
            </Grid>

            {/* Thông tin công việc */}
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Thông tin công việc
              </Typography>
            </Grid>

            <Grid item xs={12} sm={4}>
              <FormControl fullWidth error={!!errors.team}>
                <InputLabel id="team-label">Phòng ban</InputLabel>
                <Select
                  labelId="team-label"
                  id="team"
                  name="team"
                  value={formData.team}
                  onChange={handleSelectChange}
                  label="Phòng ban"
                  required
                >
                  <MenuItem value={StaffTeam.SALES_1}>{StaffTeam.SALES_1}</MenuItem>
                  <MenuItem value={StaffTeam.SALES_2}>{StaffTeam.SALES_2}</MenuItem>
                  <MenuItem value={StaffTeam.SALES_3}>{StaffTeam.SALES_3}</MenuItem>
                  <MenuItem value={StaffTeam.ACCOUNTING}>{StaffTeam.ACCOUNTING}</MenuItem>
                  <MenuItem value={StaffTeam.MARKETING}>{StaffTeam.MARKETING}</MenuItem>
                  <MenuItem value={StaffTeam.MANAGEMENT}>{StaffTeam.MANAGEMENT}</MenuItem>
                  <MenuItem value={StaffTeam.OTHER}>{StaffTeam.OTHER}</MenuItem>
                </Select>
                {errors.team && <FormHelperText>{errors.team}</FormHelperText>}
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="role-label">Vai trò</InputLabel>
                <Select
                  labelId="role-label"
                  name="role"
                  value={formData.role || StaffRole.STAFF}
                  onChange={handleSelectChange}
                  label="Vai trò"
                >
                  {Object.values(StaffRole).map((role) => (
                    <MenuItem key={role} value={role}>
                      {role}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="status-label">Trạng thái</InputLabel>
                <Select
                  labelId="status-label"
                  name="status"
                  value={formData.status || StaffStatus.ACTIVE}
                  onChange={handleSelectChange}
                  label="Trạng thái"
                >
                  {Object.values(StaffStatus).map((status) => (
                    <MenuItem key={status} value={status}>
                      {status}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <DatePicker
                label="Ngày vào làm"
                value={formData.joinDate ? new Date(formData.joinDate) : null}
                onChange={(date) => handleDateChange('joinDate', date)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!errors.joinDate,
                    helperText: errors.joinDate,
                    required: true
                  }
                }}
              />
            </Grid>

            {formData.status === StaffStatus.TERMINATED && (
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Ngày nghỉ việc"
                  value={formData.terminationDate ? new Date(formData.terminationDate) : null}
                  onChange={(date) => handleDateChange('terminationDate', date)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!errors.terminationDate,
                      helperText: errors.terminationDate,
                      required: formData.status === StaffStatus.TERMINATED
                    }
                  }}
                />
              </Grid>
            )}

            <Grid item xs={12} md={6}>
              <TextField
                name="salary"
                label="Lương cơ bản (VNĐ)"
                fullWidth
                value={formData.salary !== undefined ? formatNumber(formData.salary) : '0'}
                onChange={handleNumberChange}
                InputProps={{
                  endAdornment: <InputAdornment position="end">VNĐ</InputAdornment>,
                }}
              />
            </Grid>

            {/* Ghi chú */}
            <Grid item xs={12} sx={{ mt: 2 }}>
              <TextField
                name="note"
                label="Ghi chú"
                fullWidth
                multiline
                rows={3}
                value={formData.note || ''}
                onChange={handleChange}
              />
            </Grid>
          </Grid>
        </LocalizationProvider>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Hủy bỏ</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary"
        >
          {staff?.id ? 'Cập nhật' : 'Thêm mới'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StaffForm; 