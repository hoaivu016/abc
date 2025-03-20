import React, { useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { SupportDepartmentBonus } from '../../../models/kpi';

interface SupportBonusManagementProps {
  supportBonusList: SupportDepartmentBonus[];
  onSaveSupportBonus: (bonuses: SupportDepartmentBonus[]) => void;
  selectedMonth: number;
  selectedYear: number;
  onDateChange: (month: number, year: number) => void;
}

const SupportBonusManagement: React.FC<SupportBonusManagementProps> = ({
  supportBonusList,
  onSaveSupportBonus,
  selectedMonth,
  selectedYear,
  onDateChange
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBonus, setEditingBonus] = useState<SupportDepartmentBonus | null>(null);
  const [formData, setFormData] = useState<Partial<SupportDepartmentBonus>>({
    department: '',
    bonusMonth: new Date(selectedYear, selectedMonth - 1),
    bonusAmount: 0,
    achievementRate: 0,
    notes: ''
  });

  const handleOpenDialog = (bonus?: SupportDepartmentBonus) => {
    if (bonus) {
      setEditingBonus(bonus);
      setFormData(bonus);
    } else {
      setEditingBonus(null);
      setFormData({
        department: '',
        bonusMonth: new Date(selectedYear, selectedMonth - 1),
        bonusAmount: 0,
        achievementRate: 0,
        notes: ''
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingBonus(null);
  };

  const handleSubmit = () => {
    const updatedBonusList = editingBonus
      ? supportBonusList.map(b => (b.id === editingBonus.id ? { ...b, ...formData } : b))
      : [...supportBonusList, { ...formData as SupportDepartmentBonus, id: `BONUS_${Date.now()}` }];

    onSaveSupportBonus(updatedBonusList);
    handleCloseDialog();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5">Quản Lý Thưởng Phòng Ban Hỗ Trợ</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleOpenDialog()}
        >
          Thêm Thưởng Mới
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Phòng Ban</TableCell>
              <TableCell>Tháng</TableCell>
              <TableCell>Số Tiền Thưởng</TableCell>
              <TableCell>Tỷ Lệ Hoàn Thành (%)</TableCell>
              <TableCell>Ghi Chú</TableCell>
              <TableCell>Hành Động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {supportBonusList.map((bonus) => (
              <TableRow key={bonus.id}>
                <TableCell>{bonus.department}</TableCell>
                <TableCell>
                  {bonus.bonusMonth instanceof Date 
                    ? bonus.bonusMonth.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })
                    : new Date(bonus.bonusMonth).toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}
                </TableCell>
                <TableCell>{bonus.bonusAmount.toLocaleString()} VNĐ</TableCell>
                <TableCell>{bonus.achievementRate}%</TableCell>
                <TableCell>{bonus.notes}</TableCell>
                <TableCell>
                  <Button
                    color="primary"
                    onClick={() => handleOpenDialog(bonus)}
                  >
                    Sửa
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={isDialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingBonus ? 'Chỉnh Sửa Thưởng' : 'Thêm Thưởng Mới'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Phòng Ban"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              fullWidth
            />
            <TextField
              label="Số Tiền Thưởng"
              type="number"
              value={formData.bonusAmount}
              onChange={(e) => setFormData({ ...formData, bonusAmount: Number(e.target.value) })}
              fullWidth
            />
            <TextField
              label="Tỷ Lệ Hoàn Thành (%)"
              type="number"
              value={formData.achievementRate}
              onChange={(e) => setFormData({ ...formData, achievementRate: Number(e.target.value) })}
              inputProps={{ min: 0, max: 100 }}
              fullWidth
            />
            <TextField
              label="Ghi Chú"
              multiline
              rows={4}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="secondary">
            Hủy
          </Button>
          <Button onClick={handleSubmit} color="primary" variant="contained">
            {editingBonus ? 'Cập Nhật' : 'Thêm'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SupportBonusManagement;