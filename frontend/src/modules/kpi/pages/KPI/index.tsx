import React, { useState, useEffect } from 'react';
import { 
  Tabs, 
  Tab, 
  Box, 
  Typography, 
  CircularProgress,
  Container,
  Alert,
  Snackbar,
  Grid,
  Card,
  CardContent,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Divider,
  Tooltip,
  IconButton,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField
} from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../../store';
import { getAllStaff } from '../../../../store/slices/staffSlice';
import { getAllVehicles } from '../../../../store/slices/vehicleSlice';
import { Staff } from '../../../../types/staff/staff';
import { AppDispatch } from '../../../../store';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import PriceCheckIcon from '@mui/icons-material/PriceCheck';
import { formatCurrency } from '../../../../utils/formatters';

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
      id={`kpi-tabpanel-${index}`}
      aria-labelledby={`kpi-tab-${index}`}
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
    id: `kpi-tab-${index}`,
    'aria-controls': `kpi-tabpanel-${index}`,
  };
}

const KPIPage: React.FC = () => {
  // State cho tab hiện tại
  const [activeTab, setActiveTab] = useState(0);
  
  // State cho thông báo
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });
  
  const dispatch = useDispatch<AppDispatch>();
  
  // Lấy danh sách nhân viên và xe từ Redux store
  const { staffList, loading: staffLoading, error: staffError } = useSelector((state: RootState) => state.staff);
  const { vehicles, loading: vehiclesLoading } = useSelector((state: RootState) => state.vehicles);

  // Tính toán dữ liệu KPI cho bảng
  const kpiData = React.useMemo(() => {
    if (!staffList || staffList.length === 0) return [];
    
    return staffList
      .filter((s: Staff) => s.team.includes('kinh doanh'))
      .map((s: Staff) => ({
        id: s.id,
        name: s.name,
        team: s.team,
        target: 4, // Chỉ tiêu mặc định: 4 xe/tháng
        actual: s.vehiclesSold || 0,
        completion: s.vehiclesSold ? Math.round((s.vehiclesSold / 4) * 100) : 0,
        commissionRate: s.commissionRate,
        totalRevenue: s.vehiclesSold * 500000000, // Giả định trung bình 500tr/xe
        totalCommission: s.totalCommission
      }));
  }, [staffList]);

  // Tính dữ liệu tổng hợp
  const summaryData = React.useMemo(() => {
    if (!staffList || staffList.length === 0) return {
      totalStaff: 0,
      totalVehiclesSold: 0,
      totalRevenue: 0,
      totalCommission: 0,
      completionRate: 0
    };
    
    const salesStaff = staffList.filter((s: Staff) => s.team.includes('kinh doanh'));
    const totalStaff = salesStaff.length;
    const totalVehiclesSold = salesStaff.reduce((sum: number, s: Staff) => sum + (s.vehiclesSold || 0), 0);
    const totalCommission = salesStaff.reduce((sum: number, s: Staff) => sum + (s.totalCommission || 0), 0);
    const totalRevenue = totalVehiclesSold * 500000000; // Giả định trung bình 500tr/xe
    const targetVehicles = totalStaff * 4; // 4 xe/người/tháng
    const completionRate = targetVehicles > 0 ? Math.round((totalVehiclesSold / targetVehicles) * 100) : 0;
    
    return {
      totalStaff,
      totalVehiclesSold,
      totalRevenue,
      totalCommission,
      completionRate
    };
  }, [staffList]);

  // Tải dữ liệu khi component được mount
  useEffect(() => {
    dispatch(getAllStaff());
    dispatch(getAllVehicles());
  }, [dispatch]);

  // Xử lý khi thay đổi tab
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Đóng thông báo
  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange} 
            aria-label="kpi tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="Tổng quan KPI" {...a11yProps(0)} />
            <Tab label="KPI Cá nhân" {...a11yProps(1)} />
            <Tab label="KPI Nhóm" {...a11yProps(2)} />
            <Tab label="Cấu hình KPI" {...a11yProps(3)} />
          </Tabs>
        </Box>
        
        {/* Tab Tổng quan KPI */}
        <TabPanel value={activeTab} index={0}>
          <Typography variant="h5" sx={{ mb: 3 }}>Tổng quan KPI</Typography>
          
          {staffError && <Alert severity="error">{staffError}</Alert>}
          
          {staffLoading || vehiclesLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {/* Thẻ tổng quan */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={2.4}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <PersonAddIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="h6" component="div">
                          Nhân viên
                        </Typography>
                      </Box>
                      <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                        {summaryData.totalStaff}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Nhân viên kinh doanh
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} sm={6} md={2.4}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <DirectionsCarIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="h6" component="div">
                          Xe đã bán
                        </Typography>
                      </Box>
                      <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                        {summaryData.totalVehiclesSold}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Tổng số xe đã bán trong tháng
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} sm={6} md={2.4}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <AttachMoneyIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="h6" component="div">
                          Doanh thu
                        </Typography>
                      </Box>
                      <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                        {formatCurrency(summaryData.totalRevenue)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Tổng doanh thu từ bán xe
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} sm={6} md={2.4}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <PriceCheckIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="h6" component="div">
                          Hoa hồng
                        </Typography>
                      </Box>
                      <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                        {formatCurrency(summaryData.totalCommission)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Tổng hoa hồng phải trả
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} sm={6} md={2.4}>
                  <Card sx={{ height: '100%', bgcolor: summaryData.completionRate >= 100 ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 152, 0, 0.1)' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <DoneAllIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="h6" component="div">
                          Hoàn thành
                        </Typography>
                      </Box>
                      <Typography 
                        variant="h4" 
                        component="div" 
                        sx={{ 
                          fontWeight: 'bold', 
                          color: summaryData.completionRate >= 100 ? 'success.main' : 'warning.main'
                        }}
                      >
                        {summaryData.completionRate}%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Tỷ lệ hoàn thành chỉ tiêu
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
              
              {/* Bảng KPI chi tiết */}
              <Typography variant="h6" sx={{ mb: 2 }}>Chi tiết KPI nhân viên kinh doanh</Typography>
              <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="kpi table">
                  <TableHead>
                    <TableRow>
                      <TableCell>Mã NV</TableCell>
                      <TableCell>Tên nhân viên</TableCell>
                      <TableCell>Nhóm</TableCell>
                      <TableCell align="center">Chỉ tiêu</TableCell>
                      <TableCell align="center">Đã bán</TableCell>
                      <TableCell align="center">Hoàn thành</TableCell>
                      <TableCell align="right">Doanh thu</TableCell>
                      <TableCell align="right">Hoa hồng</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {kpiData.map((row: any) => (
                      <TableRow
                        key={row.id}
                        sx={{ 
                          '&:last-child td, &:last-child th': { border: 0 },
                          bgcolor: row.completion >= 100 ? 'rgba(76, 175, 80, 0.05)' : undefined
                        }}
                      >
                        <TableCell component="th" scope="row">{row.id}</TableCell>
                        <TableCell>{row.name}</TableCell>
                        <TableCell>{row.team}</TableCell>
                        <TableCell align="center">{row.target} xe</TableCell>
                        <TableCell align="center">{row.actual} xe</TableCell>
                        <TableCell align="center" 
                          sx={{ 
                            color: row.completion >= 100 ? 'success.main' : 
                                   row.completion >= 75 ? 'primary.main' : 'warning.main',
                            fontWeight: 'bold'
                          }}
                        >
                          {row.completion}%
                        </TableCell>
                        <TableCell align="right">{formatCurrency(row.totalRevenue)}</TableCell>
                        <TableCell align="right">{formatCurrency(row.totalCommission)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </TabPanel>
        
        {/* Tab KPI Cá nhân */}
        <TabPanel value={activeTab} index={1}>
          <Typography variant="h5">KPI Cá nhân</Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>
            Tính năng đang phát triển...
          </Typography>
        </TabPanel>
        
        {/* Tab KPI Nhóm */}
        <TabPanel value={activeTab} index={2}>
          <Typography variant="h5">KPI Nhóm</Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>
            Tính năng đang phát triển...
          </Typography>
        </TabPanel>
        
        {/* Tab Cấu hình KPI */}
        <TabPanel value={activeTab} index={3}>
          <Typography variant="h5">Cấu hình KPI</Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>
            Tính năng đang phát triển...
          </Typography>
        </TabPanel>
      </Box>
      
      {/* Snackbar thông báo */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        message={snackbar.message}
      />
    </Container>
  );
};

export default KPIPage; 