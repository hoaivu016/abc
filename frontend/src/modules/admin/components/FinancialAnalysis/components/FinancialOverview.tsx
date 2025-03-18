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
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { formatCurrency } from '../../../../../utils/formatters';

ChartJS.register(ArcElement, Tooltip, Legend);

interface FinancialMetrics {
  totalVehicles: number;
  soldCount: number;
  totalRevenue: number;
  totalProfit: number;
  interestCost: number;
  avgStorageTime: number;
}

interface FinancialOverviewProps {
  metrics: FinancialMetrics;
}

interface ChartDataItem {
  name: string;
  value: number;
}

interface MetricItem {
  label: string;
  value: string;
}

const COLORS = ['#1976d2', '#2e7d32', '#ed6c02'];

const FinancialOverview: React.FC<FinancialOverviewProps> = ({ metrics }) => {
  const theme = useTheme();
  
  const chartData = useMemo(() => [
    { name: 'Lợi nhuận', value: metrics.totalProfit },
    { name: 'Chi phí lãi vay', value: metrics.interestCost },
    { name: 'Doanh thu', value: metrics.totalRevenue }
  ], [metrics.totalProfit, metrics.interestCost, metrics.totalRevenue]);

  const renderMetrics = useMemo(() => [
    { label: 'Tổng xe:', value: `${metrics.totalVehicles} xe` },
    { label: 'Xe đã bán:', value: `${metrics.soldCount} xe` },
    { label: 'Tổng doanh thu:', value: formatCurrency(metrics.totalRevenue) },
    { label: 'Tổng lợi nhuận:', value: formatCurrency(metrics.totalProfit) },
    { label: 'Chi phí lãi vay:', value: formatCurrency(metrics.interestCost) },
    { label: 'Thời gian tồn kho TB:', value: `${metrics.avgStorageTime.toFixed(1)} ngày` }
  ], [metrics]);

  const pieChartData = useMemo(() => ({
    labels: chartData.map((item: ChartDataItem) => item.name),
    datasets: [
      {
        data: chartData.map((item: ChartDataItem) => item.value),
        backgroundColor: COLORS,
        borderColor: COLORS,
        borderWidth: 1,
      },
    ],
  }), [chartData]);

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
                Chỉ Số Tài Chính Tổng Quát
              </Typography>
            }
            sx={{ pb: 1 }}
          />
          <Divider />
          <CardContent>
            <Grid container spacing={2}>
              {renderMetrics.map((metric: MetricItem, index: number) => (
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
                Phân Tích Tài Chính
              </Typography>
            }
            sx={{ pb: 1 }}
          />
          <Divider />
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <Box sx={{ width: '100%', maxWidth: 400 }}>
                <Pie data={pieChartData} options={pieChartOptions} />
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default FinancialOverview; 