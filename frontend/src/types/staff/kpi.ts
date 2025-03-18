import { Staff, StaffTeam } from './staff';
import { Vehicle } from '../vehicle/vehicle';

export enum KpiTargetType {
  SALES = 'SALES',           // KPI cho nhân viên kinh doanh
  DEPARTMENT = 'DEPARTMENT', // KPI cho phòng ban
  MANAGEMENT = 'MANAGEMENT'  // KPI cho quản lý
}

export interface KpiTarget {
  id: string;
  staffId: string;
  type: KpiTargetType;
  targetValue: number;
  actualValue: number;
  bonusAmount: number;
  isActive: boolean;
  month: number;
  year: number;
  targetName?: string;
}

export interface SupportDepartmentBonus {
  id: string;
  departmentId: string;
  bonusAmount: number;
  isActive: boolean;
  month: number;
  year: number;
}

export interface StaffKpiData {
  staff: Staff;
  hasKpi: boolean;
  kpiData: {
    targetValue: number;
    actualValue: number;
    completion: number;
    bonusPerUnit: number;
    bonus: number;
  };
}

export interface KPITableProps {
  departmentKPIs: KpiTarget[];
  salesStaffKPIs: KpiTarget[];
  managementKPIs: KpiTarget[];
  staffList: any[];
  vehicles: any[];
  allSalesStaffWithKpis: {
    staff: any;
    hasKpi: boolean;
    kpiData: {
      targetValue: number;
      actualValue: number;
      completion: number;
      bonusPerUnit: number;
      bonus: number;
    };
  }[];
}

export interface SalesStaffPerformance extends Staff {
  vehiclesSold: number;
  revenue: number;
  commission: number;
}

export interface SalesStaffReportProps {
  staffPerformance: any[];
  kpiTargets: KpiTarget[];
} 