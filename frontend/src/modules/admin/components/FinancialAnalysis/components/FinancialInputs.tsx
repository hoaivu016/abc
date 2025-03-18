import React from 'react';
import { Grid, Paper, TextField, Typography } from '@mui/material';
import { formatCurrency } from '../../../../../utils/formatters';

interface FinancialInputsProps {
  capitalAmount: number;
  loanAmount: number;
  interestRate: number;
  onInputChange: (field: string, value: number) => void;
}

const FinancialInputs: React.FC<FinancialInputsProps> = ({
  capitalAmount,
  loanAmount,
  interestRate,
  onInputChange
}) => {
  const handleNumberChange = (field: string, value: string) => {
    // Loại bỏ các ký tự không phải số và dấu chấm
    const numericValue = value.replace(/[^0-9.]/g, '');
    onInputChange(field, Number(numericValue));
  };

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Thông Tin Vốn
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Tổng vốn đầu tư (VNĐ)"
            value={formatCurrency(capitalAmount)}
            onChange={(e) => handleNumberChange('capitalAmount', e.target.value)}
            InputProps={{
              inputProps: { min: 0 }
            }}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Vốn vay (VNĐ)"
            value={formatCurrency(loanAmount)}
            onChange={(e) => handleNumberChange('loanAmount', e.target.value)}
            InputProps={{
              inputProps: { min: 0 }
            }}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Lãi suất vay (%/năm)"
            type="number"
            value={interestRate}
            onChange={(e) => onInputChange('interestRate', Number(e.target.value))}
            InputProps={{
              inputProps: { min: 0, max: 100 }
            }}
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default FinancialInputs; 