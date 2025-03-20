/**
 * Các hàm định dạng cho ứng dụng
 */

/**
 * Định dạng số thành dạng tiền tệ (VND)
 * @param value - Giá trị cần định dạng
 * @param showSymbol - Có hiển thị ký hiệu tiền tệ hay không
 * @returns Chuỗi đã định dạng
 */
export const formatCurrency = (value: number | undefined | null, showSymbol = true): string => {
  if (value === undefined || value === null) return '-';
  
  const formatter = new Intl.NumberFormat('vi-VN', {
    style: showSymbol ? 'currency' : 'decimal',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
  
  return formatter.format(value);
};

/**
 * Định dạng số thành chuỗi có dấu phân cách hàng nghìn
 * @param value Số cần định dạng
 * @param decimalPlaces Số chữ số thập phân (mặc định: 0)
 * @returns Chuỗi đã định dạng
 */
export const formatNumber = (value: number, decimalPlaces: number = 0): string => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0';
  }
  
  return value
    .toFixed(decimalPlaces)
    .replace(/\d(?=(\d{3})+(?!\d))/g, '$&.'); // Sử dụng dấu . làm dấu phân cách hàng nghìn
};

/**
 * Phân tích chuỗi đã định dạng và chuyển về số
 * @param formattedValue - Chuỗi đã định dạng
 * @returns Giá trị số
 */
export const parseFormattedNumber = (formattedValue: string): number => {
  if (!formattedValue) return 0;
  
  try {
    // Loại bỏ tất cả ký tự không phải số (sử dụng \D để loại bỏ tất cả ký tự không phải số)
    const numericValue = formattedValue.replace(/\D/g, '');
    
    // Xử lý chuỗi số lớn
    if (numericValue.length > 15) {
      console.warn('Số quá lớn, có thể gây mất độ chính xác:', numericValue);
    }
    
    // Chuyển đổi thành số nguyên
    return parseInt(numericValue, 10) || 0;
  } catch (error) {
    console.error('Lỗi khi phân tích số:', error);
    return 0;
  }
};

/**
 * Định dạng ngày tháng thành chuỗi DD/MM/YYYY
 * @param date Đối tượng Date cần định dạng
 * @returns Chuỗi ngày tháng đã định dạng
 */
export const formatDate = (date: Date | null | undefined): string => {
  if (!date) return '';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  
  return `${day}/${month}/${year}`;
};

/**
 * Định dạng phần trăm
 * @param value Giá trị cần định dạng
 * @param decimalPlaces Số chữ số thập phân (mặc định: 2)
 * @returns Chuỗi phần trăm đã định dạng
 */
export const formatPercent = (value: number, decimalPlaces: number = 2): string => {
  return `${formatNumber(value, decimalPlaces)}%`;
}; 