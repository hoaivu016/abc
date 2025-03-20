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
        sx={{ 
          width: '100%', 
          borderRadius: 1,
          '& .MuiBottomNavigationAction-root': {
            minWidth: 'auto',
            padding: '6px 12px',
            flexDirection: 'column',
            '& .MuiBottomNavigationAction-label': {
              fontSize: '0.75rem',
              marginTop: 1
            }
          }
        }}
      >
        {visibleTabs.map(tabId => {
          const Icon = AdminIcons[tabId];
          return (
            <BottomNavigationAction
              key={tabId}
              label={TAB_LABELS[tabId]}
              value={tabId.toString()}
              icon={<Icon />}
              sx={{
                '& svg': {
                  fontSize: 24
                }
              }}
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
      sx={{ 
        borderBottom: 1, 
        borderColor: 'divider',
        '& .MuiTab-root': {
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 1,
          textTransform: 'none',
          fontWeight: 600
        }
      }}
    >
      {visibleTabs.map(tabId => {
        const Icon = AdminIcons[tabId];
        return (
          <Tab
            key={tabId}
            value={tabId}
            label={TAB_LABELS[tabId]}
            icon={<Icon />}
            iconPosition="start"
            sx={{
              '& svg': {
                fontSize: 20,
                mr: 1
              }
            }}
          />
        );
      })}
    </Tabs>
  );
};

export default TabNavigation; 