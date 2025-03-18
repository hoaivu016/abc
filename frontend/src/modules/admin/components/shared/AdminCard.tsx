import type { FC, ReactNode } from 'react';
import { Card, CardContent, CardHeader, IconButton, Typography } from '@mui/material';

interface AdminCardProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
}

const AdminCard: FC<AdminCardProps> = ({ 
  title, 
  subtitle, 
  action, 
  children 
}) => {
  return (
    <Card sx={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      '& .MuiCardHeader-root': {
        bgcolor: 'primary.main',
        color: 'primary.contrastText',
      },
      '& .MuiCardHeader-subheader': {
        color: 'primary.contrastText',
      },
    }}>
      <CardHeader
        title={<Typography variant="h6">{title}</Typography>}
        subheader={subtitle}
        action={action && (
          <IconButton color="inherit">
            {action}
          </IconButton>
        )}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        {children}
      </CardContent>
    </Card>
  );
};

export default AdminCard; 