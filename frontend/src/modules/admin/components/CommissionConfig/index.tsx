import React, { useState, useEffect, SyntheticEvent } from 'react';
import { 
  Box, 
  Typography, 
  Tabs, 
  Tab, 
  Paper, 
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  InputAdornment,
  IconButton,
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../store';
import { Staff } from '../../../../types/staff/staff';
import { KpiTarget, KpiTargetType } from '../../../../types/staff/kpi';
import { KpiService } from '../../../../services/kpi.service';
import { setKpiList } from '../../../../store/slices/kpiSlice';
import { formatNumber } from '../../../../utils/formatters';

const CommissionConfig: React.FC = () => {
  const dispatch = useDispatch();
  const { staffList } = useSelector<RootState, { staffList: Staff[] }>(state => state.staff);
  const { kpiList } = useSelector<RootState, { kpiList: KpiTarget[] }>(state => state.kpi);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [activeTab, setActiveTab] = useState(0);

  // Khởi tạo dữ liệu KPI mẫu nếu chưa có
  useEffect(() => {
    if (kpiList.length === 0 && staffList.length > 0) {
      const defaultKpis: KpiTarget[] = staffList
        .filter(staff => staff.team === 'SALES')
        .map(staff => ({
          id: `kpi_${staff.id}_${Date.now()}`,
          staffId: staff.id,
          type: KpiTargetType.SALES,
          targetValue: 0,
          actualValue: 0,
          bonusAmount: 0,
          isActive: true,
          month: selectedMonth,
          year: selectedYear
        }));
      dispatch(setKpiList(defaultKpis));
    }
  }, [dispatch, kpiList.length, staffList, selectedMonth, selectedYear]);

  // Lọc KPI theo loại
  const salesKpis = kpiList.filter(kpi => kpi.type === KpiTargetType.SALES);
  const departmentKpis = kpiList.filter(kpi => kpi.type === KpiTargetType.DEPARTMENT);
  const managementKpis = kpiList.filter(kpi => kpi.type === KpiTargetType.MANAGEMENT);

  // Xử lý chuyển tab
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Xử lý thay đổi tháng
  const handleMonthChange = (direction: 'prev' | 'next') => {
    const date = new Date(selectedYear, selectedMonth - 1);
    if (direction === 'prev') {
      date.setMonth(date.getMonth() - 1);
    } else {
      date.setMonth(date.getMonth() + 1);
    }
    setSelectedMonth(date.getMonth() + 1);
    setSelectedYear(date.getFullYear());
  };

  // Xử lý cập nhật KPI
  const handleKpiChange = (kpi: KpiTarget, field: keyof KpiTarget, value: number | boolean) => {
    const updatedKpis = kpiList.map(k => 
      k.id === kpi.id ? { ...k, [field]: value } : k
    );
    dispatch(setKpiList(updatedKpis));
  };

  // Xử lý lưu cấu hình
  const handleSave = () => {
    // TODO: Implement save to backend
    console.log('Saving KPI configuration...');
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6">
          Cấu hình KPI & Thưởng - Tháng {selectedMonth}/{selectedYear}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton onClick={() => handleMonthChange('prev')}>
            <ChevronLeftIcon />
          </IconButton>
          <Typography>
            Tháng {selectedMonth}/{selectedYear}
          </Typography>
          <IconButton onClick={() => handleMonthChange('next')}>
            <ChevronRightIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Tabs */}
      <Tabs value={activeTab} onChange={handleTabChange}>
        <Tab label="KPI Nhân viên KD" />
        <Tab label="KPI Phòng KD" />
        <Tab label="KPI Quản lý" />
        <Tab label="Thưởng Phòng hỗ trợ" />
      </Tabs>

      {/* Content */}
      <Box sx={{ mt: 3 }}>
        {activeTab === 0 && (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nhân viên</TableCell>
                  <TableCell align="center">Chỉ tiêu (XE)</TableCell>
                  <TableCell align="center">Thưởng/xe (VNĐ)</TableCell>
                  <TableCell align="center">Kích hoạt</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {salesKpis.map((kpi) => {
                  const staff = staffList.find(s => s.id === kpi.staffId);
                  return (
                    <TableRow key={kpi.id}>
                      <TableCell>{staff?.name || 'N/A'}</TableCell>
                      <TableCell align="center">
                        <TextField
                          type="text"
                          value={formatNumber(kpi.targetValue)}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            const value = e.target.value.replace(/\./g, '');
                            handleKpiChange(kpi, 'targetValue', parseInt(value) || 0);
                          }}
                          InputProps={{
                            endAdornment: <InputAdornment position="end">xe</InputAdornment>,
                          }}
                          sx={{ width: 150 }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <TextField
                          type="text"
                          value={formatNumber(kpi.bonusAmount)}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            const value = e.target.value.replace(/\./g, '');
                            handleKpiChange(kpi, 'bonusAmount', parseInt(value) || 0);
                          }}
                          InputProps={{
                            endAdornment: <InputAdornment position="end">₫</InputAdornment>,
                          }}
                          sx={{ width: 150 }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          variant={kpi.isActive ? "contained" : "outlined"}
                          color={kpi.isActive ? "primary" : "default"}
                          onClick={() => handleKpiChange(kpi, 'isActive', !kpi.isActive)}
                        >
                          {kpi.isActive ? 'Đang kích hoạt' : 'Chưa kích hoạt'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {salesKpis.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      Chưa có dữ liệu KPI
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      {/* Save Button */}
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="contained" color="primary" onClick={handleSave}>
          Lưu cấu hình
        </Button>
      </Box>
    </Box>
  );
};

export default CommissionConfig; 