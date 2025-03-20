import React, { useState, useEffect, useMemo } from 'react';
import {
  Container,
  Box,
  Tab,
  Tabs,
  Typography,
  Grid,
  MenuItem,
  TextField,
  Paper,
  Skeleton,
  Button,
  Card,
  CardContent,
  Divider,
  Chip,
  IconButton
} from '@mui/material';
import { getAllVehicles } from '../../../../store/slices/vehicleSlice';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../store';
import { AppDispatch } from '../../../../store';
import ReportSummary from '../../components/ReportSummary';
import { formatCurrency } from '../../../../utils/formatters';
import { Vehicle, VehicleStatus } from '../../../../types/vehicles/vehicle';
import { Bar, Line } from 'react-chartjs-2';
import InventoryTab from '../../components/InventoryTab';
import SalesChart from '../../components/SalesChart';
import StorageTimeChart from '../../components/StorageTimeChart';
import DownloadIcon from '@mui/icons-material/Download';
import PrintIcon from '@mui/icons-material/Print';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { Chart as ChartJS } from 'chart.js';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

function getMonthName(month: number): string {
  const monthNames = [
    "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
    "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
  ];
  return monthNames[month];
}

const Report: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { vehicles, loading } = useSelector((state: RootState) => state.vehicles);
  const [value, setValue] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    dispatch(getAllVehicles() as any);
  }, [dispatch]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const handleMonthChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedMonth(Number(event.target.value));
  };

  const handleYearChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedYear(Number(event.target.value));
  };

  const handleExportReport = () => {
    alert('Chức năng xuất báo cáo đang được phát triển');
  };

  const handlePrintReport = () => {
    window.print();
  };

  const reportData = useMemo(() => {
    if (!vehicles) return {
      importedCount: 0,
      soldCount: 0,
      totalRevenue: 0,
      totalProfit: 0,
      averageProfit: 0,
      stockCount: 0,
      depositCount: 0,
      averageStorageTime: 0
    };
    
    // Lọc xe theo tháng được chọn
    const filteredVehicles = vehicles.filter((vehicle: Vehicle) => {
      // Chuyển đổi chuỗi thành đối tượng Date
      const importDate = new Date(vehicle.importDate);
      const exportDate = vehicle.exportDate ? new Date(vehicle.exportDate) : null;
      
      // Xe đã nhập kho
      const imported = importDate.getMonth() === selectedMonth && importDate.getFullYear() === selectedYear;
      
      // Xe đã xuất kho trong tháng được chọn
      const exported = exportDate && 
        exportDate.getMonth() === selectedMonth && 
        exportDate.getFullYear() === selectedYear;
      
      // Xe tồn kho tính đến cuối tháng được chọn
      const inStock = importDate <= new Date(selectedYear, selectedMonth + 1, 0) && 
        (!exportDate || exportDate > new Date(selectedYear, selectedMonth + 1, 0));
      
      return imported || exported || inStock;
    });
    
    // Số xe nhập trong tháng
    const importedCount = filteredVehicles.filter((v: Vehicle) => {
      const importDate = new Date(v.importDate);
      return importDate.getMonth() === selectedMonth && importDate.getFullYear() === selectedYear;
    }).length;
    
    // Số xe bán trong tháng
    const soldVehicles = filteredVehicles.filter((v: Vehicle) => {
      if (!v.exportDate) return false;
      const exportDate = new Date(v.exportDate);
      return exportDate.getMonth() === selectedMonth && exportDate.getFullYear() === selectedYear && v.status === VehicleStatus.SOLD;
    });
    
    const soldCount = soldVehicles.length;
    
    // Tổng doanh thu và lợi nhuận
    const totalRevenue = soldVehicles.reduce((sum: number, v: Vehicle) => sum + v.sellPrice, 0);
    const totalProfit = soldVehicles.reduce((sum: number, v: Vehicle) => sum + v.profit, 0);
    
    // Lợi nhuận trung bình
    const averageProfit = soldCount > 0 ? totalProfit / soldCount : 0;
    
    // Thời gian tồn kho trung bình
    const totalStorageTime = soldVehicles.reduce((sum: number, v: Vehicle) => sum + v.storageTime, 0);
    const averageStorageTime = soldCount > 0 ? totalStorageTime / soldCount : 0;
    
    // Giá trị xe trong kho và đặt cọc
    const stockVehicles = vehicles.filter((v: Vehicle) => v.status === VehicleStatus.IN_STOCK);
    const depositVehicles = vehicles.filter((v: Vehicle) => 
      v.status === VehicleStatus.DEPOSITED || 
      v.status === VehicleStatus.BANK_DEPOSITED
    );
    
    const stockValue = stockVehicles.reduce((sum: number, v: Vehicle) => sum + v.purchasePrice, 0);
    const depositValue = depositVehicles.reduce((sum: number, v: Vehicle) => sum + v.purchasePrice, 0);
    
    return {
      importedCount,
      soldCount,
      totalRevenue,
      totalProfit,
      averageProfit,
      stockCount: stockVehicles.length,
      depositCount: depositVehicles.length,
      stockValue,
      depositValue,
      averageStorageTime
    };
  }, [vehicles, selectedMonth, selectedYear]);

  const salesChartData = useMemo(() => {
    const months = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
    const year = selectedYear;
    
    // Khởi tạo mảng giá trị cho từng tháng
    const monthlySales = Array(12).fill(0);
    const monthlyRevenue = Array(12).fill(0);
    const monthlyProfit = Array(12).fill(0);
    
    if (!vehicles) return { labels: months, datasets: [] };
    
    // Tính doanh số, doanh thu và lợi nhuận theo tháng
    vehicles.forEach((vehicle: Vehicle) => {
      if (vehicle.status === VehicleStatus.SOLD && vehicle.exportDate) {
        const exportDate = new Date(vehicle.exportDate);
        if (exportDate.getFullYear() === year) {
          const month = exportDate.getMonth();
          monthlySales[month]++;
          monthlyRevenue[month] += vehicle.sellPrice;
          monthlyProfit[month] += vehicle.profit;
        }
      }
    });
    
    return {
      labels: months,
      datasets: [
        {
          type: 'bar' as const,
          label: 'Doanh số (xe)',
          data: monthlySales,
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
          borderColor: 'rgb(53, 162, 235)',
          borderWidth: 1
        },
        {
          type: 'bar' as const,
          label: 'Doanh thu (VNĐ)',
          data: monthlyRevenue,
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          borderColor: 'rgb(255, 99, 132)',
          borderWidth: 1,
          yAxisID: 'y'
        },
        {
          type: 'bar' as const,
          label: 'Lợi nhuận (VNĐ)',
          data: monthlyProfit,
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          borderColor: 'rgb(75, 192, 192)',
          borderWidth: 1
        }
      ]
    };
  }, [vehicles, selectedYear]);

  const storageTimeChartData = useMemo(() => {
    const months = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
    const year = selectedYear;
    
    // Khởi tạo mảng giá trị cho từng tháng
    const monthlyStorageTime = Array(12).fill(0);
    const monthlySoldCount = Array(12).fill(0);
    
    if (!vehicles) return { labels: months, datasets: [] };
    
    // Tính thời gian tồn kho theo tháng
    vehicles.forEach((vehicle: Vehicle) => {
      if (vehicle.status === VehicleStatus.SOLD && vehicle.exportDate) {
        const exportDate = new Date(vehicle.exportDate);
        if (exportDate.getFullYear() === year) {
          const month = exportDate.getMonth();
          monthlyStorageTime[month] += vehicle.storageTime;
          monthlySoldCount[month]++;
        }
      }
    });
    
    return {
      labels: months,
      datasets: [
        {
          label: 'Thời gian tồn kho trung bình (ngày)',
          data: monthlyStorageTime.map((value, index) => monthlySoldCount[index] > 0 ? value / monthlySoldCount[index] : 0),
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
          tension: 0.3
        }
      ]
    };
  }, [vehicles, selectedYear]);

  return (
    <Container maxWidth="xl" sx={{ mb: 5 }}>
      <Card sx={{ mt: 4, mb: 3, p: 2, boxShadow: 3 }}>
        <CardContent>
          <Grid container alignItems="center" justifyContent="space-between">
            <Grid item>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
                Báo Cáo Quản Lý Xe
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <CalendarTodayIcon fontSize="small" sx={{ mr: 1 }} />
                <Typography variant="subtitle1" color="text.secondary">
                  {getMonthName(selectedMonth)} {selectedYear}
                </Typography>
              </Box>
            </Grid>
            <Grid item>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    select
                    label="Tháng"
                    value={selectedMonth}
                    onChange={handleMonthChange}
                    variant="outlined"
                    size="small"
                  >
                    {Array.from({ length: 12 }, (_, i) => (
                      <MenuItem key={i} value={i}>
                        Tháng {i + 1}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    select
                    label="Năm"
                    value={selectedYear}
                    onChange={handleYearChange}
                    variant="outlined"
                    size="small"
                  >
                    {Array.from({ length: 5 }, (_, i) => (
                      <MenuItem key={i} value={new Date().getFullYear() - 2 + i}>
                        {new Date().getFullYear() - 2 + i}
                      </MenuItem>
                    ))}
                  </TextField>
                </Box>
                <Button 
                  variant="contained" 
                  startIcon={<PrintIcon />} 
                  onClick={handlePrintReport}
                >
                  In Báo Cáo
                </Button>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'right', mt: 1 }}>
                Dữ liệu báo cáo đã được đồng bộ với cài đặt thời gian chung
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={3}>
          <Card sx={{ boxShadow: 2 }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Tổng số xe đã bán
              </Typography>
              <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
                {reportData.soldCount}
                <Typography variant="caption" sx={{ ml: 1 }}>xe</Typography>
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card sx={{ boxShadow: 2 }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Doanh thu
              </Typography>
              <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
                {formatCurrency(reportData.totalRevenue)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card sx={{ boxShadow: 2 }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Lợi nhuận
              </Typography>
              <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
                {formatCurrency(reportData.totalProfit)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card sx={{ boxShadow: 2 }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Xe trong kho
              </Typography>
              <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
                {reportData.stockCount}
                <Typography variant="caption" sx={{ ml: 1 }}>xe</Typography>
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Paper sx={{ boxShadow: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={value} 
            onChange={handleTabChange} 
            aria-label="report tabs"
            variant="scrollable"
            scrollButtons="auto"
            sx={{ 
              '& .MuiTab-root': { 
                fontWeight: 'bold',
                py: 2
              } 
            }}
          >
            <Tab label="Tổng quan" {...a11yProps(0)} />
            <Tab label="Tồn kho" {...a11yProps(1)} />
            <Tab label="Doanh số & Lợi nhuận" {...a11yProps(2)} />
            <Tab label="Thời gian tồn kho" {...a11yProps(3)} />
          </Tabs>
        </Box>
        
        <TabPanel value={value} index={0}>
          {loading ? (
            <Skeleton variant="rectangular" height={200} />
          ) : (
            <ReportSummary
              importedCount={reportData.importedCount}
              soldCount={reportData.soldCount}
              totalRevenue={reportData.totalRevenue}
              totalProfit={reportData.totalProfit}
              averageProfit={reportData.averageProfit}
              stockCount={reportData.stockCount}
              depositCount={reportData.depositCount}
              averageStorageTime={reportData.averageStorageTime}
            />
          )}
        </TabPanel>
        
        <TabPanel value={value} index={1}>
          {loading ? (
            <Skeleton variant="rectangular" height={400} />
          ) : (
            <InventoryTab 
              vehicles={vehicles || []}
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
            />
          )}
        </TabPanel>
        
        <TabPanel value={value} index={2}>
          {loading ? (
            <Skeleton variant="rectangular" height={400} />
          ) : (
            <SalesChart 
              data={salesChartData}
              formatCurrency={formatCurrency}
            />
          )}
        </TabPanel>
        
        <TabPanel value={value} index={3}>
          {loading ? (
            <Skeleton variant="rectangular" height={400} />
          ) : (
            <StorageTimeChart 
              data={storageTimeChartData}
              formatCurrency={formatCurrency}
            />
          )}
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default Report; 