import React from 'react';
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  Chip,
  LinearProgress,
  Tooltip
} from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { Staff } from '../../../types/staff/staff';
import { formatCurrency } from '../../../utils/formatters';
import { KPITableProps } from '../../../types/staff/kpi';

const KPITable: React.FC<KPITableProps> = ({
  departmentKPIs,
  salesStaffKPIs,
  managementKPIs,
  staffList,
  vehicles,
  allSalesStaffWithKpis
}) => {
  return (
    <Box sx={{ mb: 4 }}>
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          borderRadius: '8px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          <AssessmentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Bảng KPI, lương và thưởng nhân viên
        </Typography>
        <Box sx={{ my: 2 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'background.default' }}>
                  <TableCell sx={{ fontWeight: 600, borderBottom: '2px solid', borderBottomColor: 'divider' }}>Nhân viên</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600, borderBottom: '2px solid', borderBottomColor: 'divider' }}>Chỉ tiêu</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600, borderBottom: '2px solid', borderBottomColor: 'divider' }}>Đã bán</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600, borderBottom: '2px solid', borderBottomColor: 'divider' }}>Tỷ lệ hoàn thành</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, borderBottom: '2px solid', borderBottomColor: 'divider' }}>Thưởng/xe</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, borderBottom: '2px solid', borderBottomColor: 'divider' }}>Tổng thưởng</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, borderBottom: '2px solid', borderBottomColor: 'divider' }}>Lương cơ bản</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, borderBottom: '2px solid', borderBottomColor: 'divider' }}>Tổng thu nhập</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {allSalesStaffWithKpis.map(({ staff, hasKpi, kpiData }) => (
                  <TableRow key={staff.id}>
                    <TableCell sx={{ borderBottom: '1px solid', borderBottomColor: 'divider' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body1">{staff.name}</Typography>
                        <Chip 
                          label={staff.team}
                          size="small"
                          sx={{ ml: 1 }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell align="center" sx={{ borderBottom: '1px solid', borderBottomColor: 'divider' }}>
                      {hasKpi ? kpiData.targetValue : '-'}
                    </TableCell>
                    <TableCell align="center" sx={{ borderBottom: '1px solid', borderBottomColor: 'divider' }}>
                      {kpiData.actualValue}
                    </TableCell>
                    <TableCell align="center" sx={{ borderBottom: '1px solid', borderBottomColor: 'divider' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ width: '100%', mr: 1 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={Math.min(kpiData.completion, 100)}
                            color={kpiData.completion >= 100 ? 'success' : 'primary'}
                            sx={{ 
                              height: 8, 
                              borderRadius: '4px',
                              backgroundColor: 'rgba(0,0,0,0.05)'
                            }}
                          />
                        </Box>
                        <Box sx={{ minWidth: 35 }}>
                          <Typography variant="body2" color="text.secondary">
                            {Math.round(kpiData.completion)}%
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell align="right" sx={{ borderBottom: '1px solid', borderBottomColor: 'divider' }}>
                      {formatCurrency(kpiData.bonusPerUnit)}
                    </TableCell>
                    <TableCell align="right" sx={{ borderBottom: '1px solid', borderBottomColor: 'divider' }}>
                      <Tooltip title={`${kpiData.actualValue} xe × ${formatCurrency(kpiData.bonusPerUnit)}`}>
                        <span>{formatCurrency(kpiData.bonus)}</span>
                      </Tooltip>
                    </TableCell>
                    <TableCell align="right" sx={{ borderBottom: '1px solid', borderBottomColor: 'divider' }}>
                      {formatCurrency(staff.salary)}
                    </TableCell>
                    <TableCell align="right" sx={{ borderBottom: '1px solid', borderBottomColor: 'divider' }}>
                      <Typography fontWeight="bold">
                        {formatCurrency(staff.salary + kpiData.bonus)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
                {allSalesStaffWithKpis.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} sx={{ textAlign: 'center', py: 3 }}>
                      Chưa có dữ liệu KPI của nhân viên
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Paper>
    </Box>
  );
};

export default KPITable; 