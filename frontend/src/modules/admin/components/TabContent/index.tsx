import React from 'react';
import { Typography } from '@mui/material';
import { AdminTabsEnum } from '../../types/admin.enums';
import type { AdminProps } from '../../types/admin.types';
import StaffTab from '../AdminTabs/StaffTab';
import CommissionConfig from '../CommissionConfig';
import KPITable from '../KPITable';

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
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          onDateChange={onDateChange}
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
        <KPITable
          staffList={staffList}
          vehicles={vehicles}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
        />
      );

    default:
      return null;
  }
};

export default TabContent; 