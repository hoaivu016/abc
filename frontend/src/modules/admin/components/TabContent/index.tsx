import React from 'react';
import { Typography } from '@mui/material';
import { AdminTabsEnum } from '../../types/admin.enums';
import type { AdminProps } from '../../types/admin.types';
import StaffTab from '../AdminTabs/StaffTab';
import CommissionConfig from '../CommissionConfig';
import Dashboard from '../Dashboard';

interface TabContentProps extends AdminProps {
  currentTab: AdminTabsEnum;
}

const TabContent: React.FC<TabContentProps> = ({
  currentTab,
  staffList,
  vehicles,
  onAddStaff,
  onEditStaff,
  onDeleteStaff,
  showSnackbar,
  kpiList,
  onSaveKpi,
  supportBonusList,
  onSaveSupportBonus,
  selectedMonth,
  selectedYear,
  onDateChange
}) => {
  switch (currentTab) {
    case AdminTabsEnum.STAFF:
      return (
        <StaffTab
          staffList={staffList}
          vehicles={vehicles}
          onAddStaff={onAddStaff}
          onEditStaff={onEditStaff}
          onDeleteStaff={onDeleteStaff}
          showSnackbar={showSnackbar}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          onDateChange={onDateChange}
        />
      );

    case AdminTabsEnum.CONFIG:
      return (
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
      );

    case AdminTabsEnum.KPI:
      return (
        <Dashboard
          staffList={staffList}
          vehicles={vehicles}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          onDateChange={onDateChange}
          kpiList={kpiList}
        />
      );

    case AdminTabsEnum.PERMISSIONS:
      return (
        <Typography variant="h6">
          Tính năng phân quyền đang được phát triển
        </Typography>
      );

    case AdminTabsEnum.REPORTS:
      return (
        <Typography variant="h6">
          Tính năng báo cáo đang được phát triển
        </Typography>
      );

    default:
      return null;
  }
};

export default TabContent; 