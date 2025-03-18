# Ứng Dụng Quản Lý Xe - Tài Liệu Chi Tiết

## 1. Tổng Quan Hệ Thống

### 1.1 Mục Đích
- Quản lý quy trình mua bán xe từ nhập kho đến bàn giao
- Theo dõi hiệu suất nhân viên và tính hoa hồng
- Báo cáo tài chính và thống kê

### 1.2 Đối Tượng Sử Dụng
- Admin: Quản lý toàn bộ hệ thống
- Kế toán: Quản lý tài chính, công nợ
- Nhân viên bán hàng: Quản lý xe và giao dịch

## 2. Chức Năng Chi Tiết

### 2.1 Quản Lý Xe

#### 2.1.1 Thông Tin Xe
- **Mã xe:** Format DDMM_XX (Ngày_Tháng_Số thứ tự)
- **Thông tin cơ bản:**
  - Tên xe (max 100 ký tự)
  - Năm sản xuất
  - Giá mua
  - Giá bán
  - Trạng thái
  - Nhân viên phụ trách

#### 2.1.2 Công Thức Tính Toán
```typescript
// Lợi nhuận dự kiến
lợi_nhuận = giá_bán - giá_mua - tổng_chi_phí

// Thời gian lưu kho (ngày)
thời_gian_lưu_kho = ngày_hiện_tại - ngày_nhập_kho

// Công nợ còn lại
công_nợ = giá_bán - tổng_thanh_toán
```

