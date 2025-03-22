// Định nghĩa enum cho các trạng thái của nhân viên
export enum StaffStatus {
  ACTIVE = 'Đang làm việc',
  INACTIVE = 'Tạm nghỉ',
  ON_LEAVE = 'Nghỉ phép',
  SUSPENDED = 'Đình chỉ',
  TERMINATED = 'Đã nghỉ việc'
}

// Định nghĩa enum cho các đội nhóm
export enum StaffTeam {
  SALES_1 = 'Phòng Kinh Doanh 1',
  SALES_2 = 'Phòng Kinh Doanh 2',
  SALES_3 = 'Phòng Kinh Doanh 3',
  MANAGEMENT = 'Ban Quản Lý',
  MARKETING = 'Marketing',
  ACCOUNTING = 'Kế Toán',
  OTHER = 'Khác'
}

// Định nghĩa enum cho các vai trò
export enum StaffRole {
  MANAGER = 'Trưởng Phòng',
  TEAM_LEADER = 'Trưởng Nhóm',
  STAFF = 'Nhân Viên',
  INTERN = 'Thực Tập Sinh'
}

// Interface cho đối tượng nhân viên
export interface Staff {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address?: string;
  team: string | null;
  role: string | null;
  status: string | null;
  joinDate: Date;
  terminationDate?: Date | null;
  commissionRate: number | null;
  salary?: number | null;
  baseSalary: number | null;
  vehiclesSold?: number;
  totalCommission?: number;
  avatar?: string;
  note?: string;
  created_at: string;
  updated_at: string;
}

// Interface cho thống kê nhân viên
export interface StaffStatistics {
  totalStaff: number;
  activeStaff: number;
  inactiveStaff: number;
  terminatedStaff: number;
  totalSalary: number;
  totalCommission: number;
}

/**
 * Tính toán tổng hoa hồng cho nhân viên
 * @param vehiclesSold - Số lượng xe đã bán
 * @param commissionRate - Tỷ lệ hoa hồng (%)
 * @returns Tổng số tiền hoa hồng
 */
export const calculateTotalCommission = (vehiclesSold: number = 0, commissionRate: number = 0): number => {
  // Giả sử giá trị trung bình của mỗi xe là 500 triệu đồng
  const averageVehicleValue = 500000000;
  
  // Tính tổng hoa hồng: số xe * giá trị trung bình * tỷ lệ hoa hồng
  return vehiclesSold * averageVehicleValue * (commissionRate / 100);
};

/**
 * Tạo ID ngẫu nhiên cho nhân viên
 * @returns ID cho nhân viên mới
 */
export const generateStaffId = (staffList: Staff[], name: string): string => {
  // Lấy 2 chữ cái đầu của họ và tên
  const initials = name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase();

  // Lấy số thứ tự tiếp theo
  const existingIds = staffList
    .map(staff => parseInt(staff.id.replace(/[^\d]/g, ''), 10))
    .filter(id => !isNaN(id));
  const nextNumber = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1;

  // Tạo ID mới theo format: NV + số thứ tự + initials
  return `NV${String(nextNumber).padStart(2, '0')}${initials}`;
};

export interface StaffHistory {
  id: string;
  staffId: string;
  fromStatus: StaffStatus;
  toStatus: StaffStatus;
  changedAt: Date;
  changedBy: string;
  notes?: string;
}

export interface KpiTarget {
  id: string;
  staffId: string;
  targetMonth: Date | null;
  salesTarget: number | null;
  profitTarget: number | null;
  actualSales: number | null;
  actualProfit: number | null;
  achievementRate: number | null;
  created_at: string;
  updated_at: string;
}

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