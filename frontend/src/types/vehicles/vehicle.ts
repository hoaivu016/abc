// Enum trạng thái xe với màu sắc và mô tả
export enum VehicleStatus {
  IN_STOCK = 'Trong kho',
  DEPOSITED = 'Đặt cọc',
  BANK_DEPOSITED = 'Đặt cọc ngân hàng',
  OFFSET = 'Đóng đối ứng',
  SOLD = 'Đã bán'
}

// Interface lịch sử trạng thái
export interface StatusHistory {
  fromStatus: VehicleStatus;
  toStatus: VehicleStatus;
  changedAt: Date;
  changedBy: string;
  notes?: string;
}

// Interface thanh toán (phía giao diện người dùng)
export interface PaymentInfo {
  id?: string;
  amount: number;
  date: Date;
  type: 'DEPOSIT' | 'BANK_DEPOSIT' | 'OFFSET' | 'FULL_PAYMENT';
  notes?: string;
  status?: string;
}

// Interface StatusChange
export interface StatusChange {
  id: string;
  fromStatus: VehicleStatus;
  toStatus: VehicleStatus;
  changedAt: Date;
  changedBy: string;
  notes?: string;
}

// Interface nhân viên bán
export interface SaleStaff {
  id: string;        // Mã nhân viên
  name: string;      // Tên nhân viên
  team: string;      // Team/nhóm
  expectedCommission: number; // Hoa hồng dự kiến
}

// Interface chi phí
export interface CostInfo {
  id: string;
  amount: number;
  date: Date;
  description: string;
}

// Interface xe được mở rộng
export interface Vehicle {
  id: string;
  name: string | null;
  color: string | null;
  manufacturingYear: number | null;
  odo: number;
  status: VehicleStatus;
  importDate: Date;
  exportDate: Date | null;
  purchasePrice: number;
  sellPrice: number;
  profit: number;
  debt: number;
  cost: number;
  storageTime: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  costs: VehicleCost[];
  payments: PaymentInfo[]; // Thay đổi từ VehiclePayment sang PaymentInfo
  saleStaff?: {
    id: string;
    name: string;
    team: string;
    expectedCommission: number;
  };
  statusHistory: StatusChange[];
}

export interface VehicleCost {
  vehicleId: string; // Khớp với vehicle_id trong Supabase
  amount: number;
  costDate: Date; // Khớp với cost_date trong Supabase
  description: string | null;
  created_at: string;
  updated_at: string;
  id: string; // Di chuyển ID xuống cuối để khớp với schema DB
}

