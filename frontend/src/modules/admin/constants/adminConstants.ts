import type { TabConfig } from '../types/admin.types';
import { AdminIcons } from '../components/icons/AdminIcons';
import { AdminTabsEnum } from '../types/admin.enums';

export const DEFAULT_TAB = AdminTabsEnum.STAFF;

export const TAB_LABELS: Record<AdminTabsEnum, string> = {
  [AdminTabsEnum.STAFF]: 'Quản lý nhân viên',
  [AdminTabsEnum.CONFIG]: 'Cấu hình hoa hồng',
  [AdminTabsEnum.KPI]: 'KPI & Thưởng',
  [AdminTabsEnum.PERMISSIONS]: 'Phân quyền người dùng',
  [AdminTabsEnum.REPORTS]: 'Báo cáo quản trị'
};

export const MOBILE_VISIBLE_TABS: AdminTabsEnum[] = [
  AdminTabsEnum.STAFF,
  AdminTabsEnum.CONFIG,
  AdminTabsEnum.KPI
];

export const TAB_CONFIGS: TabConfig[] = Object.values(AdminTabsEnum)
  .filter((id): id is AdminTabsEnum => typeof id === 'number')
  .map(id => ({
    id,
    label: TAB_LABELS[id],
    icon: AdminIcons[id],
    mobileVisible: MOBILE_VISIBLE_TABS.includes(id)
  })); 