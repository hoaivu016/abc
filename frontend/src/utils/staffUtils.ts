import { StaffStatus, StaffTeam } from '../types/staff/staff';

// Hàm lấy màu cho trạng thái nhân viên
export const getStatusColor = (status: StaffStatus): string => {
  switch (status) {
    case StaffStatus.ACTIVE:
      return '#4caf50'; // Xanh lá
    case StaffStatus.INACTIVE:
      return '#ff9800'; // Cam
    case StaffStatus.TERMINATED:
      return '#9e9e9e'; // Xám
    default:
      return '#9e9e9e';
  }
};

// Hàm để lấy màu cho từng đội nhóm
export const getTeamColor = (team: StaffTeam): string => {
  switch (team) {
    case StaffTeam.SALES_1:
      return 'primary.main';
    case StaffTeam.SALES_2:
      return 'info.main';
    case StaffTeam.SALES_3:
      return 'info.dark';
    case StaffTeam.ACCOUNTING:
      return 'success.main';
    case StaffTeam.MARKETING:
      return 'warning.main';
    case StaffTeam.MANAGEMENT:
      return 'secondary.main';
    case StaffTeam.OTHER:
      return 'text.secondary';
    default:
      return 'text.secondary';
  }
}; 