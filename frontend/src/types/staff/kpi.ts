export enum KpiTargetType {
  SALES = 'SALES',
  DEPARTMENT = 'DEPARTMENT',
  MANAGEMENT = 'MANAGEMENT'
}

export interface KpiTarget {
  id?: string;
  staff_id: string;
  month: number;
  year: number;
  type: KpiTargetType;
  target_vehicles: number;
  sold_vehicles: number;
  bonus_per_vehicle: number;
  total_bonus: number;
}

export interface KpiTargetConfig {
  id?: string;
  name: string;
  description?: string;
}

export interface SupportDepartmentBonus {
  id?: string;
  staff_id: string;
  month: number;
  year: number;
  bonus_amount: number;
  description?: string;
} 