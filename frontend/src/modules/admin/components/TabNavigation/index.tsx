import React from 'react';
import { Tabs, Tab, BottomNavigation, BottomNavigationAction } from '@mui/material';
import { TAB_LABELS } from '../../constants/adminConstants';
import { AdminTabsEnum } from '../../types/admin.enums';
import { AdminIcons } from '../icons/AdminIcons';

interface TabNavigationProps {
  currentTab: AdminTabsEnum;
  isMobile: boolean;
  visibleTabs: AdminTabsEnum[];
  onTabChange: (newValue: AdminTabsEnum) => void;
}

const TabNavigation: React.FC<TabNavigationProps> = ({
  currentTab,
  isMobile,
  visibleTabs,
  onTabChange
}) => {
  const handleMobileChange = (_: unknown, value: string) => {
    onTabChange(parseInt(value) as AdminTabsEnum);
  };

  const handleDesktopChange = (_: unknown, value: number) => {
    onTabChange(value as AdminTabsEnum);
  };

  if (isMobile) {
    return (
      <BottomNavigation
        value={currentTab.toString()}
        onChange={handleMobileChange}
        showLabels
        sx={{ width: '100%', borderRadius: 1 }}
      >
        {visibleTabs.map(tabId => {
          const Icon = AdminIcons[tabId];
          return (
            <BottomNavigationAction
              key={tabId}
              label={TAB_LABELS[tabId]}
              value={tabId.toString()}
              icon={<Icon />}
            />
          );
        })}
      </BottomNavigation>
    );
  }

  return (
    <Tabs
      value={currentTab}
      onChange={handleDesktopChange}
      indicatorColor="primary"
      textColor="primary"
      variant="fullWidth"
      sx={{ borderBottom: 1, borderColor: 'divider' }}
    >
      {visibleTabs.map(tabId => (
        <Tab
          key={tabId}
          label={TAB_LABELS[tabId]}
          value={tabId}
        />
      ))}
    </Tabs>
  );
};

export default TabNavigation; 