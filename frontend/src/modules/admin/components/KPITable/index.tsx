import React, { useMemo } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Typography,
  Box
} from '@mui/material';
import { Staff } from '../../../../types/staff/staff';
import { Vehicle } from '../../../../types/vehicles/vehicle';
import { formatCurrency } from '../../../../utils/formatters';

interface KPITableProps {
  staffList: Staff[];
  vehicles: Vehicle[];
  selectedMonth?: number;
  selectedYear?: number;
}

interface KPIData {
  staffName: string;
  target: number;
  sold: number;
  completionRate: number;
  bonusPerVehicle: number;
  totalBonus: number;
  baseSalary: number;
  totalIncome: number;
}

const KPITable: React.FC<KPITableProps> = ({ 
  staffList, 
  vehicles, 
  selectedMonth, 
  selectedYear 
}) => {
  const kpiData: KPIData[] = useMemo(() => {
    return staffList
      .filter(staff => staff.team === 'Kinh doanh')
      .map(staff => {
        // Tính số xe đã bán của nhân viên
        const soldVehicles = vehicles.filter(v => 
          v.saleStaff?.id === staff.id && 
          new Date(v.exportDate || '').getMonth() + 1 === selectedMonth &&
          new Date(v.exportDate || '').getFullYear() === selectedYear
        ).length;

        // Giả định các giá trị cho mục tiêu, tỷ lệ hoàn thành, thưởng
        const target = 10; // Ví dụ: mục tiêu 10 xe/tháng
        const completionRate = (soldVehicles / target) * 100;
        const bonusPerVehicle = 500000; // Ví dụ: 500,000 VND/xe
        const totalBonus = soldVehicles * bonusPerVehicle;
        const baseSalary = staff.baseSalary || 0;
        const totalIncome = baseSalary + totalBonus;

        return {
          staffName: staff.name,
          target,
          sold: soldVehicles,
          completionRate,
          bonusPerVehicle,
          totalBonus,
          baseSalary,
          totalIncome
        };
      });
  }, [staffList, vehicles, selectedMonth, selectedYear]);

  return (
    <Box sx={{ width: '100%', overflowX: 'auto' }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Bảng KPI Nhân Viên Kinh Doanh
        {selectedMonth && selectedYear && ` (Tháng ${selectedMonth}/${selectedYear})`}
      </Typography>
      <TableContainer component={Paper} elevation={3}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell>Nhân viên</TableCell>
              <TableCell align="right">Chỉ tiêu</TableCell>
              <TableCell align="right">Đã bán</TableCell>
              <TableCell align="right">Tỷ lệ hoàn thành (%)</TableCell>
              <TableCell align="right">Thưởng/xe</TableCell>
              <TableCell align="right">Tổng thưởng</TableCell>
              <TableCell align="right">Lương cơ bản</TableCell>
              <TableCell align="right">Tổng thu nhập</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {kpiData.map((row) => (
              <TableRow
                key={row.staffName}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {row.staffName}
                </TableCell>
                <TableCell align="right">{row.target}</TableCell>
                <TableCell align="right">{row.sold}</TableCell>
                <TableCell align="right">
                  {row.completionRate.toFixed(2)}%
                </TableCell>
                <TableCell align="right">
                  {formatCurrency(row.bonusPerVehicle)}
                </TableCell>
                <TableCell align="right">
                  {formatCurrency(row.totalBonus)}
                </TableCell>
                <TableCell align="right">
                  {formatCurrency(row.baseSalary)}
                </TableCell>
                <TableCell align="right">
                  {formatCurrency(row.totalIncome)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default KPITable; 