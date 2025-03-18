import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  Paper, 
  Typography, 
  Box, 
  TableContainer, 
  Table, 
  TableHead, 
  TableBody, 
  TableRow, 
  TableCell,
  Grid,
  Card,
  CardContent,
  Divider,
  useMediaQuery,
  FormControl,
  TextField,
  IconButton,
  Tooltip
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { formatCurrency, formatDate } from '../../../../utils/formatters';
import { Vehicle, VehicleStatus, calculateProfit, calculateStorageTime } from '../../../../types/vehicles/vehicle';
import { Staff } from '../../../../types/staff/staff';
import { KpiTarget, KpiTargetType, calculateKpiCompletion, calculateSalesBonus } from '../../../../models/kpi';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import EqualizerIcon from '@mui/icons-material/Equalizer';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import BarChartIcon from '@mui/icons-material/BarChart';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

// TabPanel interface và component
interface TabPanelProps {
  children?: any;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`report-tabpanel-${index}`}
      aria-labelledby={`report-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Props cho component báo cáo
interface ReportProps {
  vehicles: Vehicle[];
  staffList: Staff[];
  kpiList: KpiTarget[];
  selectedMonth?: number;
  selectedYear?: number;
  onDateChange?: (month: number, year: number) => void;
}

const Report: React.FC<ReportProps> = ({ 
  vehicles, 
  staffList,
  kpiList,
  selectedMonth: propSelectedMonth, 
  selectedYear: propSelectedYear, 
  onDateChange 
}) => {
  const [selectedMonth, setSelectedMonth] = useState(propSelectedMonth || new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(propSelectedYear || new Date().getFullYear());
  const [monthYearString, setMonthYearString] = useState(`Tháng ${selectedMonth}/${selectedYear}`);
  
  useEffect(() => {
    if (propSelectedMonth && propSelectedYear) {
      setSelectedMonth(propSelectedMonth);
      setSelectedYear(propSelectedYear);
      setMonthYearString(`Tháng ${propSelectedMonth}/${propSelectedYear}`);
    }
  }, [propSelectedMonth, propSelectedYear]);
  
  // Theme và media query
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Chuyển getDaysInMonth thành useCallback
  const getDaysInMonth = useCallback((month: number, year: number) => {
    return new Date(year, month, 0).getDate();
  }, []);

  // Sử dụng useMemo để tính toán dữ liệu báo cáo khi vehicles, selectedMonth hoặc selectedYear thay đổi
  const {
    monthlyReport,
    longestStorageVehicles,
    highestProfitVehicles,
    profitPercentage,
    vehicleStatusCounts,
    totalRevenue,
    totalProfit,
    averageProfit,
    averageStorageDays
  } = useMemo(() => {
    if (!vehicles || vehicles.length === 0) {
      return { 
        monthlyReport: { inStock: 0, deposited: 0, sold: 0 },
        longestStorageVehicles: [],
        highestProfitVehicles: [],
        profitPercentage: '0',
        vehicleStatusCounts: {
          [VehicleStatus.IN_STOCK]: 0,
          [VehicleStatus.DEPOSITED]: 0,
          [VehicleStatus.BANK_DEPOSITED]: 0,
          [VehicleStatus.OFFSET]: 0,
          [VehicleStatus.SOLD]: 0
        },
        totalRevenue: 0,
        totalProfit: 0,
        averageProfit: 0,
        averageStorageDays: 0
      };
    }

    // 1. Lọc dữ liệu theo tháng và năm
    const lastDayOfMonth = getDaysInMonth(selectedMonth, selectedYear);
    const endOfMonth = new Date(selectedYear, selectedMonth - 1, lastDayOfMonth, 23, 59, 59);
    
    // Xe trong kho tại thời điểm cuối tháng được chọn
    const inStockVehicles = vehicles.filter(vehicle => {
      const importDate = vehicle.importDate ? new Date(vehicle.importDate) : null;
      
      // Xe phải có ngày nhập không muộn hơn ngày cuối tháng
      const importedBeforeEndOfMonth = importDate && importDate <= endOfMonth;
      
      // Xe chưa được xuất hoặc được xuất sau ngày cuối tháng
      const notExportedOrExportedAfterMonth = !vehicle.exportDate || new Date(vehicle.exportDate) > endOfMonth;
      
      return importedBeforeEndOfMonth && notExportedOrExportedAfterMonth;
    });
    
    // Xe được xuất trong tháng đã chọn
    const exportedInMonth = vehicles.filter(vehicle => {
      if (!vehicle.exportDate) return false;
      
      const exportDate = new Date(vehicle.exportDate);
      return exportDate.getMonth() + 1 === selectedMonth && 
             exportDate.getFullYear() === selectedYear;
    });
    
    // 2. Tính toán báo cáo tháng
    const inStock = inStockVehicles.filter(v => v.status === VehicleStatus.IN_STOCK).length;
    const deposited = inStockVehicles.filter(v => 
      v.status === VehicleStatus.DEPOSITED || 
      v.status === VehicleStatus.BANK_DEPOSITED
    ).length;
    
    // Lọc chính xác các xe bán trong tháng đã chọn
    const sold = exportedInMonth.filter(v => {
      if (v.status !== VehicleStatus.SOLD || !v.exportDate) return false;
      
      const exportDate = new Date(v.exportDate);
      return exportDate.getMonth() + 1 === selectedMonth && 
             exportDate.getFullYear() === selectedYear;
    }).length;
    
    // 3. Thống kê các xe tồn kho lâu nhất
    const longestStorage = [...inStockVehicles]
      .filter(v => v.status !== VehicleStatus.SOLD)
      .sort((a, b) => {
        const daysA = a.importDate ? calculateStorageTime(a.importDate, endOfMonth) : 0;
        const daysB = b.importDate ? calculateStorageTime(b.importDate, endOfMonth) : 0;
        return daysB - daysA;
      })
      .slice(0, 5);
    
    // 4. Thống kê xe có lợi nhuận cao nhất
    const highestProfit = [...vehicles]
      .filter(v => {
        if (v.status !== VehicleStatus.SOLD || !v.exportDate) return false;
        
        // Chỉ lấy xe bán trong tháng được chọn
        const exportDate = new Date(v.exportDate);
        return exportDate.getMonth() + 1 === selectedMonth && 
               exportDate.getFullYear() === selectedYear;
      })
      .sort((a, b) => {
        const profitA = calculateProfit(a);
        const profitB = calculateProfit(b);
        return profitB - profitA;
      })
      .slice(0, 5);
    
    // 5. Tính % lợi nhuận trung bình
    const soldVehicles = vehicles.filter(v => v.status === VehicleStatus.SOLD);
    let totalProfitPercentage = 0;
    
    soldVehicles.forEach(vehicle => {
      const totalCost = vehicle.purchasePrice + (vehicle.costs?.reduce((sum, cost) => sum + cost.amount, 0) || 0);
      if (totalCost > 0 && vehicle.sellPrice) {
        const profit = vehicle.sellPrice - totalCost;
        totalProfitPercentage += (profit / totalCost) * 100;
      }
    });
    
    const avgProfitPercentage = soldVehicles.length > 0 
      ? (totalProfitPercentage / soldVehicles.length).toFixed(2)
      : '0';

    // 6. Thống kê số lượng xe theo trạng thái
    const statusCounts = {
      [VehicleStatus.IN_STOCK]: 0,
      [VehicleStatus.DEPOSITED]: 0,
      [VehicleStatus.BANK_DEPOSITED]: 0,
      [VehicleStatus.OFFSET]: 0,
      [VehicleStatus.SOLD]: 0
    };
    
    vehicles.forEach(vehicle => {
      statusCounts[vehicle.status]++;
    });
    
    // 7. Tính tổng doanh thu, lợi nhuận và số liệu khác
    let revenue = 0;
    let profit = 0;
    let totalStorageDays = 0;
    let totalVehicles = 0;
    
    // Tính thời gian tồn kho cho tất cả xe trong kho tại thời điểm cuối tháng
    inStockVehicles.forEach(vehicle => {
      if (vehicle.importDate) {
        totalStorageDays += calculateStorageTime(vehicle.importDate, endOfMonth);
        totalVehicles++;
      }
    });
    
    // Chỉ tính doanh thu và lợi nhuận từ xe bán trong tháng được chọn
    const soldVehiclesInSelectedMonth = soldVehicles.filter(vehicle => {
      if (!vehicle.exportDate) return false;
      const exportDate = new Date(vehicle.exportDate);
      return exportDate.getMonth() + 1 === selectedMonth && 
             exportDate.getFullYear() === selectedYear;
    });
    
    soldVehiclesInSelectedMonth.forEach(vehicle => {
      if (vehicle.sellPrice) {
        revenue += vehicle.sellPrice;
        profit += calculateProfit(vehicle);
      }
    });
    
    const avgProfit = soldVehiclesInSelectedMonth.length > 0 ? profit / soldVehiclesInSelectedMonth.length : 0;
    const avgStorageDays = totalVehicles > 0 ? totalStorageDays / totalVehicles : 0;

    return {
      monthlyReport: { inStock, deposited, sold },
      longestStorageVehicles: longestStorage,
      highestProfitVehicles: highestProfit,
      profitPercentage: avgProfitPercentage,
      vehicleStatusCounts: statusCounts,
      totalRevenue: revenue,
      totalProfit: profit,
      averageProfit: avgProfit,
      averageStorageDays: avgStorageDays
    };
  }, [vehicles, selectedMonth, selectedYear, getDaysInMonth]);

  // Thêm useEffect để log dữ liệu khi tháng/năm thay đổi
  useEffect(() => {
    console.log(`Báo cáo tháng ${selectedMonth}/${selectedYear}`);
    console.log('Dữ liệu tính toán:', {
      'Số xe đã bán trong tháng': monthlyReport.sold,
      'Doanh thu': totalRevenue,
      'Lợi nhuận': totalProfit,
      'Xe có lợi nhuận cao nhất': highestProfitVehicles.map(v => ({
        id: v.id,
        exportDate: v.exportDate,
        profit: calculateProfit(v)
      }))
    });
  }, [selectedMonth, selectedYear, monthlyReport, totalRevenue, totalProfit, highestProfitVehicles]);

  const handleDateChange = (month: number, year: number) => {
    setSelectedMonth(month);
    setSelectedYear(year);
    if (onDateChange) {
      onDateChange(month, year);
    }
  };

  // Tính toán dữ liệu KPI, lương và thưởng cho nhân viên
  const staffSalaryData = useMemo(() => {
    // Tính số xe bán được của từng nhân viên trong tháng
    const staffSalesMap: Record<string, number> = {};
    vehicles
      .filter(vehicle => {
        if (!vehicle.exportDate || vehicle.status !== VehicleStatus.SOLD || !vehicle.saleStaff?.id) return false;
        const exportDate = new Date(vehicle.exportDate);
        return exportDate.getMonth() + 1 === selectedMonth && 
               exportDate.getFullYear() === selectedYear;
      })
      .forEach(vehicle => {
        const staffId = vehicle.saleStaff.id;
        if (!staffSalesMap[staffId]) {
          staffSalesMap[staffId] = 0;
        }
        staffSalesMap[staffId]++;
      });

    // Lấy KPI của tháng hiện tại
    const currentKpis = kpiList.filter(kpi => 
      kpi.month === selectedMonth && kpi.year === selectedYear
    );

    // Tính toán dữ liệu cho từng nhân viên
    const staffData = staffList.map(staff => {
      // Tìm KPI của nhân viên
      const staffKpi = currentKpis.find(kpi => 
        kpi.targetType === KpiTargetType.INDIVIDUAL && kpi.targetId === staff.id
      );

      // Số xe đã bán
      const vehiclesSold = staffSalesMap[staff.id] || 0;

      // Tính % hoàn thành KPI
      const kpiCompletion = staffKpi 
        ? calculateKpiCompletion(staffKpi.targetValue, vehiclesSold)
        : 0;

      // Tính thưởng
      const bonus = staffKpi 
        ? calculateSalesBonus({ ...staffKpi, actualValue: vehiclesSold })
        : 0;

      // Tổng thu nhập = Lương + Thưởng
      const totalIncome = staff.salary + bonus;

      return {
        id: staff.id,
        name: staff.name,
        team: staff.team,
        kpiTarget: staffKpi?.targetValue || 0,
        kpiActual: vehiclesSold,
        baseSalary: staff.salary,
        bonus,
        totalIncome
      };
    });

    // Tính tổng các cột
    const totals = staffData.reduce((acc, staff) => ({
      kpiTarget: acc.kpiTarget + staff.kpiTarget,
      kpiActual: acc.kpiActual + staff.kpiActual,
      baseSalary: acc.baseSalary + staff.baseSalary,
      bonus: acc.bonus + staff.bonus,
      totalIncome: acc.totalIncome + staff.totalIncome
    }), {
      kpiTarget: 0,
      kpiActual: 0,
      baseSalary: 0,
      bonus: 0,
      totalIncome: 0
    });

    return { staffData, totals };
  }, [vehicles, staffList, kpiList, selectedMonth, selectedYear]);

  // Render component theo kích thước màn hình
  // Phần hiển thị báo cáo tổng quan
  const renderOverviewReport = () => {
    return (
      <Grid container spacing={3}>
        {/* Thẻ tổng quan */}
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="primary" gutterBottom>
                <QueryStatsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Tổng quan
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body1">
                Số xe trong kho: <strong>{monthlyReport.inStock}</strong>
              </Typography>
              <Typography variant="body1">
                Số xe đã đặt cọc: <strong>{monthlyReport.deposited}</strong>
              </Typography>
              <Typography variant="body1">
                Số xe đã bán trong tháng: <strong>{monthlyReport.sold}</strong>
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Thẻ doanh thu & lợi nhuận */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="primary" gutterBottom>
                <AttachMoneyIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Doanh thu & Lợi nhuận
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body1">
                Tổng doanh thu: <strong>{formatCurrency(totalRevenue)}</strong>
              </Typography>
              <Typography variant="body1">
                Tổng lợi nhuận: <strong>{formatCurrency(totalProfit)}</strong>
              </Typography>
              <Typography variant="body1">
                Lợi nhuận TB/xe: <strong>{formatCurrency(averageProfit)}</strong>
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Thẻ thời gian tồn kho */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="primary" gutterBottom>
                <AccessTimeIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Thời gian tồn kho
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body1">
                Thời gian tồn kho TB: <strong>{averageStorageDays.toFixed(1)} ngày</strong>
              </Typography>
              <Typography variant="body1">
                Xe tồn kho lâu nhất: <strong>
                  {longestStorageVehicles.length > 0 
                    ? `${longestStorageVehicles[0].importDate 
                        ? calculateStorageTime(longestStorageVehicles[0].importDate, undefined) 
                        : 0} ngày` 
                    : 'Không có'}
                </strong>
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Bảng xe tồn kho lâu nhất */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="primary" gutterBottom>
                <AccessTimeIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Xe tồn kho lâu nhất
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Mã xe</TableCell>
                      <TableCell>Tên xe</TableCell>
                      <TableCell>Ngày nhập</TableCell>
                      <TableCell>Thời gian tồn kho</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {longestStorageVehicles.length > 0 ? (
                      longestStorageVehicles.map((vehicle) => {
                        // Chỉ hiển thị xe đã nhập trước hoặc trong tháng/năm được chọn
                        if (!vehicle.importDate) return null;
                        const importDate = new Date(vehicle.importDate);
    const lastDayOfMonth = getDaysInMonth(selectedMonth, selectedYear);
    const endOfMonth = new Date(selectedYear, selectedMonth - 1, lastDayOfMonth, 23, 59, 59);
                        if (importDate > endOfMonth) return null;
                        
                        return (
                          <TableRow key={vehicle.id}>
                            <TableCell>{vehicle.id}</TableCell>
                            <TableCell>{vehicle.name}</TableCell>
                            <TableCell>{formatDate(vehicle.importDate)}</TableCell>
                            <TableCell>
                              {vehicle.importDate ? `${calculateStorageTime(vehicle.importDate, endOfMonth)} ngày` : 'N/A'}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} align="center">Không có dữ liệu</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Bảng xe có lợi nhuận cao nhất */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="primary" gutterBottom>
                <AttachMoneyIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Xe có lợi nhuận cao nhất
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Mã xe</TableCell>
                      <TableCell>Tên xe</TableCell>
                      <TableCell>Ngày bán</TableCell>
                      <TableCell>Lợi nhuận</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {highestProfitVehicles.length > 0 ? (
                      highestProfitVehicles.map((vehicle) => {
                        // Kiểm tra lại để đảm bảo chỉ hiển thị xe bán trong tháng/năm được chọn
                        if (!vehicle.exportDate) return null;
                        const exportDate = new Date(vehicle.exportDate);
                        if (exportDate.getMonth() + 1 !== selectedMonth || 
                            exportDate.getFullYear() !== selectedYear) return null;
                        
                        return (
                          <TableRow key={vehicle.id}>
                            <TableCell>{vehicle.id}</TableCell>
                            <TableCell>{vehicle.name}</TableCell>
                            <TableCell>{vehicle.exportDate ? formatDate(vehicle.exportDate) : 'N/A'}</TableCell>
                            <TableCell>{formatCurrency(calculateProfit(vehicle))}</TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} align="center">Không có dữ liệu</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Bảng KPI, lương và thưởng nhân viên */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="primary" gutterBottom>
                <AttachMoneyIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Bảng KPI, lương và thưởng nhân viên
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Nhân viên</TableCell>
                      <TableCell>Phòng ban</TableCell>
                      <TableCell align="right">KPI (xe)</TableCell>
                      <TableCell align="right">Đã đạt</TableCell>
                      <TableCell align="right">Lương cơ bản</TableCell>
                      <TableCell align="right">Thưởng</TableCell>
                      <TableCell align="right">Tổng thu nhập</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {staffSalaryData.staffData.map((staff) => (
                      <TableRow key={staff.id}>
                        <TableCell>{staff.name}</TableCell>
                        <TableCell>{staff.team}</TableCell>
                        <TableCell align="right">{staff.kpiTarget}</TableCell>
                        <TableCell align="right">{staff.kpiActual}</TableCell>
                        <TableCell align="right">{formatCurrency(staff.baseSalary)}</TableCell>
                        <TableCell align="right">{formatCurrency(staff.bonus)}</TableCell>
                        <TableCell align="right">{formatCurrency(staff.totalIncome)}</TableCell>
                      </TableRow>
                    ))}
                    {/* Hàng tổng */}
                    <TableRow>
                      <TableCell colSpan={2} sx={{ fontWeight: 'bold' }}>Tổng cộng</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>{staffSalaryData.totals.kpiTarget}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>{staffSalaryData.totals.kpiActual}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>{formatCurrency(staffSalaryData.totals.baseSalary)}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>{formatCurrency(staffSalaryData.totals.bonus)}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>{formatCurrency(staffSalaryData.totals.totalIncome)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  // Tính toán dữ liệu doanh thu cho tháng được chọn
  const revenueData = useMemo(() => {
    // Lọc xe đã bán trong tháng được chọn
    const soldVehiclesInMonth = vehicles.filter(vehicle => {
      if (!vehicle.exportDate || vehicle.status !== VehicleStatus.SOLD) return false;
      
      const exportDate = new Date(vehicle.exportDate);
      return exportDate.getMonth() + 1 === selectedMonth && 
             exportDate.getFullYear() === selectedYear;
    });
    
    // Tính tổng doanh thu và lợi nhuận trong tháng
    let monthlyRevenue = 0;
    let monthlyProfit = 0;
    
    soldVehiclesInMonth.forEach(vehicle => {
      monthlyRevenue += vehicle.sellPrice || 0;
      monthlyProfit += calculateProfit(vehicle);
    });
    
    return {
      soldCount: soldVehiclesInMonth.length,
      revenue: monthlyRevenue,
      profit: monthlyProfit,
      profitMargin: monthlyRevenue > 0 ? (monthlyProfit / monthlyRevenue) * 100 : 0
    };
  }, [vehicles, selectedMonth, selectedYear]);

  // Phần hiển thị báo cáo doanh thu
  const renderRevenueReport = () => {
    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="primary" gutterBottom>
                <EqualizerIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Báo cáo Doanh thu tháng {selectedMonth}/{selectedYear}
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        Tổng quan doanh thu
                      </Typography>
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body1" gutterBottom>
                          Số xe đã bán: <strong>{revenueData.soldCount} xe</strong>
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                          Tổng doanh thu: <strong>{formatCurrency(revenueData.revenue)}</strong>
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                          Tổng lợi nhuận: <strong>{formatCurrency(revenueData.profit)}</strong>
                        </Typography>
                      </Box>
        </CardContent>
      </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        Thông tin bổ sung
                      </Typography>
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body1" gutterBottom>
                          Doanh thu trung bình/xe: <strong>
                            {revenueData.soldCount > 0 
                              ? formatCurrency(revenueData.revenue / revenueData.soldCount) 
                              : formatCurrency(0)}
                          </strong>
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                          Lợi nhuận trung bình/xe: <strong>
                            {revenueData.soldCount > 0 
                              ? formatCurrency(revenueData.profit / revenueData.soldCount) 
                              : formatCurrency(0)}
                          </strong>
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Đang phát triển thêm các biểu đồ phân tích doanh thu chi tiết
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  // Tính toán dữ liệu nhân viên theo tháng/năm được chọn
  const staffData = useMemo(() => {
    // Lọc xe đã bán trong tháng được chọn
    const soldVehiclesInMonth = vehicles.filter(vehicle => {
      if (!vehicle.exportDate || vehicle.status !== VehicleStatus.SOLD) return false;
      
      const exportDate = new Date(vehicle.exportDate);
      return exportDate.getMonth() + 1 === selectedMonth && 
            exportDate.getFullYear() === selectedYear;
    });
    
    // Nhóm theo nhân viên bán hàng
    const staffMap: Record<string, { 
      id: string, 
      name: string, 
      vehicles: number, 
      revenue: number, 
      profit: number 
    }> = {};
    
    soldVehiclesInMonth.forEach(vehicle => {
      if (!vehicle.saleStaff) return;
      
      const { id, name } = vehicle.saleStaff;
      if (!staffMap[id]) {
        staffMap[id] = { 
          id, 
          name, 
          vehicles: 0, 
          revenue: 0, 
          profit: 0 
        };
      }
      
      staffMap[id].vehicles += 1;
      staffMap[id].revenue += vehicle.sellPrice || 0;
      staffMap[id].profit += calculateProfit(vehicle);
    });
    
    return Object.values(staffMap).sort((a, b) => b.profit - a.profit);
  }, [vehicles, selectedMonth, selectedYear]);

  // Phần hiển thị báo cáo nhân viên
  const renderStaffReport = () => {
    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="primary" gutterBottom>
                <BarChartIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Báo cáo Nhân viên bán hàng tháng {selectedMonth}/{selectedYear}
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {staffData.length > 0 ? (
                <>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Nhân viên</TableCell>
                          <TableCell align="right">Số xe bán</TableCell>
                          <TableCell align="right">Doanh thu</TableCell>
                          <TableCell align="right">Lợi nhuận</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {staffData.map((staff) => (
                          <TableRow key={staff.id}>
                            <TableCell>{staff.name}</TableCell>
                            <TableCell align="right">{staff.vehicles}</TableCell>
                            <TableCell align="right">{formatCurrency(staff.revenue)}</TableCell>
                            <TableCell align="right">{formatCurrency(staff.profit)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <Box sx={{ mt: 2, textAlign: 'right' }}>
                    <Typography variant="body2" color="text.secondary">
                      * Dữ liệu được lọc theo tháng {selectedMonth}/{selectedYear}
                    </Typography>
                  </Box>
                </>
          ) : (
                <Typography variant="body1">
                  Không có dữ liệu bán hàng trong tháng {selectedMonth}/{selectedYear}
              </Typography>
          )}
        </CardContent>
      </Card>
        </Grid>
      </Grid>
    );
  };

  // Tính toán dữ liệu tồn kho theo tháng/năm được chọn
  const inventoryData = useMemo(() => {
    // Tính toán ngày cuối tháng
    const lastDayOfMonth = getDaysInMonth(selectedMonth, selectedYear);
    const endOfMonth = new Date(selectedYear, selectedMonth - 1, lastDayOfMonth, 23, 59, 59);
    
    // Lọc xe tồn kho tại thời điểm cuối tháng
    const inStockAtEndOfMonth = vehicles.filter(vehicle => {
      const importDate = vehicle.importDate ? new Date(vehicle.importDate) : null;
      
      // Xe phải có ngày nhập không muộn hơn ngày cuối tháng
      const importedBeforeEndOfMonth = importDate && importDate <= endOfMonth;
      
      // Xe chưa được xuất hoặc được xuất sau ngày cuối tháng
      const notExportedOrExportedAfterMonth = !vehicle.exportDate || new Date(vehicle.exportDate) > endOfMonth;
      
      return importedBeforeEndOfMonth && notExportedOrExportedAfterMonth;
    });
    
    // Phân loại các xe theo trạng thái
    const inStock = inStockAtEndOfMonth.filter(v => v.status === VehicleStatus.IN_STOCK);
    const deposited = inStockAtEndOfMonth.filter(v => v.status === VehicleStatus.DEPOSITED);
    const bankDeposited = inStockAtEndOfMonth.filter(v => v.status === VehicleStatus.BANK_DEPOSITED);
    
    // Tính tổng giá trị tồn kho
    const totalValue = inStockAtEndOfMonth.reduce((sum, v) => sum + (v.purchasePrice || 0), 0);
    
    return {
      inStock,
      deposited,
      bankDeposited,
      totalVehicles: inStockAtEndOfMonth.length,
      totalValue
    };
  }, [vehicles, selectedMonth, selectedYear, getDaysInMonth]);

  // Phần hiển thị báo cáo tồn kho
  const renderInventoryReport = () => {
    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="primary" gutterBottom>
                <AccountBalanceIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Báo cáo Tồn kho tháng {selectedMonth}/{selectedYear}
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        Thống kê tồn kho cuối tháng {selectedMonth}/{selectedYear}
                      </Typography>
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body1" gutterBottom>
                          Số xe trong kho: <strong>{inventoryData.inStock.length}</strong>
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                          Số xe đã đặt cọc: <strong>{inventoryData.deposited.length}</strong>
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                          Số xe đặt cọc ngân hàng: <strong>{inventoryData.bankDeposited.length}</strong>
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                          Tổng số xe tồn kho: <strong>{inventoryData.totalVehicles}</strong>
                      </Typography>
                    </Box>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        Giá trị tồn kho
                      </Typography>
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body1" gutterBottom>
                          Giá trị tồn kho: <strong>{formatCurrency(inventoryData.totalValue)}</strong>
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                          Giá trị trung bình/xe: <strong>
                            {inventoryData.totalVehicles > 0 
                              ? formatCurrency(inventoryData.totalValue / inventoryData.totalVehicles) 
                              : formatCurrency(0)}
                          </strong>
                    </Typography>
                  </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              <Box sx={{ mt: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  * Dữ liệu tồn kho được tính đến thời điểm cuối tháng {selectedMonth}/{selectedYear}
              </Typography>
            </Box>
        </CardContent>
      </Card>
        </Grid>
      </Grid>
    );
  };

  // Render cho phiên bản mobile
  const renderMobileReport = () => {
    return (
      <Box>
        {/* Header với lựa chọn tháng */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
            {/* Tiêu đề báo cáo */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <CalendarMonthIcon sx={{ mr: 1 }} />
              <Typography variant="h6" component="h2">
                Báo cáo {monthYearString}
              </Typography>
            </Box>
            
            {/* Nút chọn thời gian */}
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'center' }}>
              <Tooltip title="Tháng trước">
                <IconButton onClick={() => {
                  let newMonth = selectedMonth - 1;
                  let newYear = selectedYear;
                  
                  if (newMonth < 1) {
                    newMonth = 12;
                    newYear -= 1;
                  }
                  
                  handleDateChange(newMonth, newYear);
                }} size="small">
                  <ChevronLeftIcon />
                </IconButton>
              </Tooltip>
              
              <FormControl sx={{ width: 180, mx: 1 }}>
                <TextField
                  value={monthYearString}
                  onChange={(event) => {
                    setMonthYearString(event.target.value);
                    
                    try {
                      // Dự kiến format: "Tháng M/YYYY"
                      const matches = event.target.value.match(/Tháng\s+(\d{1,2})\/(\d{4})/);
                      if (matches && matches.length === 3) {
                        const month = parseInt(matches[1], 10);
                        const year = parseInt(matches[2], 10);
                        
                        if (month >= 1 && month <= 12 && year >= 2000) {
                          // Không cho phép chọn tháng trong tương lai
                          const currentDate = new Date();
                          if (year > currentDate.getFullYear() || 
                              (year === currentDate.getFullYear() && month > currentDate.getMonth() + 1)) {
                            return;
                          }
                          
                          handleDateChange(month, year);
                        }
                      }
                    } catch (error) {
                      console.error("Lỗi khi phân tích chuỗi tháng/năm:", error);
                    }
                  }}
                  variant="outlined"
                  size="small"
                  InputProps={{
                    endAdornment: (
                      <IconButton
                        onClick={() => {
                          const currentDate = new Date();
                          const currentMonth = currentDate.getMonth() + 1;
                          const currentYear = currentDate.getFullYear();
                          handleDateChange(currentMonth, currentYear);
                        }}
                        size="small"
                        title="Về tháng hiện tại"
                      >
                        <CalendarMonthIcon fontSize="small" />
                      </IconButton>
                    )
                  }}
                />
              </FormControl>
              
              <Tooltip title="Tháng sau">
                <span>
                  <IconButton 
                    onClick={() => {
                      let newMonth = selectedMonth + 1;
                      let newYear = selectedYear;
                      
                      if (newMonth > 12) {
                        newMonth = 1;
                        newYear += 1;
                      }
                      
                      // Không cho phép chọn tháng trong tương lai
                      const currentDate = new Date();
                      if (newYear > currentDate.getFullYear() || 
                          (newYear === currentDate.getFullYear() && newMonth > currentDate.getMonth() + 1)) {
                        return;
                      }
                      
                      handleDateChange(newMonth, newYear);
                    }}
                    size="small"
                    disabled={
                      selectedYear > new Date().getFullYear() || 
                      (selectedYear === new Date().getFullYear() && selectedMonth >= new Date().getMonth() + 1)
                    }
                  >
                    <ChevronRightIcon />
                  </IconButton>
                </span>
              </Tooltip>
            </Box>
          </Box>
        </Paper>

        {/* Nội dung báo cáo */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {renderOverviewReport()}
          {renderRevenueReport()}
          {renderStaffReport()}
          {renderInventoryReport()}
        </Box>
      </Box>
    );
  };

  // Render cho phiên bản desktop
  const renderDesktopReport = () => {
  return (
    <Box>
        {/* Header với lựa chọn tháng */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CalendarMonthIcon sx={{ mr: 1 }} />
              <Typography variant="h6" component="h2">
                Báo cáo {monthYearString}
        </Typography>
            </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Tooltip title="Tháng trước">
                <IconButton onClick={() => {
                  let newMonth = selectedMonth - 1;
                  let newYear = selectedYear;
                  
                  if (newMonth < 1) {
                    newMonth = 12;
                    newYear -= 1;
                  }
                  
                  handleDateChange(newMonth, newYear);
                }} size="small">
                  <ChevronLeftIcon />
                </IconButton>
              </Tooltip>
              
              <FormControl sx={{ width: 180, mx: 1 }}>
                <TextField
                  value={monthYearString}
                  onChange={(event) => {
                    setMonthYearString(event.target.value);
                    
                    try {
                      // Dự kiến format: "Tháng M/YYYY"
                      const matches = event.target.value.match(/Tháng\s+(\d{1,2})\/(\d{4})/);
                      if (matches && matches.length === 3) {
                        const month = parseInt(matches[1], 10);
                        const year = parseInt(matches[2], 10);
                        
                        if (month >= 1 && month <= 12 && year >= 2000) {
                          // Không cho phép chọn tháng trong tương lai
                          const currentDate = new Date();
                          if (year > currentDate.getFullYear() || 
                              (year === currentDate.getFullYear() && month > currentDate.getMonth() + 1)) {
                            return;
                          }
                          
                          handleDateChange(month, year);
                        }
                      }
                    } catch (error) {
                      console.error("Lỗi khi phân tích chuỗi tháng/năm:", error);
                    }
                  }}
                  variant="outlined"
                  size="small"
                  InputProps={{
                    endAdornment: (
                      <IconButton
                        onClick={() => {
                          const currentDate = new Date();
                          const currentMonth = currentDate.getMonth() + 1;
                          const currentYear = currentDate.getFullYear();
                          handleDateChange(currentMonth, currentYear);
                        }}
                        size="small"
                        title="Về tháng hiện tại"
                      >
                        <CalendarMonthIcon fontSize="small" />
                      </IconButton>
                    )
                  }}
                />
              </FormControl>
              
              <Tooltip title="Tháng sau">
                <span>
                  <IconButton 
                    onClick={() => {
                      let newMonth = selectedMonth + 1;
                      let newYear = selectedYear;
                      
                      if (newMonth > 12) {
                        newMonth = 1;
                        newYear += 1;
                      }
                      
                      // Không cho phép chọn tháng trong tương lai
                      const currentDate = new Date();
                      if (newYear > currentDate.getFullYear() || 
                          (newYear === currentDate.getFullYear() && newMonth > currentDate.getMonth() + 1)) {
                        return;
                      }
                      
                      handleDateChange(newMonth, newYear);
                    }}
                    size="small"
                    disabled={
                      selectedYear > new Date().getFullYear() || 
                      (selectedYear === new Date().getFullYear() && selectedMonth >= new Date().getMonth() + 1)
                    }
                  >
                    <ChevronRightIcon />
                  </IconButton>
                </span>
              </Tooltip>
            </Box>
          </Box>
        </Paper>

        {/* Nội dung báo cáo */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {renderOverviewReport()}
          {renderRevenueReport()}
          {renderStaffReport()}
          {renderInventoryReport()}
        </Box>
      </Box>
    );
  };

  // Component chính
  return (
    <Box>
      {isMobile ? renderMobileReport() : renderDesktopReport()}
    </Box>
  );
};

export default Report; 