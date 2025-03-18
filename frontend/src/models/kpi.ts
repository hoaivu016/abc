import { Staff, StaffTeam } from '../types/staff/staff';

// Loại KPI
export enum KpiTargetType {
  VEHICLE_SALES = 'vehicle_sales',
  PROFIT_MARGIN = 'profit_margin',
  CUSTOMER_SATISFACTION = 'customer_satisfaction',
  UPSELLING = 'upselling',
  TOTAL_REVENUE = 'total_revenue'
}

// Interface KPI Target
export interface KpiTarget {
  id: string;
  type: KpiTargetType;
  targetValue: number;
  actualValue?: number;
  completionPercentage?: number;
  month: number;
  year: number;
  team?: StaffTeam;
  bonusAmount?: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

// Interface cho thưởng bộ phận hỗ trợ
export interface SupportDepartmentBonus {
  department: string; // Phòng ban
  bonusMonth: Date | null; // Tháng thưởng
  bonusAmount: number | null; // Số tiền thưởng
  achievementRate: number | null; // Tỷ lệ hoàn thành
  notes: string | null; // Ghi chú
  created_at: string; // Ngày tạo
  updated_at: string; // Ngày cập nhật
  id: string; // Đặt id ở cuối để khớp với schema DB
}

// Hàm tính toán % hoàn thành KPI
export const calculateKpiCompletion = (target: KpiTarget): number => {
  if (!target.actualValue || target.targetValue === 0) return 0;
  
  const completion = (target.actualValue / target.targetValue) * 100;
  return Math.min(completion, 200); // Giới hạn tối đa 200%
};

// Hàm tính toán thưởng dựa trên mức độ hoàn thành KPI
export const calculateSalesBonus = (staff: Staff, kpi: KpiTarget): number => {
  if (!kpi.completionPercentage || staff.team !== StaffTeam.SALES) return 0;
  
  let bonusAmount = 0;
  
  // Chỉ thưởng nếu hoàn thành ít nhất 80% KPI
  if (kpi.completionPercentage >= 80) {
    // Tính thưởng dựa trên mức độ hoàn thành
    if (kpi.completionPercentage >= 150) {
      bonusAmount = 5000000; // 5 triệu đồng nếu hoàn thành trên 150%
    } else if (kpi.completionPercentage >= 120) {
      bonusAmount = 3000000; // 3 triệu đồng nếu hoàn thành từ 120-150%
    } else if (kpi.completionPercentage >= 100) {
      bonusAmount = 2000000; // 2 triệu đồng nếu hoàn thành từ 100-120%
    } else {
      bonusAmount = 1000000; // 1 triệu đồng nếu hoàn thành từ 80-100%
    }
  }
  
  return bonusAmount;
}; 