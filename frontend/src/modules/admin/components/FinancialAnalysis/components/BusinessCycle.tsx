import React, { useMemo } from 'react';
import {
  Grid,
  Card,
  CardHeader,
  CardContent,
  Typography,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  useTheme
} from '@mui/material';
import { formatCurrency } from '../../../../../utils/formatters';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS } from 'chart.js';

interface CycleAnalysis {
  range: string;
  count: number;
  avgProfit: number;
  roi: number;
}

interface CycleMetrics {
  avgStorageTime: number;
  quickSaleRate: number;
  cycleROI: number;
  dailyReturnRate: number;
  cycleAnalysis: CycleAnalysis[];
}

interface BusinessCycleProps {
  metrics: CycleMetrics;
}

interface MetricItem {
  label: string;
  value: string;
}

const COLORS = ['#1976d2', '#2e7d32', '#ed6c02', '#9c27b0'];

const BusinessCycle: React.FC<BusinessCycleProps> = ({ metrics }) => {
  const theme = useTheme();
  
  const cycleMetrics = useMemo(() => [
    { label: 'Chu kỳ mua-bán TB:', value: `${metrics.avgStorageTime.toFixed(1)} ngày` },
    { label: 'Tỷ lệ bán nhanh:', value: `${metrics.quickSaleRate.toFixed(2)}%` }
  ], [metrics.avgStorageTime, metrics.quickSaleRate]);

  const efficiencyMetrics = useMemo(() => [
    { label: 'ROI theo chu kỳ:', value: `${metrics.cycleROI.toFixed(2)}` },
    { label: 'Tỷ suất sinh lời/ngày:', value: `${formatCurrency(metrics.dailyReturnRate)} VNĐ` }
  ], [metrics.cycleROI, metrics.dailyReturnRate]);

  const barChartData = useMemo(() => ({
    labels: metrics.cycleAnalysis.map(cycle => cycle.range),
    datasets: [
      {
        label: 'Lợi nhuận trung bình',
        data: metrics.cycleAnalysis.map(cycle => cycle.avgProfit),
        backgroundColor: COLORS[0],
        borderColor: COLORS[0],
        borderWidth: 1,
      },
      {
        label: 'ROI (%)',
        data: metrics.cycleAnalysis.map(cycle => cycle.roi),
        backgroundColor: COLORS[1],
        borderColor: COLORS[1],
        borderWidth: 1,
      }
    ],
  }), [metrics.cycleAnalysis]);

  const barChartOptions = {
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
            return `${context.dataset.label}: ${context.dataset.label.includes('ROI') 
              ? value.toFixed(2) + '%'
              : formatCurrency(value)}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: number) => {
            if (value >= 1000000) {
              return `${(value / 1000000).toFixed(1)}M`;
            }
            if (value >= 1000) {
              return `${(value / 1000).toFixed(1)}K`;
            }
            return value;
          }
        }
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
                Chỉ Số Chu Kỳ Mua-Bán
              </Typography>
            }
            sx={{ pb: 1 }}
          />
          <Divider />
          <CardContent>
            <Grid container spacing={2}>
              {cycleMetrics.map((metric: MetricItem, index: number) => (
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
                Chỉ Số Hiệu Quả Theo Chu Kỳ
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
      
      <Grid item xs={12}>
        <Card 
          sx={{ 
            boxShadow: theme.shadows[1],
            '&:hover': {
              boxShadow: theme.shadows[4]
            }
          }}
        >
          <CardHeader 
            title={
              <Typography variant="h6" color="primary">
                Phân Tích Hiệu Quả Theo Chu Kỳ
              </Typography>
            }
            sx={{ pb: 1 }}
          />
          <Divider />
          <CardContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <Box sx={{ width: '100%', maxWidth: 800 }}>
                  <Bar data={barChartData} options={barChartOptions} />
                </Box>
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Khoảng thời gian</TableCell>
                      <TableCell align="right">Số xe bán được</TableCell>
                      <TableCell align="right">Lợi nhuận trung bình</TableCell>
                      <TableCell align="right">ROI</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {metrics.cycleAnalysis.map((cycle) => (
                      <TableRow key={cycle.range}>
                        <TableCell>{cycle.range}</TableCell>
                        <TableCell align="right">{cycle.count}</TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight="medium">
                            {formatCurrency(cycle.avgProfit)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight="medium">
                            {cycle.roi.toFixed(2)}%
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default BusinessCycle; 