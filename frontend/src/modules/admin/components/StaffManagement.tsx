import React, { useState } from 'react';
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography
} from '@mui/material';
import { Staff, StaffTeam, StaffRole, StaffStatus } from '../../../types/staff/staff';
import type { Vehicle } from '../../../types/vehicles/vehicle';

interface StaffManagementProps {
  staffList: Staff[];
  vehicles: Vehicle[];
  onAddStaff: (staffData: Partial<Staff>) => void;
  onEditStaff: (staffData: Partial<Staff>) => void;
  onDeleteStaff: (staffId: string) => void;
  onOpenVehicleList: () => void;
}

const StaffManagement: React.FC<StaffManagementProps> = ({
  staffList,
  vehicles,
  onAddStaff,
  onEditStaff,
  onDeleteStaff,
  onOpenVehicleList
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [formData, setFormData] = useState<Partial<Staff>>({
    name: '',
    phone: '',
    email: '',
    team: StaffTeam.SALES_1,
    role: StaffRole.STAFF,
    status: StaffStatus.ACTIVE,
    joinDate: new Date(),
    salary: 0,
    commissionRate: 0
  });

  const handleOpenDialog = (staff?: Staff) => {
    if (staff) {
      setEditingStaff(staff);
      setFormData(staff);
    } else {
      setEditingStaff(null);
      setFormData({
        name: '',
        phone: '',
        email: '',
        team: StaffTeam.SALES_1,
        role: StaffRole.STAFF,
        status: StaffStatus.ACTIVE,
        joinDate: new Date(),
        salary: 0,
        commissionRate: 0
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingStaff(null);
  };

  const handleSubmit = () => {
    if (editingStaff) {
      onEditStaff({ ...editingStaff, ...formData });
    } else {
      onAddStaff(formData);
    }
    handleCloseDialog();
  };

  const handleDelete = (staffId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa nhân viên này?')) {
      onDeleteStaff(staffId);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5">Quản Lý Nhân Sự</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleOpenDialog()}
        >
          Thêm Nhân Viên
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Tên</TableCell>
              <TableCell>Số Điện Thoại</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Đội</TableCell>
              <TableCell>Vai Trò</TableCell>
              <TableCell>Trạng Thái</TableCell>
              <TableCell>Hành Động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {staffList.map((staff) => (
              <TableRow key={staff.id}>
                <TableCell>{staff.name}</TableCell>
                <TableCell>{staff.phone}</TableCell>
                <TableCell>{staff.email}</TableCell>
                <TableCell>{staff.team}</TableCell>
                <TableCell>{staff.role}</TableCell>
                <TableCell>{staff.status}</TableCell>
                <TableCell>
                  <Button
                    color="primary"
                    onClick={() => handleOpenDialog(staff)}
                    sx={{ mr: 1 }}
                  >
                    Sửa
                  </Button>
                  <Button
                    color="error"
                    onClick={() => handleDelete(staff.id)}
                  >
                    Xóa
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={isDialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingStaff ? 'Chỉnh Sửa Nhân Viên' : 'Thêm Nhân Viên Mới'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Tên"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
            />
            <TextField
              label="Số Điện Thoại"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              fullWidth
            />
            <TextField
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Đội</InputLabel>
              <Select
                value={formData.team}
                label="Đội"
                onChange={(e) => setFormData({ ...formData, team: e.target.value as StaffTeam })}
              >
                {Object.values(StaffTeam).map((team) => (
                  <MenuItem key={team} value={team}>{team}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Vai Trò</InputLabel>
              <Select
                value={formData.role}
                label="Vai Trò"
                onChange={(e) => setFormData({ ...formData, role: e.target.value as StaffRole })}
              >
                {Object.values(StaffRole).map((role) => (
                  <MenuItem key={role} value={role}>{role}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Trạng Thái</InputLabel>
              <Select
                value={formData.status}
                label="Trạng Thái"
                onChange={(e) => setFormData({ ...formData, status: e.target.value as StaffStatus })}
              >
                {Object.values(StaffStatus).map((status) => (
                  <MenuItem key={status} value={status}>{status}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Lương Cơ Bản"
              type="number"
              value={formData.salary}
              onChange={(e) => setFormData({ ...formData, salary: Number(e.target.value) })}
              fullWidth
            />
            <TextField
              label="Tỷ Lệ Hoa Hồng (%)"
              type="number"
              value={formData.commissionRate}
              onChange={(e) => setFormData({ ...formData, commissionRate: Number(e.target.value) })}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="secondary">
            Hủy
          </Button>
          <Button onClick={handleSubmit} color="primary" variant="contained">
            {editingStaff ? 'Cập Nhật' : 'Thêm'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StaffManagement; 