import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { Staff } from '../../../../types/staff/staff';
import { Vehicle } from '../../../../types/vehicles/vehicle';
import { formatCurrency } from '../../../../utils/formatters';

interface CommissionConfigProps {
  staffList: Staff[];
  vehicles: Vehicle[];
  selectedMonth?: number;
  selectedYear?: number;
  onDateChange?: (month: number, year: number) => void;
}

const CommissionConfig: React.FC<CommissionConfigProps> = ({
  staffList,
  vehicles,
  selectedMonth,
  selectedYear
}) => {
  // Tính toán hoa hồng cho từng nhân viên
  const calculateCommission = (staff: Staff) => {
    const staffVehicles = vehicles.filter(v => 
      v.saleStaff?.id === staff.id && 
      new Date(v.exportDate || '').getMonth() + 1 === selectedMonth &&
      new Date(v.exportDate || '').getFullYear() === selectedYear
    );

    const totalSales = staffVehicles.reduce((sum, vehicle) => sum + (vehicle.sellPrice || 0), 0);
    const commissionRate = staff.commissionRate || 0.01; // Mặc định 1%
    const commission = totalSales * commissionRate;

    return {
      staffName: staff.name,
      vehiclesSold: staffVehicles.length,
      totalSales,
      commissionRate: commissionRate * 100,
      commission
    };
  };

  const commissionData = staffList
    .filter(staff => staff.team === 'Kinh doanh')
    .map(calculateCommission);

    return (
    <Box sx={{ width: '100%', overflowX: 'auto' }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Bảng Hoa Hồng Nhân Viên Kinh Doanh
        {selectedMonth && selectedYear && ` (Tháng ${selectedMonth}/${selectedYear})`}
      </Typography>
      <TableContainer component={Paper} elevation={3}>
        <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell>Nhân viên</TableCell>
              <TableCell align="right">Số xe bán</TableCell>
              <TableCell align="right">Tổng doanh số</TableCell>
              <TableCell align="right">Tỷ lệ hoa hồng (%)</TableCell>
              <TableCell align="right">Hoa hồng</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
            {commissionData.map((row) => (
              <TableRow
                key={row.staffName}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {row.staffName}
                </TableCell>
                <TableCell align="right">{row.vehiclesSold}</TableCell>
                <TableCell align="right">
                  {formatCurrency(row.totalSales)}
                  </TableCell>
                <TableCell align="right">
                  {row.commissionRate.toFixed(2)}%
                  </TableCell>
                <TableCell align="right">
                  {formatCurrency(row.commission)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
    </Box>
  );
};

export default CommissionConfig; 