import { useState, useCallback } from 'react';
import { useMediaQuery, useTheme } from '@mui/material';
import { DEFAULT_TAB, MOBILE_VISIBLE_TABS } from '../constants/adminConstants';
import { AdminTabsEnum } from '../types/admin.enums';

interface UseAdminTabsReturn {
  currentTab: AdminTabsEnum;
  isMobile: boolean;
  visibleTabs: AdminTabsEnum[];
  handleTabChange: (newValue: AdminTabsEnum) => void;
}

export const useAdminTabs = (): UseAdminTabsReturn => {
  const [currentTab, setCurrentTab] = useState<AdminTabsEnum>(DEFAULT_TAB);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleTabChange = useCallback((newValue: AdminTabsEnum) => {
    setCurrentTab(newValue);
  }, []);

  const visibleTabs = isMobile ? MOBILE_VISIBLE_TABS : Object.values(AdminTabsEnum)
    .filter((id): id is AdminTabsEnum => typeof id === 'number');

  return {
    currentTab,
    isMobile,
    visibleTabs,
    handleTabChange
  };
};
