import React, { useMemo } from 'react';
import {
  Grid,
  Card,
  CardHeader,
  CardContent,
  Typography,
  Divider,
  Box,
  useTheme
} from '@mui/material';
import { formatCurrency } from '../../../../../utils/formatters';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS } from 'chart.js';

interface CapitalMetrics {
  loanReturnRate: number;
  capitalCostRate: number;
  loanTurnover: number;
  capitalAmount: number;
  loanAmount: number;
  interestCost: number;
  totalProfit: number;
}

interface CapitalEfficiencyProps {
  metrics: CapitalMetrics;
}

interface MetricItem {
  label: string;
  value: string;
}

const COLORS = ['#1976d2', '#2e7d32', '#ed6c02'];

const CapitalEfficiency: React.FC<CapitalEfficiencyProps> = ({ metrics }) => {
  const theme = useTheme();
  
  const efficiencyMetrics = useMemo(() => [
    { label: 'Tỷ suất sinh lời vốn vay:', value: `${metrics.loanReturnRate.toFixed(2)}%` },
    { label: 'Chi phí vốn:', value: `${metrics.capitalCostRate.toFixed(2)}%` },
    { label: 'Vòng quay vốn vay:', value: `${metrics.loanTurnover.toFixed(2)} lần` }
  ], [metrics.loanReturnRate, metrics.capitalCostRate, metrics.loanTurnover]);

  const capitalMetrics = useMemo(() => [
    { label: 'Tổng vốn đầu tư:', value: formatCurrency(metrics.capitalAmount) },
    { label: 'Vốn vay:', value: formatCurrency(metrics.loanAmount) },
    { 
      label: 'Tỷ lệ vốn vay/tổng vốn:', 
      value: `${metrics.capitalAmount > 0 
        ? ((metrics.loanAmount / metrics.capitalAmount) * 100).toFixed(2) 
        : '0.00'}%`
    },
    { label: 'Chi phí lãi vay:', value: formatCurrency(metrics.interestCost) },
    { 
      label: 'Lợi nhuận sau lãi vay:', 
      value: formatCurrency(metrics.totalProfit - metrics.interestCost)
    }
  ], [metrics.capitalAmount, metrics.loanAmount, metrics.interestCost, metrics.totalProfit]);

  const pieChartData = useMemo(() => ({
    labels: ['Vốn vay', 'Vốn tự có', 'Lợi nhuận'],
    datasets: [
      {
        data: [
          metrics.loanAmount,
          metrics.capitalAmount - metrics.loanAmount,
          metrics.totalProfit
        ],
        backgroundColor: COLORS,
        borderColor: COLORS,
        borderWidth: 1,
      },
    ],
  }), [metrics.loanAmount, metrics.capitalAmount, metrics.totalProfit]);

  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const value = context.raw as number;
            return `${context.label}: ${formatCurrency(value)}`;
          },
        },
      },
    },
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card 
          sx={{ 
            height: '100%',
            boxShadow: theme.shadows[1],
            '&:hover': {
              boxShadow: theme.shadows[4]
            }
          }}
        >
          <CardHeader 
            title={
              <Typography variant="h6" color="primary">
                Chỉ Số Hiệu Quả Sử Dụng Vốn
              </Typography>
            }
            sx={{ pb: 1 }}
          />
          <Divider />
          <CardContent>
            <Grid container spacing={2}>
              {efficiencyMetrics.map((metric: MetricItem, index: number) => (
                <Grid item xs={12} key={index}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={6}>
                      <Typography variant="subtitle1" color="text.secondary">
                        {metric.label}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body1" fontWeight="medium">
                        {metric.value}
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <Card 
          sx={{ 
            height: '100%',
            boxShadow: theme.shadows[1],
            '&:hover': {
              boxShadow: theme.shadows[4]
            }
          }}
        >
          <CardHeader 
            title={
              <Typography variant="h6" color="primary">
                Phân Tích Vốn
              </Typography>
            }
            sx={{ pb: 1 }}
          />
          <Divider />
          <CardContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <Box sx={{ width: '100%', maxWidth: 400 }}>
                  <Pie data={pieChartData} options={pieChartOptions} />
                </Box>
              </Box>
              <Grid container spacing={2}>
                {capitalMetrics.map((metric: MetricItem, index: number) => (
                  <Grid item xs={12} key={index}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={6}>
                        <Typography variant="subtitle1" color="text.secondary">
                          {metric.label}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body1" fontWeight="medium">
                          {metric.value}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default CapitalEfficiency; 