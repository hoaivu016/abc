import React from 'react';
import { Box, Paper, Alert, Snackbar, Container, Grid } from '@mui/material';
import type { AdminProps } from '../../types/admin.types';
import { useNotification } from '../../hooks/useNotification';
import StaffTab from '../AdminTabs/StaffTab';
import CommissionConfig from '../CommissionConfig';
import KPITable from '../KPITable';
import SalesStaffReport from '../SalesStaffReport';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../store';
import { KpiTarget, KpiTargetType } from '../../../../types/staff/kpi';

const Admin: React.FC<AdminProps> = ({
  staffList,
  vehicles,
  onAddStaff,
  onEditStaff,
  onDeleteStaff,
  kpiList,
  onSaveKpi,
  supportBonusList,
  onSaveSupportBonus,
  selectedMonth,
  selectedYear,
  onDateChange
}) => {
  const { notification, showNotification, hideNotification } = useNotification();
  const { kpiList: reduxKpiList } = useSelector((state: RootState) => state.kpi);

  const kpiTableProps = {
    departmentKPIs: reduxKpiList.filter((kpi: KpiTarget) => kpi.type === KpiTargetType.DEPARTMENT),
    salesStaffKPIs: reduxKpiList.filter((kpi: KpiTarget) => kpi.type === KpiTargetType.SALES),
    managementKPIs: reduxKpiList.filter((kpi: KpiTarget) => kpi.type === KpiTargetType.MANAGEMENT),
    staffList,
    vehicles,
    allSalesStaffWithKpis: staffList
      .filter(staff => staff.team === 'SALES')
      .map(staff => ({
        staff,
        hasKpi: reduxKpiList.some((kpi: KpiTarget) => kpi.staffId === staff.id),
        kpiData: {
          targetValue: reduxKpiList.find((kpi: KpiTarget) => kpi.staffId === staff.id)?.targetValue || 0,
          actualValue: reduxKpiList.find((kpi: KpiTarget) => kpi.staffId === staff.id)?.actualValue || 0,
          completion: reduxKpiList.find((kpi: KpiTarget) => kpi.staffId === staff.id)?.completion || 0,
          bonusPerUnit: reduxKpiList.find((kpi: KpiTarget) => kpi.staffId === staff.id)?.bonusAmount || 0,
          bonus: reduxKpiList.find((kpi: KpiTarget) => kpi.staffId === staff.id)?.bonus || 0
        }
      }))
  };

  const salesStaffReportProps = {
    staffPerformance: staffList
      .filter(staff => staff.team === 'SALES')
      .map(staff => ({
        ...staff,
        vehiclesSold: vehicles.filter(v => v.saleStaff?.id === staff.id && v.status === 'SOLD').length,
        revenue: vehicles
          .filter(v => v.saleStaff?.id === staff.id && v.status === 'SOLD')
          .reduce((sum, v) => sum + (v.sellPrice || 0), 0),
        commission: reduxKpiList
          .filter((kpi: KpiTarget) => kpi.staffId === staff.id)
          .reduce((sum, kpi) => sum + (kpi.bonus || 0), 0)
      })),
    kpiTargets: reduxKpiList.filter((kpi: KpiTarget) => kpi.type === KpiTargetType.SALES)
  };

  return (
    <Container maxWidth="xl">
      <Box>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <KPITable {...kpiTableProps} />
          </Grid>
          <Grid item xs={12}>
            <SalesStaffReport {...salesStaffReportProps} />
          </Grid>
          <Grid item xs={12}>
            <CommissionConfig
              staffList={staffList}
              vehicles={vehicles}
              onSaveKpi={onSaveKpi}
              onSaveSupportBonus={onSaveSupportBonus}
              kpiList={kpiList}
              supportBonusList={supportBonusList}
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
              onDateChange={onDateChange}
            />
          </Grid>
          <Grid item xs={12}>
            <StaffTab
              staffList={staffList}
              vehicles={vehicles}
              onAddStaff={onAddStaff}
              onEditStaff={onEditStaff}
              onDeleteStaff={onDeleteStaff}
              showSnackbar={showNotification}
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
              onDateChange={onDateChange}
            />
          </Grid>
        </Grid>
      </Box>

      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={hideNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={hideNotification} 
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Admin; 