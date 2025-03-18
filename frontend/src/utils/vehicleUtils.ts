/**
 * Tạo mã xe theo định dạng DDMMXX
 * DD: ngày (2 chữ số)
 * MM: tháng (2 chữ số)
 * XX: số thứ tự (2 chữ số)
 */
export const generateVehicleId = (sequenceNumber: number = 1): string => {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const sequence = String(sequenceNumber).padStart(2, '0');
  
  return `${day}${month}${sequence}`;
};

/**
 * Kiểm tra mã xe có hợp lệ không
 * @param vehicleId Mã xe cần kiểm tra
 * @returns true nếu mã xe hợp lệ, false nếu không hợp lệ
 */
export const isValidVehicleId = (vehicleId: string): boolean => {
  if (!vehicleId) return false;
  
  // Kiểm tra độ dài
  if (vehicleId.length !== 6) return false;
  
  // Kiểm tra định dạng DDMMXX
  const day = parseInt(vehicleId.substring(0, 2));
  const month = parseInt(vehicleId.substring(2, 4));
  const sequence = parseInt(vehicleId.substring(4, 6));
  
  // Kiểm tra ngày tháng hợp lệ
  if (isNaN(day) || day < 1 || day > 31) return false;
  if (isNaN(month) || month < 1 || month > 12) return false;
  if (isNaN(sequence) || sequence < 1 || sequence > 99) return false;
  
  return true;
};

/**
 * Lấy số thứ tự lớn nhất từ danh sách mã xe trong ngày
 * @param existingIds Danh sách mã xe hiện có
 * @returns Số thứ tự lớn nhất + 1
 */
export const getNextSequenceNumber = (existingIds: string[]): number => {
  const now = new Date();
  const currentDay = String(now.getDate()).padStart(2, '0');
  const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
  const currentPrefix = `${currentDay}${currentMonth}`;
  
  // Lọc các mã xe của ngày hiện tại
  const todayIds = existingIds.filter(id => id.startsWith(currentPrefix));
  
  if (todayIds.length === 0) return 1;
  
  // Lấy số thứ tự lớn nhất
  const maxSequence = Math.max(
    ...todayIds.map(id => parseInt(id.substring(4, 6)))
  );
  
  return maxSequence + 1;
}; 