import type { FC } from 'react';
import type { Staff } from '../../../types/staff/staff';
import type { Vehicle } from '../../../types/vehicle/vehicle';
import type { KpiTarget, SupportDepartmentBonus } from '../../../types/staff/kpi';
import { AdminTabsEnum } from './admin.enums';

export type Severity = 'error' | 'warning' | 'info' | 'success';

export interface NotificationState {
  open: boolean;
  message: string;
  severity: Severity;
}

export interface TabConfig {
  id: AdminTabsEnum;
  label: string;
  icon: FC;
  mobileVisible?: boolean;
}

export interface BaseAdminProps {
  staffList: Staff[];
  vehicles: Vehicle[];
  selectedMonth?: number;
  selectedYear?: number;
  onDateChange?: (month: number, year: number) => void;
}

export interface StaffTabProps extends BaseAdminProps {
  onAddStaff: (staffData: Partial<Staff>) => void;
  onEditStaff: (staffData: Partial<Staff>) => void;
  onDeleteStaff: (staffId: string) => void;
  showSnackbar: (message: string, severity: Severity) => void;
}

export interface CommissionConfigProps extends BaseAdminProps {
  onSaveKpi: (kpi: KpiTarget[]) => void;
  onSaveSupportBonus: (bonus: SupportDepartmentBonus[]) => void;
  kpiList: KpiTarget[];
  supportBonusList: SupportDepartmentBonus[];
}

export interface KpiTabProps extends BaseAdminProps {
  kpiList: KpiTarget[];
}

export interface AdminProps extends StaffTabProps, CommissionConfigProps {} 