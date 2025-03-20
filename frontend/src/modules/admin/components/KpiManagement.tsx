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
import { KpiTarget } from '../../../models/kpi';

interface KpiManagementProps {
  kpiList: KpiTarget[];
  onSaveKpi: (kpiTargets: KpiTarget[]) => void;
  selectedMonth: number;
  selectedYear: number;
  onDateChange: (month: number, year: number) => void;
}

const KpiManagement: React.FC<KpiManagementProps> = ({
  kpiList,
  onSaveKpi,
  selectedMonth,
  selectedYear,
  onDateChange
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingKpi, setEditingKpi] = useState<KpiTarget | null>(null);
  const [formData, setFormData] = useState<Partial<KpiTarget>>({
    targetMonth: selectedMonth,
    targetYear: selectedYear,
    salesTarget: 0,
    profitTarget: 0,
    notes: ''
  });

  const handleOpenDialog = (kpi?: KpiTarget) => {
    if (kpi) {
      setEditingKpi(kpi);
      setFormData(kpi);
    } else {
      setEditingKpi(null);
      setFormData({
        targetMonth: selectedMonth,
        targetYear: selectedYear,
        salesTarget: 0,
        profitTarget: 0,
        notes: ''
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingKpi(null);
  };

  const handleSubmit = () => {
    const updatedKpiList = editingKpi
      ? kpiList.map(k => (k.id === editingKpi.id ? { ...k, ...formData } : k))
      : [...kpiList, { ...formData as KpiTarget, id: `KPI_${Date.now()}` }];

    onSaveKpi(updatedKpiList);
    handleCloseDialog();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5">Quản Lý KPI</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleOpenDialog()}
        >
          Thêm KPI Mới
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Tháng</TableCell>
              <TableCell>Năm</TableCell>
              <TableCell>Mục Tiêu Doanh Số</TableCell>
              <TableCell>Mục Tiêu Lợi Nhuận</TableCell>
              <TableCell>Ghi Chú</TableCell>
              <TableCell>Hành Động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {kpiList.map((kpi) => (
              <TableRow key={kpi.id}>
                <TableCell>{kpi.targetMonth}</TableCell>
                <TableCell>{kpi.targetYear}</TableCell>
                <TableCell>{kpi.salesTarget.toLocaleString()} VNĐ</TableCell>
                <TableCell>{kpi.profitTarget.toLocaleString()} VNĐ</TableCell>
                <TableCell>{kpi.notes}</TableCell>
                <TableCell>
                  <Button
                    color="primary"
                    onClick={() => handleOpenDialog(kpi)}
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
          {editingKpi ? 'Chỉnh Sửa KPI' : 'Thêm KPI Mới'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Tháng"
              type="number"
              value={formData.targetMonth}
              onChange={(e) => setFormData({ ...formData, targetMonth: Number(e.target.value) })}
              inputProps={{ min: 1, max: 12 }}
              fullWidth
            />
            <TextField
              label="Năm"
              type="number"
              value={formData.targetYear}
              onChange={(e) => setFormData({ ...formData, targetYear: Number(e.target.value) })}
              fullWidth
            />
            <TextField
              label="Mục Tiêu Doanh Số"
              type="number"
              value={formData.salesTarget}
              onChange={(e) => setFormData({ ...formData, salesTarget: Number(e.target.value) })}
              fullWidth
            />
            <TextField
              label="Mục Tiêu Lợi Nhuận"
              type="number"
              value={formData.profitTarget}
              onChange={(e) => setFormData({ ...formData, profitTarget: Number(e.target.value) })}
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
            {editingKpi ? 'Cập Nhật' : 'Thêm'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default KpiManagement; 