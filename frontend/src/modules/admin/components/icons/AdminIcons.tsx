import React from 'react';
import SettingsIcon from '@mui/icons-material/Settings';
import PeopleIcon from '@mui/icons-material/People';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SecurityIcon from '@mui/icons-material/Security';
import { AdminTabsEnum } from '../../types/admin.enums';

export const AdminIcons: Record<AdminTabsEnum, React.FC> = {
  [AdminTabsEnum.STAFF]: PeopleIcon,
  [AdminTabsEnum.CONFIG]: SettingsIcon,
  [AdminTabsEnum.PERMISSIONS]: SecurityIcon,
  [AdminTabsEnum.REPORTS]: AssessmentIcon
}; 