#### 2.1.3 Trạng Thái Xe & Màu Sắc
1. **Trong kho (#28a745)**
   - Mới nhập
   - Cho phép sửa thông tin
   - Thêm chi phí phát sinh

2. **Đặt cọc (#4DA1A9)**
   - Ghi nhận tiền cọc
   - Tính công nợ
   - Khóa thông tin cơ bản

3. **Đặt cọc ngân hàng (#79D7BE)**
   - Xử lý hồ sơ vay
   - Theo dõi tiến độ giải ngân

4. **Đóng đối ứng (#F6F4F0)**
   - Ghi nhận đối ứng
   - Cập nhật công nợ

5. **Đã bán (#2E5077)**
   - Hoàn tất hồ sơ
   - Tính KPI
   - Lưu trữ lịch sử

#### 2.1.4 Popup Trạng Thái Xe

##### 2.1.4.1 Giao diện chung
- **Layout**: Dialog Material UI, chiều rộng 600px
- **Header**: Tiêu đề hiển thị "Cập Nhật Trạng Thái: [Tên Xe]"
- **Footer**: Nút "Hủy" (trái) và "Lưu" (phải)
- **Phân vùng**: Chia thành 2-3 section tùy thuộc trạng thái

##### 2.1.4.2 Các trường dữ liệu theo trạng thái

**Chuyển sang "Đặt cọc"**:
```typescript
interface DepositFields {
  // Thông tin người mua
  buyer: {
    name: string;       // Bắt buộc
    phone: string;      // Bắt buộc
    address?: string;
    idNumber?: string;
  };
  
  // Thông tin đặt cọc
  deposit: {
    amount: number;           // Bắt buộc
    date: Date;               // Bắt buộc, mặc định ngày hiện tại
    method: 'Cash' | 'Transfer' | 'Card';
    receivedBy: string;       // Bắt buộc, mặc định là người dùng hiện tại
    note?: string;
  };
  
  // Thông tin giao dịch
  transaction: {
    finalPrice: number;       // Bắt buộc, mặc định = giá bán
    expectedDeliveryDate?: Date;
    isVAT: boolean;           // Mặc định = false
  };
}
```

**Chuyển sang "Đặt cọc ngân hàng"**:
```typescript
interface BankDepositFields extends DepositFields {
  // Thông tin ngân hàng
  bank: {
    name: string;           // Bắt buộc
    branch?: string;
    loanAmount: number;     // Bắt buộc
    interestRate?: number;
    term?: number;
    status: 'Đang xử lý' | 'Đã duyệt' | 'Từ chối';
    submissionDate: Date;   // Mặc định ngày hiện tại
  };
  
  // Tài liệu
  documents: {
    hasIdCard: boolean;
    hasHouseholdRegistration: boolean;
    hasIncomeProof: boolean;
    otherDocuments?: string;
  };
}
```

**Chuyển sang "Đóng đối ứng"**:
```typescript
interface CounterPaymentFields {
  // Thông tin đối ứng
  counterPayment: {
    amount: number;         // Bắt buộc
    date: Date;             // Bắt buộc, mặc định ngày hiện tại
    method: 'Cash' | 'Transfer' | 'Card';
    receivedBy: string;     // Bắt buộc, mặc định là người dùng hiện tại
    note?: string;
  };
  
  // Ngân hàng (nếu có)
  bankStatus?: {
    disbursementDate?: Date;
    disbursementAmount?: number;
    remainingAmount?: number;
    status: 'Chờ giải ngân' | 'Đã giải ngân một phần' | 'Đã giải ngân';
  };
}
```

**Chuyển sang "Đã bán"**:
```typescript
interface SoldFields {
  // Thông tin hoàn tất
  completion: {
    finalDeliveryDate: Date;    // Bắt buộc
    deliveredBy: string;        // Bắt buộc, mặc định là người dùng hiện tại
    registrationStatus: 'Đã đăng ký' | 'Chưa đăng ký';
    customerSatisfaction?: 1 | 2 | 3 | 4 | 5;  // Rating
    note?: string;
  };
  
  // Thanh toán cuối cùng
  finalPayment?: {
    remainingAmount: number;    // Tự động tính
    isPaid: boolean;            // Mặc định = false
    paymentDate?: Date;
    paymentMethod?: 'Cash' | 'Transfer' | 'Card';
  };
  
  // Hoa hồng
  commission?: {
    staffId: string;
    amount: number;
    isPaid: boolean;            // Mặc định = false
    note?: string;
  };
}
```

##### 2.1.4.3 Validation và Xử lý

**Quy tắc validation**:
- Các trường bắt buộc được đánh dấu (*) và kiểm tra trước khi submit
- Định dạng số điện thoại: 10 số, bắt đầu bằng số 0
- Số CMND/CCCD: 9 hoặc 12 số
- Giá trị tiền: Không âm, tối đa 999,999,999,999đ
- Ngày tháng: Không được chọn ngày trong tương lai (trừ ngày dự kiến giao xe)

**Xử lý chuyển trạng thái**:
```typescript
interface StatusChangeLog {
  vehicleId: string;
  fromStatus: VehicleStatus;
  toStatus: VehicleStatus;
  changeDate: Date;
  changedBy: string;
  additionalData: any; // Dữ liệu từ form
}

// Lưu lịch sử
const logStatusChange = (log: StatusChangeLog) => {
  // Lưu vào bảng vehicle_status_history
  // Cập nhật trạng thái xe trong bảng vehicles
  // Tạo các bản ghi liên quan (thanh toán, người mua, v.v.)
}
```

**Quy trình kiểm tra trước khi chuyển trạng thái**:
1. **Từ "Trong kho" sang "Đặt cọc"**:
   - Kiểm tra thông tin xe đã đầy đủ
   - Tiền cọc phải ≤ giá bán

2. **Từ "Đặt cọc" sang "Đặt cọc ngân hàng"**:
   - Yêu cầu thông tin ngân hàng
   - Số tiền vay phải < giá bán - tiền cọc

3. **Từ "Đặt cọc"/"Đặt cọc ngân hàng" sang "Đóng đối ứng"**:
   - Tổng tiền (cọc + đối ứng) phải ≥ 50% giá bán

4. **Từ "Đóng đối ứng" sang "Đã bán"**:
   - Kiểm tra tất cả công nợ đã được thanh toán
   - Tự động tính KPI và hoa hồng cho nhân viên

##### 2.1.4.4 Giao diện popup

**Thiết kế chung**:
```css
.status-dialog {
  width: 600px;
  max-width: 90vw;
  padding: 24px;
}

.status-dialog-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 16px;
  color: var(--primary);
}

.status-section {
  margin-bottom: 24px;
  padding: 16px;
  border-radius: 8px;
  background-color: #f7f9fc;
}

.status-section-title {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 12px;
  color: #333;
}

.status-form-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}
```

**Hiệu ứng và tương tác**:
- Hiển thị loading overlay khi đang lưu
- Hiển thị thông báo toast khi lưu thành công/thất bại
- Tự động cập nhật danh sách xe sau khi đóng popup
- Xác nhận khi nhấn nút hủy nếu đã có thay đổi dữ liệu

### 2.2 Quản Lý Nhân Viên

#### 2.2.1 KPI & Hoa Hồng
```typescript
// Tỷ lệ hoàn thành KPI
tỷ_lệ_KPI = (doanh_số_thực_tế / chỉ_tiêu) * 100

// Hoa hồng cơ bản
hoa_hồng = giá_bán * tỷ_lệ_hoa_hồng

// Thưởng vượt KPI
if (tỷ_lệ_KPI > 100) {
  thưởng = (tỷ_lệ_KPI - 100) * hệ_số_thưởng
}

// Tổng thu nhập
thu_nhập = lương_cơ_bản + hoa_hồng + thưởng
```

#### 2.2.2 Phân Loại Nhân Viên
1. **Sales (Bán hàng)**
   - Quản lý khách hàng
   - Bán xe
   - Theo dõi KPI

2. **Admin (Quản lý)**
   - Quản lý hệ thống
   - Phê duyệt giao dịch
   - Xem báo cáo

3. **Accounting (Kế toán)**
   - Quản lý tài chính
   - Theo dõi công nợ
   - Tính lương & hoa hồng

### 2.3 Báo Cáo & Thống Kê

#### 2.3.1 Báo Cáo Doanh Số
```typescript
// Doanh thu thuần
doanh_thu = tổng_giá_bán - tổng_chi_phí

// Tỷ suất lợi nhuận
tỷ_suất = (tổng_lợi_nhuận / tổng_giá_vốn) * 100

// Thời gian bán trung bình (ngày)
thời_gian_bán = tổng_thời_gian / số_xe_bán
```

#### 2.3.2 Báo Cáo Nhân Viên
- Top nhân viên theo doanh số
- Tỷ lệ chốt deal
- KPI theo thời gian
- So sánh hiệu suất

## 3. Giao Diện & Thiết Kế

### 3.1 Màu Sắc Chính
```css
/* Primary Colors */
--primary: rgb(60, 133, 62);
--primary-light: rgba(60, 133, 62, 0.1);
--primary-dark: #236b26;

/* Secondary Colors */
--secondary: #4CCAAA;
--secondary-light: rgba(76, 202, 170, 0.1);
--secondary-dark: #2E8876;

/* Status Colors */
--success: #28a745;
--warning: #ffa500;
--error: #dc3545;
--info: #17a2b8;
```

### 3.2 Typography
```css
/* Font Family */
--font-primary: 'Mulish', sans-serif;

/* Font Sizes */
--text-xs: 0.75rem;   /* 12px */
--text-sm: 0.875rem;  /* 14px */
--text-base: 1rem;    /* 16px */
--text-lg: 1.125rem;  /* 18px */
--text-xl: 1.25rem;   /* 20px */
```

### 3.3 Layout
- **Desktop (>= 992px)**
  - Sidebar: 250px
  - Content: calc(100% - 250px)
  - 2 cột form

- **Tablet (576px - 991px)**
  - Sidebar thu gọn
  - 1 cột form
  - Bảng cuộn ngang

- **Mobile (< 576px)**
  - Full width
  - Ẩn sidebar
  - Stack các thành phần

## 4. Bảo Mật & Phân Quyền

### 4.1 Xác Thực
- JWT Token
- Refresh Token
- Session timeout: 1 giờ

### 4.2 Phân Quyền
```typescript
enum UserRole {
  ADMIN = 'ADMIN',
  ACCOUNTING = 'ACCOUNTING',
  SALES = 'SALES'
}

interface Permission {
  read: boolean;
  write: boolean;
  delete: boolean;
  approve: boolean;
}

const rolePermissions: Record<UserRole, Permission> = {
  ADMIN: { read: true, write: true, delete: true, approve: true },
  ACCOUNTING: { read: true, write: true, delete: false, approve: true },
  SALES: { read: true, write: true, delete: false, approve: false }
}
```

## 5. Hiệu Suất & Tối Ưu

### 5.1 Frontend
- React Query cho cache data
- Memoization cho components
- Lazy loading cho routes
- Debounce cho search/filter

### 5.2 API Endpoints
- Rate limiting: 100 requests/minute
- Cache response: 5 phút
- Timeout: 30 giây
- Batch requests cho queries lớn

---
*Lưu ý: Tài liệu này phản ánh trạng thái hiện tại của ứng dụng và sẽ được cập nhật khi có thay đổi.* 