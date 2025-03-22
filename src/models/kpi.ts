import { KpiTarget, KpiTargetType } from '../types/staff/kpi';

export { KpiTargetType };

export interface KpiModel {
  calculateKPI: (staffId: string, month: number, year: number, vehicles: any[]) => KpiTarget;
  generateDefaultKPI: (staffId: string, month: number, year: number) => KpiTarget;
}

export interface KpiTarget {
  id: string;
  targetMonth: number;
  targetYear: number;
  salesTarget: number;
  profitTarget: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SupportDepartmentBonus {
  id: string;
  department: string;
  bonusMonth: Date | string;
  bonusAmount: number;
  achievementRate: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export const KpiService: KpiModel = {
  calculateKPI: (staffId, month, year, vehicles) => {
    const staffVehicles = vehicles.filter((v: any) => 
      v.saleStaff?.id === staffId && 
      new Date(v.exportDate || '').getMonth() + 1 === month &&
      new Date(v.exportDate || '').getFullYear() === year
    );

    return {
      staff_id: staffId,
      month,
      year,
      type: KpiTargetType.SALES,
      target_vehicles: 10, // Mặc định 10 xe/tháng
      sold_vehicles: staffVehicles.length,
      bonus_per_vehicle: 500000, // 500,000 VND/xe
      total_bonus: staffVehicles.length * 500000
    };
  },

  generateDefaultKPI: (staffId, month, year) => ({
    staff_id: staffId,
    month,
    year,
    type: KpiTargetType.SALES,
    target_vehicles: 10,
    sold_vehicles: 0,
    bonus_per_vehicle: 500000,
    total_bonus: 0
  })
};

export const calculateKpiCompletion = (target: number, actual: number): number => {
  return target > 0 ? (actual / target) * 100 : 0;
};

export const calculateSalesBonus = (
  soldVehicles: number, 
  bonusPerVehicle: number = 500000
): number => {
  return soldVehicles * bonusPerVehicle;
}; 