// Định nghĩa VehiclePayment cho Supabase (DB)
export interface VehiclePayment {
  id: string;
  vehicleId: string; // Khớp với vehicle_id trong Supabase
  amount: number;
  paymentDate: Date; // Khớp với payment_date trong Supabase
  paymentType: string | null; // Khớp với payment_type trong Supabase
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// Hàm chuyển đổi từ VehiclePayment sang PaymentInfo
export function convertToPaymentInfo(payment: VehiclePayment): PaymentInfo {
  return {
    id: payment.id,
    amount: payment.amount,
    date: payment.paymentDate,
    type: payment.paymentType as 'DEPOSIT' | 'BANK_DEPOSIT' | 'OFFSET' | 'FULL_PAYMENT',
    notes: payment.notes || undefined
  };
}

// Hàm chuyển đổi từ PaymentInfo sang VehiclePayment
export function convertToVehiclePayment(payment: PaymentInfo, vehicleId: string): VehiclePayment {
  return {
    id: payment.id || `PAYMENT_${Date.now()}`,
    vehicleId: vehicleId,
    amount: payment.amount,
    paymentDate: payment.date,
    paymentType: payment.type,
    notes: payment.notes || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

// Hàm tạo mã xe tự động
export function generateVehicleId(vehicles: Vehicle[]): string {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  
  // Lấy số thứ tự tiếp theo trong ngày
  const prefix = `${day}${month}`;
  
  // Lọc xe trong ngày hiện tại và lấy số thứ tự lớn nhất
  const todayVehicles = vehicles.filter(v => v.id.startsWith(prefix));
  let maxNumber = 0;
  
  // Tìm số thứ tự lớn nhất trong các mã xe hiện tại
  todayVehicles.forEach(v => {
    const currentNumber = parseInt(v.id.split('-')[1], 10);
    if (!isNaN(currentNumber) && currentNumber > maxNumber) {
      maxNumber = currentNumber;
    }
  });
  
  // Tạo số thứ tự mới
  const nextNumber = (maxNumber + 1).toString().padStart(2, '0');
  
  // Tạo mã xe với định dạng: DDMM-XX (ngày, tháng, số thứ tự)
  return `${prefix}-${nextNumber}`;
}

// Hàm tính lợi nhuận
export function calculateProfit(vehicle: Partial<Vehicle>): number {
  const purchasePrice = vehicle.purchasePrice || 0;
  const sellPrice = vehicle.sellPrice || 0;
  const cost = vehicle.cost || 0;
  const debt = vehicle.debt || 0;
  
  // Tính lợi nhuận: Giá bán - Giá mua - Chi phí
  const profit = sellPrice - purchasePrice - cost;
  
  // Log để kiểm tra việc tính toán
  console.log('Profit Calculation:', {
    purchasePrice,
    sellPrice,
    cost,
    debt,
    profit
  });
  
  return profit;
}

// Hàm tính thời gian lưu kho
export function calculateStorageTime(importDate: Date, exportDate?: Date): number {
  // Đảm bảo importDate là đối tượng Date
  const importDateTime = importDate instanceof Date 
    ? importDate 
    : new Date(importDate);
  
  // Sử dụng ngày hiện tại nếu không có ngày xuất
  const exportDateTime = exportDate instanceof Date 
    ? exportDate 
    : new Date(exportDate || Date.now());

  // Tránh các giá trị không hợp lệ
  if (isNaN(importDateTime.getTime()) || isNaN(exportDateTime.getTime())) {
    return 0;
  }

  // Tính toán thời gian lưu kho
  const timeDiff = exportDateTime.getTime() - importDateTime.getTime();
  return Math.max(0, Math.ceil(timeDiff / (1000 * 3600 * 24))); // Chuyển đổi sang ngày, đảm bảo không âm
}

// Hàm tạo cảnh báo thời gian lưu kho
export function generateStorageTimeWarning(storageTime: number): {
  level: 'normal' | 'warning' | 'danger';
  message: string;
} {
  if (storageTime < 15) {
    return {
      level: 'normal',
      message: `Thời gian lưu kho: ${storageTime} ngày (Bình thường)`
    };
  }
  
  if (storageTime >= 15 && storageTime <= 25) {
    return {
      level: 'warning',
      message: `Cảnh báo: Thời gian lưu kho ${storageTime} ngày đang ở mức độ cảnh báo`
    };
  }
  
  return {
    level: 'danger',
    message: `NGUY HIỂM: Thời gian lưu kho ${storageTime} ngày quá lâu`
  };
}

// Mở rộng hàm getStorageTimeColor để hỗ trợ cảnh báo
export function getStorageTimeColor(storageTime: number): string {
  const warning = generateStorageTimeWarning(storageTime);
  
  switch (warning.level) {
    case 'normal': return 'default';
    case 'warning': return '#FFA500';
    case 'danger': return '#FF0000';
    default: return 'default';
  }
}

// Hàm kiểm tra khả năng chuyển trạng thái
export function canChangeStatus(
  currentStatus: VehicleStatus, 
  newStatus: VehicleStatus
): boolean {
  // Log để kiểm tra
  console.log(`Kiểm tra chuyển trạng thái từ ${currentStatus} sang ${newStatus}`);
  
  // Không cho phép chuyển giữa Đặt cọc và Đặt cọc ngân hàng
  if ((currentStatus === VehicleStatus.DEPOSITED && newStatus === VehicleStatus.BANK_DEPOSITED) ||
      (currentStatus === VehicleStatus.BANK_DEPOSITED && newStatus === VehicleStatus.DEPOSITED)) {
    console.log('Không cho phép chuyển trực tiếp giữa Đặt cọc và Đặt cọc ngân hàng');
    return false;
  }
  
  switch (currentStatus) {
    case VehicleStatus.IN_STOCK:
      // Từ "Trong kho" có thể chuyển sang: "Đặt cọc", "Đặt cọc ngân hàng", "Đã bán"
      return [
        VehicleStatus.DEPOSITED, 
        VehicleStatus.BANK_DEPOSITED, 
        VehicleStatus.SOLD
      ].includes(newStatus);
    
    case VehicleStatus.DEPOSITED:
      // Từ "Đặt cọc" có thể chuyển sang: "Đã bán" hoặc "Trong kho" (hoàn cọc)
      return [
        VehicleStatus.SOLD,
        VehicleStatus.IN_STOCK
      ].includes(newStatus);
    
    case VehicleStatus.BANK_DEPOSITED:
      // Từ "Đặt cọc ngân hàng" có thể chuyển sang: "Đóng đối ứng", "Trong kho" (hoàn cọc)
      return [
        VehicleStatus.OFFSET,
        VehicleStatus.IN_STOCK
      ].includes(newStatus);
    
    case VehicleStatus.OFFSET:
      // Từ "Đóng đối ứng" chỉ có thể chuyển sang "Đã bán"
      return newStatus === VehicleStatus.SOLD;
    
    case VehicleStatus.SOLD:
      // Từ "Đã bán" không thể chuyển sang trạng thái khác
      return false;
    
    default:
      return false;
  }
}

// Hàm lấy màu sắc trạng thái
export function getStatusColor(status: VehicleStatus): string {
  switch (status) {
    case VehicleStatus.IN_STOCK: return 'rgba(76, 175, 80, 0.1)';
    case VehicleStatus.DEPOSITED: return 'rgba(255, 152, 0, 0.1)';
    case VehicleStatus.BANK_DEPOSITED: return 'rgba(33, 150, 243, 0.1)';
    case VehicleStatus.OFFSET: return 'rgba(156, 39, 176, 0.1)';
    case VehicleStatus.SOLD: return 'rgba(0, 150, 136, 0.1)';
    default: return '#6c757d';
  }
}

// Hàm lấy màu chữ trạng thái
export function getStatusTextColor(status: VehicleStatus): string {
  switch (status) {
    case VehicleStatus.IN_STOCK: return '#2E7D32';
    case VehicleStatus.DEPOSITED: return '#E67E22';
    case VehicleStatus.BANK_DEPOSITED: return '#1976D2';
    case VehicleStatus.OFFSET: return '#8E44AD';
    case VehicleStatus.SOLD: return '#00796B';
    default: return '#6c757d';
  }
}

// Hàm lấy màu viền trạng thái
export function getStatusBorderColor(status: VehicleStatus): string {
  switch (status) {
    case VehicleStatus.IN_STOCK: return 'rgba(76, 175, 80, 0.2)';
    case VehicleStatus.DEPOSITED: return 'rgba(255, 152, 0, 0.2)';
    case VehicleStatus.BANK_DEPOSITED: return 'rgba(33, 150, 243, 0.2)';
    case VehicleStatus.OFFSET: return 'rgba(156, 39, 176, 0.2)';
    case VehicleStatus.SOLD: return 'rgba(0, 150, 136, 0.2)';
    default: return '#6c757d';
  }
}

// Hàm tính toán công nợ
export function calculateDebt(
  sellPrice: number, 
  payments: PaymentInfo[] | undefined
): number {
  // Kiểm tra nếu payments là undefined thì gán mảng rỗng
  if (!payments) {
    console.warn('calculateDebt: payments là undefined, sử dụng mảng rỗng');
    payments = [];
  }
  
  // Tính tổng các khoản thanh toán
  const depositAmount = payments
    .filter(p => p.type === 'DEPOSIT')
    .reduce((sum, p) => sum + p.amount, 0);
  
  const bankDepositAmount = payments
    .filter(p => p.type === 'BANK_DEPOSIT')
    .reduce((sum, p) => sum + p.amount, 0);
  
  const offsetAmount = payments
    .filter(p => p.type === 'OFFSET')
    .reduce((sum, p) => sum + p.amount, 0);
  
  const fullPaymentAmount = payments
    .filter(p => p.type === 'FULL_PAYMENT')
    .reduce((sum, p) => sum + p.amount, 0);
  
  // Tổng các khoản thanh toán = Đặt cọc + Đặt cọc ngân hàng + Tiền đối ứng + Thanh toán đầy đủ
  const totalPaid = depositAmount + bankDepositAmount + offsetAmount + fullPaymentAmount;
  
  // Tính công nợ: Giá bán - Tổng các khoản đã thanh toán
  // Không cho phép công nợ âm
  const debt = Math.max(0, sellPrice - totalPaid);
  
  // Log chi tiết để kiểm tra việc tính toán
  console.log('Debt Calculation (Chi tiết):', {
    sellPrice,
    totalPaid,
    depositAmount,
    bankDepositAmount,
    offsetAmount,
    fullPaymentAmount,
    debt
  });
  
  return debt;
}

// Hàm tính toán công nợ khi chuyển trạng thái
export function calculateDebtOnStatusChange(
  vehicle: Vehicle, 
  newStatus: VehicleStatus,
  paymentAmount: number = 0
): number {
  // Kiểm tra xe có hợp lệ không
  if (!vehicle) {
    console.error('calculateDebtOnStatusChange: vehicle là undefined');
    return 0;
  }

  // Nếu về trạng thái Trong kho, reset công nợ về 0 và xóa toàn bộ thanh toán
  if (newStatus === VehicleStatus.IN_STOCK) {
    console.log('Reset công nợ về 0 và xóa toàn bộ thanh toán khi chuyển về trạng thái Trong kho');
    
    // Chú ý: Chúng ta không thực sự xóa thanh toán ở đây vì đây chỉ là hàm tính toán
    // Việc xóa thanh toán sẽ được thực hiện trong StatusChangeModal
    return 0;
  }
  
  // Nếu chuyển sang trạng thái Đã bán, reset công nợ về 0
  if (newStatus === VehicleStatus.SOLD) {
    console.log('Reset công nợ về 0 khi chuyển sang trạng thái Đã bán');
    return 0;
  }
  
  // Kiểm tra payments có tồn tại không
  if (!vehicle.payments) {
    console.warn('calculateDebtOnStatusChange: vehicle.payments là undefined, sử dụng mảng rỗng');
    vehicle = {
      ...vehicle,
      payments: []
    };
  }
  
  // Tạo bản sao của mảng thanh toán để không ảnh hưởng đến dữ liệu gốc
  const allPayments = [...vehicle.payments];
  
  // Nếu có thanh toán mới, thêm vào danh sách để tính toán
  if (paymentAmount > 0) {
    const paymentType = getPaymentType(vehicle.status, newStatus);
    const newPayment: PaymentInfo = {
      amount: paymentAmount,
      date: new Date(),
      type: paymentType,
      notes: `Thanh toán khi chuyển từ ${vehicle.status} sang ${newStatus}`
    };
    allPayments.push(newPayment);
  }
  
  // Tính toán công nợ dựa trên tất cả các khoản thanh toán
  const debt = calculateDebt(vehicle.sellPrice, allPayments);
  
  // Chi tiết tính toán công nợ theo loại thanh toán
  const depositAmount = allPayments
    .filter(p => p.type === 'DEPOSIT')
    .reduce((sum, p) => sum + p.amount, 0);
  
  const bankDepositAmount = allPayments
    .filter(p => p.type === 'BANK_DEPOSIT')
    .reduce((sum, p) => sum + p.amount, 0);
  
  const offsetAmount = allPayments
    .filter(p => p.type === 'OFFSET')
    .reduce((sum, p) => sum + p.amount, 0);
  
  const fullPaymentAmount = allPayments
    .filter(p => p.type === 'FULL_PAYMENT')
    .reduce((sum, p) => sum + p.amount, 0);
  
  // Tổng các khoản thanh toán
  const totalPaid = depositAmount + bankDepositAmount + offsetAmount + fullPaymentAmount;
  
  // Log chi tiết để kiểm tra việc tính toán
  console.log('Debt On Status Change (Chi tiết):', {
    vehicleId: vehicle.id,
    currentStatus: vehicle.status,
    newStatus,
    sellPrice: vehicle.sellPrice,
    totalPaid,
    depositAmount,
    bankDepositAmount,
    offsetAmount,
    fullPaymentAmount,
    paymentAmount,
    calculatedDebt: debt
  });
  
  return debt;
}

// Hàm xác định loại thanh toán
export function getPaymentType(
  fromStatus: VehicleStatus, 
  toStatus: VehicleStatus
): PaymentInfo['type'] {
  console.log(`Xác định loại thanh toán cho chuyển trạng thái: ${fromStatus} -> ${toStatus}`);
  
  // Từ Trong kho sang Đặt cọc => Thanh toán tiền đặt cọc
  if (fromStatus === VehicleStatus.IN_STOCK && toStatus === VehicleStatus.DEPOSITED) 
    return 'DEPOSIT';
  
  // Từ Trong kho sang Đặt cọc ngân hàng => Thanh toán tiền đặt cọc ngân hàng
  if (fromStatus === VehicleStatus.IN_STOCK && toStatus === VehicleStatus.BANK_DEPOSITED) 
    return 'BANK_DEPOSIT';
  
  // Từ Đặt cọc ngân hàng sang Đóng đối ứng => Thanh toán tiền đối ứng
  if (fromStatus === VehicleStatus.BANK_DEPOSITED && toStatus === VehicleStatus.OFFSET) 
    return 'OFFSET';
  
  // Bất kỳ trạng thái nào sang Đã bán => Thanh toán đầy đủ
  if (toStatus === VehicleStatus.SOLD) 
    return 'FULL_PAYMENT';
  
  // Mặc định là thanh toán tiền đặt cọc
  console.log('Không xác định được loại thanh toán cụ thể, sử dụng DEPOSIT');
  return 'DEPOSIT';
}

// Hàm tạo lịch sử trạng thái
export function createStatusHistory(
  fromStatus: VehicleStatus, 
  toStatus: VehicleStatus, 
  changedBy: string = 'System',
  notes?: string
): StatusHistory {
  return {
    fromStatus,
    toStatus,
    changedAt: new Date(),
    changedBy,
    notes
  };
}

export interface Staff {
  id: string;
  name: string;
  phone: string;
  email: string;
  team: string;
  role: string;
  status: string;
  joinDate: Date;
  leaveDate?: Date | null;
  commissionRate: number;
  baseSalary: number;
  created_at?: string;
  updated_at?: string;
}

export interface SyncAction {
  type: 'vehicle_add' | 'vehicle_update' | 'vehicle_delete' | 'staff_add' | 'staff_update' | 'staff_delete' | 'kpi_update' | 'bonus_update';
  data: any;
  timestamp?: string;
} 