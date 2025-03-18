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
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface PaymentAnalysis {
  type: string;
  count: number;
  total: number;
}

interface DebtMetrics {
  installmentRate: number;
  avgDebtRecoveryTime: number;
  paymentAnalysis: PaymentAnalysis[];
}

interface DebtAnalysisProps {
  metrics: DebtMetrics;
}

const PAYMENT_TYPE_NAMES: Record<string, string> = {
  DEPOSIT: 'Đặt cọc',
  BANK_DEPOSIT: 'Đặt cọc ngân hàng',
  OFFSET: 'Đóng đối ứng',
  FULL_PAYMENT: 'Thanh toán đầy đủ'
};

const COLORS = ['#1976d2', '#2e7d32', '#ed6c02', '#9c27b0'];

const DebtAnalysis: React.FC<DebtAnalysisProps> = ({ metrics }) => {
  const theme = useTheme();
  
  const getPaymentTypeName = (type: string): string => {
    return PAYMENT_TYPE_NAMES[type] || type;
  };

  const debtMetrics = useMemo(() => [
    { label: 'Tỷ lệ bán trả góp:', value: `${metrics.installmentRate.toFixed(2)}%` },
    { label: 'Thời gian thu hồi công nợ TB:', value: `${metrics.avgDebtRecoveryTime.toFixed(1)} ngày` }
  ], [metrics.installmentRate, metrics.avgDebtRecoveryTime]);

  const pieChartData = useMemo(() => ({
    labels: metrics.paymentAnalysis.map(payment => getPaymentTypeName(payment.type)),
    datasets: [
      {
        data: metrics.paymentAnalysis.map(payment => payment.total),
        backgroundColor: COLORS,
        borderColor: COLORS,
        borderWidth: 1,
      },
    ],
  }), [metrics.paymentAnalysis]);

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
                Chỉ Số Công Nợ Khách Hàng
              </Typography>
            }
            sx={{ pb: 1 }}
          />
          <Divider />
          <CardContent>
            <Grid container spacing={2}>
              {debtMetrics.map((metric, index) => (
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
                Phân Tích Công Nợ Theo Loại Thanh Toán
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
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Loại thanh toán</TableCell>
                      <TableCell align="right">Số giao dịch</TableCell>
                      <TableCell align="right">Tổng giá trị</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {metrics.paymentAnalysis.map((payment) => (
                      <TableRow key={payment.type}>
                        <TableCell>{getPaymentTypeName(payment.type)}</TableCell>
                        <TableCell align="right">{payment.count}</TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight="medium">
                            {formatCurrency(payment.total)}
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

export default DebtAnalysis; 