import React, { useState } from 'react';
import { 
  Box, 
  Tabs, 
  Tab, 
  Typography 
} from '@mui/material';
import StaffManagement from './StaffManagement';
import KpiManagement from './KpiManagement';
import SupportBonusManagement from './SupportBonusManagement';
import AccountManagement from '../../accounts/components/AccountManagement';

// Định nghĩa props cho component Admin
interface AdminProps {
  staffList: Staff[];
  vehicles: Vehicle[];
  onAddStaff: (staffData: Partial<Staff>) => void;
  onEditStaff: (staffData: Partial<Staff>) => void;
  onDeleteStaff: (staffId: string) => void;
  kpiList: KpiTarget[];
  onSaveKpi: (kpiTargets: KpiTarget[]) => void;
  supportBonusList: SupportDepartmentBonus[];
  onSaveSupportBonus: (bonuses: SupportDepartmentBonus[]) => void;
  selectedMonth: number;
  selectedYear: number;
  onDateChange: (month: number, year: number) => void;
  onOpenVehicleList: () => void;
}

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
  onDateChange,
  onOpenVehicleList
}) => {
  // State quản lý tab hiện tại
  const [currentTab, setCurrentTab] = useState(0);

  // Xử lý thay đổi tab
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  return (
    <Box>
      {/* Tabs quản lý */}
      <Tabs 
        value={currentTab} 
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
      >
        <Tab label="Nhân Sự" />
        <Tab label="KPI" />
        <Tab label="Thưởng Hỗ Trợ" />
        <Tab label="Quản Lý Tài Khoản" />
      </Tabs>

      {/* Nội dung từng tab */}
      {currentTab === 0 && (
        <StaffManagement 
          staffList={staffList}
          vehicles={vehicles}
          onAddStaff={onAddStaff}
          onEditStaff={onEditStaff}
          onDeleteStaff={onDeleteStaff}
          onOpenVehicleList={onOpenVehicleList}
        />
      )}

      {currentTab === 1 && (
        <KpiManagement 
          kpiList={kpiList}
          onSaveKpi={onSaveKpi}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          onDateChange={onDateChange}
        />
      )}

      {currentTab === 2 && (
        <SupportBonusManagement 
          supportBonusList={supportBonusList}
          onSaveSupportBonus={onSaveSupportBonus}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          onDateChange={onDateChange}
        />
      )}

      {currentTab === 3 && (
        <AccountManagement />
      )}
    </Box>
  );
};

export default Admin; 