import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Chip
} from '@mui/material';
import { SalesStaffReportProps } from '../../../types/staff/kpi';
import { formatCurrency } from '../../../utils/formatters';

const SalesStaffReport: React.FC<SalesStaffReportProps> = ({
  staffPerformance,
  kpiTargets
}) => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Sales Staff Performance
      </Typography>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Staff Name</TableCell>
              <TableCell>Team</TableCell>
              <TableCell align="right">Vehicles Sold</TableCell>
              <TableCell align="right">Revenue</TableCell>
              <TableCell align="right">Commission</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {staffPerformance.map(staff => (
              <TableRow key={staff.id}>
                <TableCell>{staff.name}</TableCell>
                <TableCell>{staff.team}</TableCell>
                <TableCell align="right">{staff.vehiclesSold}</TableCell>
                <TableCell align="right">{formatCurrency(staff.revenue)}</TableCell>
                <TableCell align="right">{formatCurrency(staff.commission)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default SalesStaffReport; 