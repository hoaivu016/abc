import React from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  Typography,
  Chip,
  Tooltip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { Staff, StaffTeam } from '../../../../types/staff/staff';
import { Vehicle, VehicleStatus } from '../../../../types/vehicles/vehicle';
import { getTeamColor } from '../../../../utils/staffUtils';
import { formatCurrency } from '../../../../utils/formatters';

interface StaffListProps {
  staffList: Staff[];
  vehicles: Vehicle[];
  onEdit: (staff: Staff) => void;
  onDelete: (staffId: string) => void;
  onAdd: () => void;
}

const StaffList: React.FC<StaffListProps> = ({
  staffList,
  vehicles,
  onEdit,
  onDelete,
  onAdd
}) => {
  // Tính toán thống kê cho mỗi nhân viên
  const getStaffStats = (staff: Staff) => {
    const staffVehicles = vehicles.filter(v => v.saleStaff?.id === staff.id);
    const soldVehicles = staffVehicles.filter(v => v.status === VehicleStatus.SOLD);
    const totalRevenue = soldVehicles.reduce((sum, v) => sum + (v.sellPrice || 0), 0);
    const commission = totalRevenue * (staff.commissionRate || 0) / 100;

    return {
      vehiclesSold: soldVehicles.length,
      revenue: totalRevenue,
      commission
    };
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6">
          Danh sách nhân viên
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={onAdd}
        >
          Thêm nhân viên
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Tên nhân viên</TableCell>
              <TableCell>Phòng ban</TableCell>
              <TableCell align="right">Xe đã bán</TableCell>
              <TableCell align="right">Doanh thu</TableCell>
              <TableCell align="right">Hoa hồng</TableCell>
              <TableCell align="center">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {staffList.map(staff => {
              const stats = getStaffStats(staff);
              return (
                <TableRow key={staff.id}>
                  <TableCell>{staff.name}</TableCell>
                  <TableCell>
                    <Chip 
                      label={staff.team}
                      sx={{
                        bgcolor: getTeamColor(staff.team as StaffTeam),
                        color: 'white'
                      }}
                    />
                  </TableCell>
                  <TableCell align="right">{stats.vehiclesSold}</TableCell>
                  <TableCell align="right">{formatCurrency(stats.revenue)}</TableCell>
                  <TableCell align="right">{formatCurrency(stats.commission)}</TableCell>
                  <TableCell align="center">
                    <Tooltip title="Chỉnh sửa">
                      <IconButton 
                        color="primary"
                        onClick={() => onEdit(staff)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Xóa">
                      <IconButton
                        color="error"
                        onClick={() => onDelete(staff.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default StaffList; 