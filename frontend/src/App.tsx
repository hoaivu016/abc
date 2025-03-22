import React from 'react';
import type { ReactElement } from 'react';
import { useEffect, useMemo, useCallback } from 'react';
import { useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Tabs, 
  Tab, 
  Paper,
  AppBar,
  CssBaseline,
  useMediaQuery,
  BottomNavigation,
  BottomNavigationAction,
  Alert,
  Chip,
  Slide,
  Portal,
  CircularProgress,
  TextField,
  Button
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import VehicleList from './modules/vehicles/components/VehicleList';
import VehicleForm from './modules/vehicles/components/VehicleForm';
import StatusChangeModal from './modules/vehicles/components/StatusChangeModal';
import Report from './modules/reports/components/Report';
import Admin from './modules/admin/components/Admin';
import Login from './pages/Login';
import FunctionalErrorBoundary from './components/FunctionalErrorBoundary';
import DashboardIcon from '@mui/icons-material/Dashboard';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import BarChartIcon from '@mui/icons-material/BarChart';
import { 
  Vehicle, 
  VehicleStatus, 
  generateVehicleId, 
  calculateStorageTime, 
  calculateProfit,
  calculateDebt,
  CostInfo
} from './types/vehicles/vehicle';
import type {
  Staff as StaffType,
  StaffHistory,
  StaffStatistics
} from './types/staff/staff';
import {
  StaffStatus,
  StaffTeam,
  StaffRole,
  generateStaffId,
  calculateTotalCommission
} from './types/staff/staff';
import { KpiTarget, SupportDepartmentBonus } from './models/kpi';
import { supabase } from './lib/database/supabase';
import { 
  syncPendingActions, 
  loadVehiclesFromSupabase, 
  loadStaffFromSupabase,
  loadKpiFromSupabase,
  loadSupportBonusFromSupabase,
  savePendingSync,
  handleStaffDelete,
  syncVehicleToSupabase
} from './lib/database/syncService';
import { FinancialAnalysis } from './modules/admin/components';
// Import hook
import { useVehicleDelete } from './hooks/useVehicleDelete';
import { checkSupabaseConnection } from './lib/database/supabase';
// Import component quản lý tài khoản
import AccountManagement from './modules/accounts/components/AccountManagement';
import { getCurrentSession } from './lib/auth/auth';
import { logout } from './redux/actions/authActions';

// Định nghĩa interface cho các tab
interface TabPanelProps {
  children?: ReactElement;
  index: number;
  value: number;
}

// Định nghĩa interface cho thông báo
interface SyncMessage {
  message: string;
  type: 'success' | 'error' | 'info';
}

// Định nghĩa interface cho state
interface AppState {
  vehicleList: Vehicle[];
  staff: StaffType[];
  staffHistory: StaffHistory[];
  kpiTargets: KpiTarget[];
  supportBonus: SupportDepartmentBonus[];
  selectedVehicle: Vehicle | null;
  isStatusModalOpen: boolean;
  isOnline: boolean;
  syncStatus: 'syncing' | 'success' | 'error' | null;
  syncMessage: string;
  currentTab: number;
  showSyncMessage: boolean;
  syncMessageData: SyncMessage;
  kpiList: KpiTarget[];
  financialData: {
    capitalAmount: number;
    loanAmount: number;
    interestRate: number;
  };
}

// Component TabPanel để hiển thị nội dung của từng tab
function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
      style={{ width: '100%' }}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Cập nhật interface Staff để thêm terminationDate
interface Staff {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  team: StaffTeam;
  role: StaffRole;
  status: StaffStatus;
  joinDate: Date;
  terminationDate?: Date;
  salary: number;
  commissionRate: number;
  vehiclesSold: number;
  totalCommission: number;
  note?: string;
}

// Bảo vệ route yêu cầu đăng nhập
interface ProtectedRouteProps {
  children: ReactElement;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const isAuthenticated = useSelector((state: any) => state.auth.isAuthenticated);
  const location = useLocation();
  const dispatch = useDispatch();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        // Kiểm tra xem người dùng đã đăng nhập hay chưa
        const session = await getCurrentSession();
        
        if (!session && !isAuthenticated) {
          // Nếu không có session và chưa đăng nhập trong Redux, chuyển hướng đến trang đăng nhập
          console.log('Không tìm thấy phiên đăng nhập, chuyển hướng đến trang đăng nhập');
        }
        
        setCheckingAuth(false);
      } catch (error) {
        console.error('Lỗi khi kiểm tra xác thực:', error);
        setCheckingAuth(false);
      }
    };

    checkAuthentication();
  }, [isAuthenticated, dispatch]);

  if (checkingAuth) {
    // Hiển thị loading hoặc placeholder khi đang kiểm tra đăng nhập
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    // Nếu chưa đăng nhập, chuyển hướng đến trang đăng nhập và lưu đường dẫn hiện tại
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  // Nếu đã đăng nhập, hiển thị component con
  return children;
};

// Bảo vệ trang đăng nhập (nếu đã đăng nhập sẽ chuyển hướng đến trang danh sách xe)
interface LoginRouteProps {
  children: ReactElement;
}

const LoginRoute: React.FC<LoginRouteProps> = ({ children }) => {
  const isAuthenticated = useSelector((state: any) => state.auth.isAuthenticated);
  const location = useLocation();
  const navigate = useNavigate();

  // Lấy đường dẫn redirect từ query params (nếu có)
  const searchParams = new URLSearchParams(location.search);
  const redirectPath = searchParams.get('redirect') || '/';

  useEffect(() => {
    // Nếu đã đăng nhập, chuyển hướng đến trang được yêu cầu hoặc trang chủ
    if (isAuthenticated) {
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, navigate, redirectPath]);

  // Nếu chưa đăng nhập, hiển thị trang đăng nhập
  return !isAuthenticated ? children : null;
};

function App() {
  // Thêm hỗ trợ xác định thiết bị di động
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useSelector((state: any) => state.auth.isAuthenticated);
  const dispatch = useDispatch();

  // State chính của ứng dụng
  const [state, setState] = useState<AppState>({
    vehicleList: [],
    staff: [],
    staffHistory: [],
    kpiTargets: [],
    supportBonus: [],
    selectedVehicle: null,
    isStatusModalOpen: false,
    isOnline: navigator.onLine,
    syncStatus: null,
    syncMessage: '',
    currentTab: 0,
    showSyncMessage: false,
    syncMessageData: { message: '', type: 'info' },
    kpiList: [],
    financialData: {
      capitalAmount: 0,
      loanAmount: 0,
      interestRate: 0
    }
  });

  const {
    vehicleList: vehicles,
    staff,
    staffHistory,
    kpiTargets,
    supportBonus,
    selectedVehicle,
    isStatusModalOpen,
    isOnline,
    syncStatus,
    syncMessage,
    currentTab,
    showSyncMessage,
    syncMessageData,
    kpiList,
    financialData
  } = state;

  // State cho đồng bộ hóa
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // State cho form xe
  const [isVehicleFormOpen, setIsVehicleFormOpen] = useState<boolean>(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | undefined>(undefined);
  const [isStatusChangeModalOpen, setIsStatusChangeModalOpen] = useState<boolean>(false);
  const [selectedVehicleForStatusChange, setSelectedVehicleForStatusChange] = useState<Vehicle | undefined>(undefined);

  // State cho chọn tháng/năm
  const initialDate = new Date();
  const [globalMonth, setGlobalMonth] = useState<number>(initialDate.getMonth() + 1);
  const [globalYear, setGlobalYear] = useState<number>(initialDate.getFullYear());

  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    const testSupabaseConnection = async () => {
      try {
        const isConnected = await checkSupabaseConnection();
        
        if (isConnected) {
          setConnectionStatus('connected');
        } else {
          setConnectionStatus('disconnected');
          setConnectionError('Không thể kết nối đến Supabase. Vui lòng kiểm tra cài đặt.');
        }
      } catch (error) {
        setConnectionStatus('disconnected');
        setConnectionError(`Lỗi kết nối: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`);
      }
    };

    testSupabaseConnection();
  }, []);

  // Khởi tạo ứng dụng
  const initializeApp = async () => {
    try {
      setIsLoading(true);
      // 1. Kiểm tra session hiện tại
      const session = await getCurrentSession();
      
      // 2. Nếu có session, kiểm tra token validity
      if (session) {
        const isValid = await checkSupabaseConnection();
        if (!isValid) {
          // Nếu token không hợp lệ, logout
          await supabase.auth.signOut();
          dispatch(logout());
        }
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Lỗi khởi tạo ứng dụng:', error);
      setError(error instanceof Error ? error.message : 'Lỗi không xác định');
      setLoading(false);
    }
  };

  // Effect khởi tạo ứng dụng
  useEffect(() => {
    initializeApp();
  }, []);

  // Effect kiểm tra xác thực và chuyển hướng
  useEffect(() => {
    if (!isAuthenticated && location.pathname !== '/login') {
      navigate('/login');
    }
  }, [isAuthenticated, location.pathname, navigate]);

  // Lưu danh sách xe vào localStorage mỗi khi thay đổi
  useEffect(() => {
    localStorage.setItem('vehicles', JSON.stringify(vehicles));
  }, [vehicles]);

  // Lưu danh sách nhân sự vào localStorage mỗi khi thay đổi
  useEffect(() => {
    localStorage.setItem('staff', JSON.stringify(staff));
  }, [staff]);

  // Lưu danh sách KPI vào localStorage mỗi khi thay đổi
  useEffect(() => {
    localStorage.setItem('kpis', JSON.stringify(kpiTargets));
  }, [kpiTargets]);

  // Lưu danh sách thưởng phòng hỗ trợ vào localStorage mỗi khi thay đổi
  useEffect(() => {
    localStorage.setItem('supportBonuses', JSON.stringify(supportBonus));
  }, [supportBonus]);

  // Thay thế bằng useEffect để khôi phục dữ liệu từ localStorage
  useEffect(() => {
    const savedVehicles = localStorage.getItem('vehicles');
    if (savedVehicles) {
      const parsedVehicles = JSON.parse(savedVehicles).map((vehicle: Vehicle) => ({
        ...vehicle,
        importDate: new Date(vehicle.importDate),
        exportDate: vehicle.exportDate ? new Date(vehicle.exportDate) : null
      }));
      setState(prev => ({
        ...prev,
        vehicleList: parsedVehicles
      }));
    }
  }, []);

  // State cho danh sách nhân sự
  const [staffList, setStaffList] = useState<Staff[]>(() => {
    // Khôi phục danh sách nhân sự từ localStorage khi khởi tạo
    const savedStaff = localStorage.getItem('staffList');
    if (savedStaff) {
      return JSON.parse(savedStaff).map((staff: Staff) => ({
        ...staff,
        joinDate: new Date(staff.joinDate),
        terminationDate: staff.terminationDate ? new Date(staff.terminationDate) : null
      }));
    } else {
      // Tạo một nhân viên mẫu nếu chưa có dữ liệu
      const sampleStaff: Staff = {
        id: 'NV01VU',
        name: 'Phan Hữu Hoài Vũ',
        phone: '0888813838',
        email: 'vuphan@example.com',
        address: 'Thành phố Hồ Chí Minh',
        team: StaffTeam.SALES_1,
        role: StaffRole.STAFF,
        status: StaffStatus.ACTIVE,
        joinDate: new Date('2025-02-01'),
        salary: 5000000,
        commissionRate: 5,
        vehiclesSold: 0,
        totalCommission: 0,
        note: 'Nhân viên mẫu'
      };
      return [sampleStaff];
    }
  });

  // Hàm kiểm tra xung đột dữ liệu
  const checkDataConflicts = (localData: any[], serverData: any[], idField: string = 'id') => {
    const conflictItems = [];
    
    // Lọc các mục có trong cả local và server nhưng có timestamp khác nhau
    for (const localItem of localData) {
      const serverItem = serverData.find(item => item[idField] === localItem[idField]);
      
      if (serverItem && localItem.updatedAt && serverItem.updatedAt) {
        const localTimestamp = new Date(localItem.updatedAt).getTime();
        const serverTimestamp = new Date(serverItem.updatedAt).getTime();
        
        // Nếu thời gian cập nhật khác nhau, đánh dấu là xung đột
        if (Math.abs(localTimestamp - serverTimestamp) > 1000) { // Cho phép chênh lệch 1 giây
          conflictItems.push({
            id: localItem[idField],
            local: localItem,
            server: serverItem,
            newerVersion: localTimestamp > serverTimestamp ? 'local' : 'server'
          });
        }
      }
    }
    
    return conflictItems;
  };
  
  // Hàm giải quyết xung đột dữ liệu
  const resolveDataConflicts = (conflicts: any[], preferNewerVersion: boolean = true) => {
    if (conflicts.length === 0) return [];
    
    return conflicts.map(conflict => {
      // Mặc định ưu tiên phiên bản mới hơn
      if (preferNewerVersion) {
        return conflict.newerVersion === 'local' ? conflict.local : conflict.server;
      }
      
      // Logic tùy chỉnh để giải quyết xung đột có thể được thêm vào đây
      // Ví dụ: merge các trường từ cả hai phiên bản
      
      return conflict.local; // Mặc định giữ phiên bản local nếu không có logic khác
    });
  };

  // Hàm đồng bộ dữ liệu
  const synchronizeData = async () => {
    // Kiểm tra nếu đang đồng bộ thì không thực hiện nữa
    if (isSyncing) return;
    
    try {
      setIsSyncing(true);
      // Hiển thị thông báo đang đồng bộ
      setState(prev => ({
        ...prev,
        syncStatus: 'syncing',
        syncMessage: 'Đang đồng bộ dữ liệu...'
      }));

      // Lưu dữ liệu vào localStorage trước khi đồng bộ
      localStorage.setItem('vehicles_before_sync', JSON.stringify(vehicles));
      localStorage.setItem('staff_before_sync', JSON.stringify(staff));
      
      // Đồng bộ các thay đổi đang chờ
      const syncResult = await syncPendingActions();
      
      if (syncResult) {
        try {
          // Tải dữ liệu từ Supabase và merge với dữ liệu local
          const [vehiclesData, staffData, kpiData, bonusData] = await Promise.all([
            loadVehiclesFromSupabase(),
            loadStaffFromSupabase(),
            loadKpiFromSupabase(),
            loadSupportBonusFromSupabase()
          ]);
          
          // Kiểm tra xung đột
          const vehicleConflicts = checkDataConflicts(vehicles, vehiclesData);
          const staffConflicts = checkDataConflicts(staff, staffData);
          
          // Giải quyết xung đột
          const resolvedVehicles = resolveDataConflicts(vehicleConflicts);
          const resolvedStaff = resolveDataConflicts(staffConflicts);
          
          // Merge dữ liệu đã giải quyết xung đột
          const mergedVehicles = [...vehiclesData];
          const mergedStaff = [...staffData];
          
          // Thay thế các mục có xung đột bằng phiên bản đã giải quyết
          resolvedVehicles.forEach(resolvedVehicle => {
            const index = mergedVehicles.findIndex(v => v.id === resolvedVehicle.id);
            if (index !== -1) {
              mergedVehicles[index] = resolvedVehicle;
            }
          });
          
          resolvedStaff.forEach(resolvedStaff => {
            const index = mergedStaff.findIndex(s => s.id === resolvedStaff.id);
            if (index !== -1) {
              mergedStaff[index] = resolvedStaff;
            }
          });
          
          // Cập nhật state với dữ liệu đã được merge giữa local và server
          setState(prev => ({
            ...prev,
            vehicleList: mergedVehicles,
            staff: mergedStaff,
            kpiTargets: kpiData,
            supportBonus: bonusData,
            syncStatus: 'success',
            syncMessage: 'Đồng bộ dữ liệu thành công',
            syncMessageData: {
              message: 'Đồng bộ dữ liệu thành công',
              type: 'success'
            },
            showSyncMessage: true
          }));

          // Xóa dữ liệu pending sync sau khi đồng bộ thành công
          localStorage.removeItem('pendingSync');
          
          // Tự động ẩn thông báo sau 3 giây
          setTimeout(() => {
            setState(prev => ({
              ...prev,
              syncStatus: null,
              syncMessage: '',
              showSyncMessage: false
            }));
          }, 3000);
        } catch (error) {
          console.error('Lỗi khi tải dữ liệu từ Supabase:', error);
          setState(prev => ({
            ...prev,
            syncStatus: 'error',
            syncMessage: 'Lỗi khi tải dữ liệu từ server',
            syncMessageData: {
              message: 'Lỗi khi tải dữ liệu từ server',
              type: 'error'
            },
            showSyncMessage: true
          }));
        }
      }
    } catch (error) {
      console.error('Lỗi khi đồng bộ dữ liệu:', error);
      setState(prev => ({
        ...prev,
        syncStatus: 'error',
        syncMessage: 'Đồng bộ dữ liệu thất bại',
        syncMessageData: {
          message: 'Đồng bộ dữ liệu thất bại',
          type: 'error'
        },
        showSyncMessage: true
      }));
    } finally {
      setIsSyncing(false);
      // Tự động ẩn thông báo lỗi sau 3 giây
      setTimeout(() => {
        setState(prev => ({
          ...prev,
          syncStatus: null,
          syncMessage: '',
          showSyncMessage: false
        }));
      }, 3000);
    }
  };

  // Kiểm tra kết nối Supabase khi khởi động
  useEffect(() => {
    let isMounted = true;
    let isCheckingConnection = false;
    
    const checkConnection = async () => {
      // Nếu đang đồng bộ hoặc đang kiểm tra, bỏ qua
      if (isCheckingConnection || isSyncing) return;
      
      try {
        isCheckingConnection = true;
        const connectionCheck = await supabase.from('vehicles').select('count').single();
        const isConnected = Boolean(connectionCheck);
        
        // Kiểm tra component còn mounted không
        if (!isMounted) return;
        
        // Nếu trạng thái kết nối không thay đổi, không cần làm gì thêm
        if (isConnected === isOnline) {
          isCheckingConnection = false;
          return;
        }
        
        setState(prev => ({
          ...prev,
          isOnline: isConnected
        }));
        
        if (isConnected) {
          // Lưu thông tin thiết bị đang đồng bộ
          const deviceInfo = {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            screenWidth: window.screen.width,
            screenHeight: window.screen.height,
            timestamp: new Date().toISOString(),
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
          };
          
          // Lưu thông tin thiết bị vào localStorage
          localStorage.setItem('lastSyncDevice', JSON.stringify(deviceInfo));
          
          // Kiểm tra xem bảng sync_logs có tồn tại không trước khi thực hiện thao tác insert
          try {
            // Kiểm tra bảng sync_logs có tồn tại không
            const { error: checkError } = await supabase
              .from('sync_logs')
              .select('count', { count: 'exact', head: true })
              .limit(1);
            
            // Chỉ insert nếu không có lỗi khi kiểm tra
            if (!checkError) {
              await supabase.from('sync_logs').insert([{
                device_info: deviceInfo,
                sync_time: new Date().toISOString(),
                is_successful: true
              }]);
            }
          } catch (error) {
            // Bỏ qua lỗi nếu bảng không tồn tại
            console.log('Không thể lưu log đồng bộ, có thể bảng sync_logs chưa được tạo', error);
          }
          
          // Chỉ đồng bộ dữ liệu nếu chuyển từ offline sang online
          await synchronizeData();
        }
        
      } catch (error) {
        console.error("Lỗi khi kiểm tra kết nối:", error);
        if (isMounted) {
          setState(prev => ({
            ...prev,
            isOnline: false
          }));
        }
      } finally {
        isCheckingConnection = false;
      }
    };

    checkConnection();

    // Kiểm tra kết nối mỗi phút, thời gian dài hơn
    const interval = setInterval(checkConnection, 300000); // 5 phút
    
    // Kiểm tra khi mạng thay đổi
    const handleOnline = () => {
      checkConnection();
    };
    
    window.addEventListener('online', handleOnline);
    
    return () => {
      isMounted = false;
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
    };
  }, [isOnline, isSyncing]);

  // Hàm cập nhật tính toán cho xe
  const updateVehicleCalculations = (vehicle: Vehicle): Vehicle => {
    // Kiểm tra xe có hợp lệ không
    if (!vehicle) {
      console.error('updateVehicleCalculations: vehicle là undefined');
      return vehicle;
    }

    // Đảm bảo vehicle.payments tồn tại
    if (!vehicle.payments) {
      console.warn('updateVehicleCalculations: vehicle.payments là undefined, tạo mảng rỗng');
      vehicle = {
        ...vehicle,
        payments: []
      };
    }
    
    // Tính thời gian lưu kho
    const storageTime = calculateStorageTime(
      vehicle.importDate,
      vehicle.exportDate
    );
    
    // Tính công nợ dựa trên giá bán và các khoản thanh toán
    const debt = calculateDebt(vehicle.sellPrice, vehicle.payments);
    
    // Tính lợi nhuận dựa trên giá bán, giá mua và chi phí
    const profit = calculateProfit({
      purchasePrice: vehicle.purchasePrice,
      sellPrice: vehicle.sellPrice,
      cost: vehicle.cost,
      debt: debt
    });
    
    // Trả về xe đã được cập nhật các giá trị tính toán
    return {
      ...vehicle,
      storageTime,
      debt,
      profit
    };
  };

  // Hàm tính toán lại tất cả xe
  const recalculateAllVehicles = useCallback(() => {
    if (!vehicles || vehicles.length === 0) return;
    
    const recalculatedVehicles = vehicles.map(vehicle => updateVehicleCalculations(vehicle));
    
    // Nếu có sự thay đổi, cập nhật state và localStorage
    if (JSON.stringify(recalculatedVehicles) !== JSON.stringify(vehicles)) {
      console.log('Đã tính toán lại dữ liệu của tất cả xe');
      setState(prev => ({
        ...prev,
        vehicleList: recalculatedVehicles
      }));
      localStorage.setItem('vehicles', JSON.stringify(recalculatedVehicles));
    }
  }, [vehicles]);

  // Tính toán lại khi component mount
  useEffect(() => {
    // Chạy một lần khi component mount
    const timer = setTimeout(() => {
      if (vehicles && vehicles.length > 0) {
        recalculateAllVehicles();
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [recalculateAllVehicles]);

  // Xử lý thêm xe
  const handleAddVehicle = async (vehicleData: Partial<Vehicle>) => {
    try {
      // Kiểm tra dữ liệu đầu vào
      if (!vehicleData.name?.trim()) {
        throw new Error('Tên xe là bắt buộc');
      }
      if (!vehicleData.color?.trim()) {
        throw new Error('Màu sắc xe là bắt buộc');
      }
      if (!vehicleData.manufacturingYear || vehicleData.manufacturingYear > new Date().getFullYear()) {
        throw new Error('Năm sản xuất không hợp lệ');
      }
      if (vehicleData.odo < 0) {
        throw new Error('Số km không được âm');
      }
      if (vehicleData.purchasePrice <= 0) {
        throw new Error('Giá mua phải lớn hơn 0');
      }
      if (vehicleData.sellPrice <= vehicleData.purchasePrice) {
        throw new Error('Giá bán phải lớn hơn giá mua');
      }

      setHasUnsavedChanges(false);
      
      // Tạo ID mới cho xe
      const newId = generateVehicleId(vehicles);
      
      // Khởi tạo đối tượng xe mới với các giá trị mặc định
      const newVehicle: Vehicle = {
        id: newId,
        name: vehicleData.name.trim(),
        color: vehicleData.color.trim(),
        manufacturingYear: vehicleData.manufacturingYear,
        odo: vehicleData.odo || 0,
        purchasePrice: vehicleData.purchasePrice,
        sellPrice: vehicleData.sellPrice,
        importDate: vehicleData.importDate || new Date(),
        exportDate: vehicleData.exportDate,
        notes: vehicleData.notes?.trim() || '',
        status: VehicleStatus.IN_STOCK,
        cost: 0,
        costs: [],
        debt: 0,
        profit: 0,
        payments: [],
        storageTime: 0,
        saleStaff: vehicleData.saleStaff || {
          id: '',
          name: '',
          team: '',
          expectedCommission: 0
        },
        statusHistory: [{
          id: `STATUS_${Date.now()}`,
          fromStatus: VehicleStatus.IN_STOCK,
          toStatus: VehicleStatus.IN_STOCK,
          changedAt: new Date(),
          changedBy: 'System',
          notes: 'Nhập kho'
        }],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Cập nhật các giá trị tính toán
      const calculatedVehicle = updateVehicleCalculations(newVehicle);

      // Thêm xe mới vào state và localStorage trước
      const updatedVehicles = [...vehicles, calculatedVehicle];
      setState(prev => ({
        ...prev,
        vehicleList: updatedVehicles
      }));
      localStorage.setItem('vehicles', JSON.stringify(updatedVehicles));

      if (isOnline) {
        try {
          // Đồng bộ trực tiếp với Supabase thông qua syncVehicleToSupabase
          const syncResult = await syncVehicleToSupabase(calculatedVehicle);
          
          if (!syncResult) {
            console.error('Lỗi khi đồng bộ xe. Lưu vào hàng đợi để đồng bộ sau.');
            savePendingSync({ type: 'vehicle_add', data: calculatedVehicle });
          } else {
            console.log('Thêm xe mới thành công và đã đồng bộ với Supabase');
            
            // Hiển thị thông báo thành công
            setSyncMessageData({
              message: 'Thêm xe mới thành công và đã đồng bộ với cơ sở dữ liệu',
              type: 'success'
            });
            setShowSyncMessage(true);
            
            // Ẩn thông báo sau 3 giây
            setTimeout(() => {
              setShowSyncMessage(false);
            }, 3000);
          }
          
          return calculatedVehicle;
        } catch (supabaseError) {
          console.error('Lỗi khi thêm xe vào Supabase:', supabaseError);
          savePendingSync({ type: 'vehicle_add', data: calculatedVehicle });
          throw new Error(`Lỗi khi thêm xe vào Supabase: ${supabaseError instanceof Error ? supabaseError.message : 'Lỗi không xác định'}`);
        }
      } else {
        console.log('Đang offline. Xe sẽ được đồng bộ khi có kết nối.');
        savePendingSync({ type: 'vehicle_add', data: calculatedVehicle });
      }

      return calculatedVehicle;
    } catch (error) {
      console.error('Lỗi khi thêm xe:', error);
      throw error;
    }
  };

  // Xử lý chỉnh sửa xe
  const handleEditVehicle = async (vehicleData: Partial<Vehicle>) => {
    try {
      // Validation đầu vào
      if (!vehicleData.id) {
        throw new Error('ID xe là bắt buộc');
      }
      if (vehicleData.purchasePrice && vehicleData.purchasePrice <= 0) {
        throw new Error('Giá mua phải lớn hơn 0');
      }
      if (vehicleData.sellPrice && vehicleData.sellPrice <= 0) {
        throw new Error('Giá bán phải lớn hơn 0');
      }
      if (vehicleData.purchasePrice && vehicleData.sellPrice && vehicleData.sellPrice <= vehicleData.purchasePrice) {
        throw new Error('Giá bán phải lớn hơn giá mua');
      }
      if (vehicleData.odo && vehicleData.odo < 0) {
        throw new Error('Số km không được âm');
      }

      setHasUnsavedChanges(false);
      
      // Tìm xe trong state
      const existingVehicle = vehicles.find(v => v.id === vehicleData.id);
      console.log('[Edit Vehicle] Tìm xe trong state:', existingVehicle);
      
      // Nếu không tìm thấy trong state, thử tìm trong localStorage
      if (!existingVehicle) {
        console.log('[Edit Vehicle] Không tìm thấy xe trong state, tìm trong localStorage');
        const savedVehicles = localStorage.getItem('vehicles');
        const localVehicles = savedVehicles ? JSON.parse(savedVehicles) : [];
        const localVehicle = localVehicles.find(v => v.id === vehicleData.id);
        
        if (!localVehicle) {
          console.error('[Edit Vehicle] Không tìm thấy xe trong cả state và localStorage');
          throw new Error('Không tìm thấy xe cần cập nhật');
        }

        console.log('[Edit Vehicle] Tìm thấy xe trong localStorage:', localVehicle);
        
        // Cập nhật state với xe từ localStorage
        const updatedVehicle = updateVehicleCalculations({
          ...localVehicle,
          ...vehicleData,
          updated_at: new Date().toISOString()
        } as Vehicle);

        // Cập nhật state
        setState(prev => ({
          ...prev,
          vehicleList: [...prev.vehicleList, updatedVehicle]
        }));

        // Đồng bộ với Supabase
        await syncVehicleToSupabase(updatedVehicle);
        return;
      }

      // Tạo đối tượng xe đã cập nhật với dữ liệu mới
      const updatedVehicle = updateVehicleCalculations({
        ...existingVehicle,
        ...vehicleData,
        updated_at: new Date().toISOString()
      } as Vehicle);

      console.log('[Edit Vehicle] Xe sau khi cập nhật:', updatedVehicle);

      // Cập nhật state trước
      setState(prev => ({
        ...prev,
        vehicleList: prev.vehicleList.map(v => 
          v.id === updatedVehicle.id ? updatedVehicle : v
        )
      }));

      // Lưu vào localStorage
      const updatedVehicles = vehicles.map(v => 
        v.id === updatedVehicle.id ? updatedVehicle : v
      );
      localStorage.setItem('vehicles', JSON.stringify(updatedVehicles));

      // Nếu online, đồng bộ với Supabase
      if (isOnline) {
        try {
          console.log('[Edit Vehicle] Bắt đầu đồng bộ với Supabase');
          
          // Chuẩn bị dữ liệu cho Supabase
          const vehicleForSupabase = {
            id: updatedVehicle.id,
            name: updatedVehicle.name,
            color: updatedVehicle.color,
            manufacturing_year: updatedVehicle.manufacturingYear,
            odo: updatedVehicle.odo,
            purchase_price: updatedVehicle.purchasePrice,
            sell_price: updatedVehicle.sellPrice,
            import_date: updatedVehicle.importDate instanceof Date 
              ? updatedVehicle.importDate.toISOString() 
              : updatedVehicle.importDate,
            export_date: updatedVehicle.exportDate instanceof Date 
              ? updatedVehicle.exportDate?.toISOString() 
              : updatedVehicle.exportDate,
            status: updatedVehicle.status,
            cost: updatedVehicle.cost,
            debt: updatedVehicle.debt,
            profit: updatedVehicle.profit,
            storage_time: updatedVehicle.storageTime,
            sales_staff_id: updatedVehicle.saleStaff?.id || null,
            notes: updatedVehicle.notes || '',
            updated_at: new Date().toISOString()
          };

          // Cập nhật thông tin xe
          const { error: vehicleError } = await supabase
            .from('vehicles')
            .update(vehicleForSupabase)
            .eq('id', updatedVehicle.id);

          if (vehicleError) {
            throw vehicleError;
          }

          // Cập nhật chi phí
          if (updatedVehicle.costs?.length > 0) {
            // Xóa chi phí cũ
            await supabase
              .from('vehicle_costs')
              .delete()
              .eq('vehicle_id', updatedVehicle.id);
            
            // Thêm chi phí mới
            const costsForSupabase = updatedVehicle.costs.map(cost => ({
              id: cost.id,
              vehicle_id: updatedVehicle.id,
              amount: cost.amount,
              cost_date: cost.costDate instanceof Date 
                ? cost.costDate.toISOString() 
                : cost.costDate,
              description: cost.description,
              created_at: cost.created_at || new Date().toISOString(),
              updated_at: new Date().toISOString()
            }));
            
            const { error: costsError } = await supabase
              .from('vehicle_costs')
              .insert(costsForSupabase);
            
            if (costsError) {
              console.error('[Edit Vehicle] Lỗi khi cập nhật chi phí:', costsError);
            }
          }
          
          // Cập nhật thanh toán
          if (updatedVehicle.payments?.length > 0) {
            // Xóa thanh toán cũ
            await supabase
              .from('vehicle_payments')
              .delete()
              .eq('vehicle_id', updatedVehicle.id);
            
            // Thêm thanh toán mới
            const paymentsForSupabase = updatedVehicle.payments.map(payment => ({
              id: payment.id,
              vehicle_id: updatedVehicle.id,
              amount: payment.amount,
              payment_date: payment.date instanceof Date
                ? payment.date.toISOString()
                : payment.date,
              payment_type: payment.type,
              notes: payment.notes,
              created_at: payment.created_at || new Date().toISOString(),
              updated_at: new Date().toISOString()
            }));
            
            const { error: paymentsError } = await supabase
              .from('vehicle_payments')
              .insert(paymentsForSupabase);
            
            if (paymentsError) {
              console.error('[Edit Vehicle] Lỗi khi cập nhật thanh toán:', paymentsError);
            }
          }

          console.log('[Edit Vehicle] Đồng bộ với Supabase thành công');
          
          // Hiển thị thông báo thành công
          setSyncMessageData({
            message: 'Cập nhật xe thành công',
            type: 'success'
          });
          setShowSyncMessage(true);
          setTimeout(() => setShowSyncMessage(false), 3000);
        } catch (error) {
          console.error('[Edit Vehicle] Lỗi khi đồng bộ với Supabase:', error);
          // Lưu vào pending sync để thử lại sau
          savePendingSync({ type: 'vehicle_update', data: updatedVehicle });
          throw new Error(`Lỗi khi đồng bộ: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`);
        }
      } else {
        console.log('[Edit Vehicle] Đang offline, lưu vào pending sync');
        savePendingSync({ type: 'vehicle_update', data: updatedVehicle });
      }

    } catch (error) {
      console.error('[Edit Vehicle] Lỗi:', error);
      setSyncMessageData({
        message: error instanceof Error ? error.message : 'Lỗi không xác định khi cập nhật xe',
        type: 'error'
      });
      setShowSyncMessage(true);
      setTimeout(() => setShowSyncMessage(false), 3000);
      throw error;
    }
  };

  // Sử dụng hook xóa xe
  const { deleteVehicle, isDeleting, error: deleteError } = useVehicleDelete({
    supabase,
    onSuccess: () => {
      setState(prev => ({
        ...prev,
        vehicleList: prev.vehicleList.filter(v => v.id !== vehicleToDelete)
      }));
      
      // Xóa khỏi localStorage
      const localVehicles = JSON.parse(localStorage.getItem('vehicles') || '[]');
      localStorage.setItem('vehicles', JSON.stringify(localVehicles.filter((v: Vehicle) => v.id !== vehicleToDelete)));
    },
    onError: (error) => {
      console.error('Lỗi khi xóa xe:', error);
      setSyncMessageData({
        message: error.message,
        type: 'error'
      });
      setShowSyncMessage(true);
      setTimeout(() => setShowSyncMessage(false), 3000);
    }
  });

  // Cập nhật hàm handleDeleteVehicle
  const handleDeleteVehicle = async (vehicleId: string) => {
    try {
      await deleteVehicle(vehicleId);
    } catch (error) {
      console.error('Lỗi khi xóa xe:', error);
      throw error;
    }
  };

  // Xử lý mở form chỉnh sửa xe
  const handleOpenEditVehicleForm = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setIsVehicleFormOpen(true);
  };

  // Xử lý thay đổi trạng thái xe
  const handleStatusChange = (vehicle: Vehicle) => {
    setSelectedVehicleForStatusChange(vehicle);
    setIsStatusChangeModalOpen(true);
  };

  // Xử lý xác nhận thay đổi trạng thái xe
  const handleStatusChangeConfirm = async (updatedVehicle: Vehicle) => {
    // Lưu trạng thái cũ trước khi cập nhật
    const oldVehicle = vehicles.find(v => v.id === updatedVehicle.id);
    const oldStatus = oldVehicle?.status;
    
    // Cập nhật các giá trị tính toán của xe
    const calculatedVehicle = updateVehicleCalculations(updatedVehicle);
    
    // Kiểm tra trạng thái đặc biệt
    if (calculatedVehicle.status === VehicleStatus.SOLD) {
      // Đảm bảo công nợ đã được xóa khi xe đã bán
      calculatedVehicle.debt = 0;
      console.log(`Đảm bảo công nợ = 0 khi xe đã bán: ${calculatedVehicle.id}`);
    }
    
    // Cập nhật trạng thái xe
    setState(prev => ({
      ...prev,
      vehicleList: vehicles.map(vehicle => 
        vehicle.id === calculatedVehicle.id ? calculatedVehicle : vehicle
      )
    }));
    
    // Lưu dữ liệu vào localStorage
    localStorage.setItem('vehicles', JSON.stringify(
      vehicles.map(vehicle => 
        vehicle.id === calculatedVehicle.id ? calculatedVehicle : vehicle
      )
    ));
    
    // Đồng bộ với Supabase nếu online
    if (isOnline) {
      try {
        // Sử dụng hàm syncVehicleToSupabase để đồng bộ cả thông tin xe và thanh toán
        console.log(`Bắt đầu đồng bộ xe ${calculatedVehicle.id}, công nợ hiện tại: ${calculatedVehicle.debt}`);
        const syncResult = await syncVehicleToSupabase(calculatedVehicle);
        
        if (!syncResult) {
          console.error('Lỗi khi đồng bộ xe với Supabase');
          // Lưu vào pending sync nếu có lỗi
          savePendingSync({ type: 'vehicle_update', data: calculatedVehicle });
        } else {
          console.log(`Đồng bộ xe ${calculatedVehicle.id} thành công!`);
        }
      } catch (e) {
        console.error('Lỗi khi đồng bộ trạng thái xe:', e);
        savePendingSync({ type: 'vehicle_update', data: calculatedVehicle });
      }
    } else {
      // Lưu vào pending sync nếu offline
      savePendingSync({ type: 'vehicle_update', data: calculatedVehicle });
    }
    
    // Cập nhật thông tin nhân viên liên quan
    if (calculatedVehicle.saleStaff && calculatedVehicle.saleStaff.id) {
      const saleStaffId = calculatedVehicle.saleStaff.id;
      
      // Cập nhật số lượng xe đã bán của nhân viên
      setStaffList(prevStaffList => {
        return prevStaffList.map(staff => {
          if (staff.id === saleStaffId) {
            // Đếm số xe đã bán của nhân viên
            let vehiclesSold = staff.vehiclesSold;
            
            // Nếu trạng thái mới là SOLD, tăng số lượng xe bán
            if (calculatedVehicle.status === VehicleStatus.SOLD && oldStatus !== VehicleStatus.SOLD) {
              vehiclesSold++;
            }
            // Nếu trạng thái cũ là SOLD nhưng mới không phải, giảm số lượng
            else if (oldStatus === VehicleStatus.SOLD && calculatedVehicle.status !== VehicleStatus.SOLD) {
              vehiclesSold = Math.max(0, vehiclesSold - 1);
            }
            
            // Cập nhật thông tin nhân viên
            return {
              ...staff,
              vehiclesSold: vehiclesSold,
              totalCommission: calculateTotalCommission(vehiclesSold, staff.commissionRate)
            };
          }
          return staff;
        });
      });
    }
    
    setIsStatusChangeModalOpen(false);
  };

  // Xử lý thêm chi phí
  const handleAddCost = async (vehicleId: string, costAmount: number, description: string) => {
    try {
      // Tìm xe cần thêm chi phí
      const vehicle = vehicles.find(v => v.id === vehicleId);
      if (!vehicle) {
        throw new Error('Không tìm thấy xe');
      }

      // Tạo thông tin chi phí mới
      const newCost: CostInfo = {
        id: `COST_${Date.now()}`, // Tạo ID duy nhất
        amount: costAmount,
        date: new Date(),
        description: description.trim()
      };

      // Cập nhật chi phí
      const updatedVehicle = {
        ...vehicle,
        cost: vehicle.cost + costAmount,
        costs: [...(vehicle.costs || []), newCost],
      };

      // Cập nhật các giá trị tính toán (bao gồm lợi nhuận)
      const calculatedVehicle = updateVehicleCalculations(updatedVehicle as Vehicle);

      // Cập nhật danh sách xe
      setState(prev => ({
        ...prev,
        vehicleList: vehicles.map(v => v.id === vehicleId ? calculatedVehicle : v)
      }));

      // Lưu dữ liệu vào localStorage
      localStorage.setItem('vehicles', JSON.stringify(
        vehicles.map(v => v.id === vehicleId ? calculatedVehicle : v)
      ));

      // Đồng bộ với Supabase nếu online
      if (isOnline) {
        try {
          // Tạo đối tượng chi phí để lưu trong Supabase
          const costData = {
            vehicle_id: vehicleId,
            amount: newCost.amount,
            cost_date: newCost.date.toISOString(),
            description: newCost.description,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            id: newCost.id // Đặt id ở cuối để khớp với schema DB
          };
          
          // Thêm chi phí vào bảng vehicle_costs
          const { error: costError } = await supabase
            .from('vehicle_costs')
            .insert([costData]);
            
          if (costError) {
            console.error('Lỗi khi thêm chi phí vào Supabase:', costError);
          }
            
          // Cập nhật tổng chi phí trong bảng vehicles
          const vehicleForSupabase = {
            id: calculatedVehicle.id,
            cost: calculatedVehicle.cost,
            profit: calculatedVehicle.profit,
            updated_at: new Date().toISOString()
          };
            
          const { error: vehicleError } = await supabase
            .from('vehicles')
            .update(vehicleForSupabase)
            .eq('id', vehicleId);
            
          if (vehicleError) {
            console.error('Lỗi khi cập nhật chi phí xe trong Supabase:', vehicleError);
            // Lưu vào pending sync nếu có lỗi
            savePendingSync({ type: 'vehicle_update', data: calculatedVehicle });
          }
        } catch (e) {
          console.error('Lỗi khi đồng bộ chi phí xe:', e);
          savePendingSync({ type: 'vehicle_update', data: calculatedVehicle });
        }
      } else {
        // Lưu vào pending sync nếu offline
        savePendingSync({ type: 'vehicle_update', data: calculatedVehicle });
      }

      // Cập nhật KPI nếu cần thiết (khi chi phí ảnh hưởng đến lợi nhuận)
      if (calculatedVehicle.status === VehicleStatus.SOLD && calculatedVehicle.saleStaff?.id) {
        const saleStaffId = calculatedVehicle.saleStaff.id;
        
        // Cập nhật thông tin nhân viên liên quan
        setStaffList(prevStaffList => {
          return prevStaffList.map(staff => {
            if (staff.id === saleStaffId) {
              // Cập nhật thông tin nhân viên nếu cần
              return {
                ...staff,
                // Các thông tin về lợi nhuận có thể được cập nhật ở đây nếu cần
              };
            }
            return staff;
          });
        });
      }

      // Tạo thông báo thành công nếu cần
      console.log(`Đã thêm chi phí ${costAmount.toLocaleString()} VNĐ cho xe ${vehicle.name}`);
      
      return Promise.resolve();
    } catch (error) {
      console.error('Lỗi khi thêm chi phí:', error);
      return Promise.reject(error);
    }
  };

  // Xử lý mở form thêm xe mới
  const handleOpenAddVehicleForm = () => {
    setEditingVehicle(undefined);
    setIsVehicleFormOpen(true);
  };

  // Xử lý thêm nhân viên mới
  const handleAddStaff = async (staffData: Partial<Staff>) => {
    try {
      const newStaff: Staff = {
        ...staffData as Staff,
        id: generateStaffId(staffList, staffData.name || ''),
        status: StaffStatus.ACTIVE,
        vehiclesSold: 0,
        totalCommission: 0
      };

      // Thêm vào localStorage trước
      const updatedStaffList = [...staffList, newStaff];
      setStaffList(updatedStaffList);
      localStorage.setItem('staffList', JSON.stringify(updatedStaffList));

      if (isOnline) {
        try {
          // Tạo đối tượng để đưa vào Supabase (chuyển đổi từ camelCase sang snake_case)
          const staffForSupabase = {
            id: newStaff.id,
            name: newStaff.name,
            phone: newStaff.phone,
            email: newStaff.email,
            team: newStaff.team,
            role: newStaff.role,
            status: newStaff.status,
            join_date: newStaff.joinDate instanceof Date ? newStaff.joinDate.toISOString() : newStaff.joinDate,
            leave_date: newStaff.terminationDate instanceof Date ? newStaff.terminationDate.toISOString() : null,
            commission_rate: newStaff.commissionRate,
            base_salary: newStaff.salary,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
            // Không đưa các trường không có trong bảng Supabase
            // address, vehiclesSold, totalCommission, note không được đưa vào
          };

          // Thêm vào Supabase
          const { error } = await supabase
            .from('staff')
            .insert([staffForSupabase]);

          if (error) throw error;
        } catch (error) {
          console.error('Lỗi khi thêm nhân viên vào Supabase:', error);
          // Lưu vào pending sync nếu có lỗi, chuyển đổi dữ liệu cho phù hợp với SyncAction
          const staffForSync = {
            id: newStaff.id,
            name: newStaff.name,
            phone: newStaff.phone,
            email: newStaff.email,
            team: newStaff.team,
            role: newStaff.role,
            status: newStaff.status,
            joinDate: newStaff.joinDate,
            leaveDate: newStaff.terminationDate,
            commissionRate: newStaff.commissionRate,
            baseSalary: newStaff.salary,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          savePendingSync({ type: 'staff_add', data: staffForSync });
        }
      } else {
        // Lưu vào pending sync nếu offline, chuyển đổi dữ liệu cho phù hợp với SyncAction
        const staffForSync = {
          id: newStaff.id,
          name: newStaff.name,
          phone: newStaff.phone,
          email: newStaff.email,
          team: newStaff.team,
          role: newStaff.role,
          status: newStaff.status,
          joinDate: newStaff.joinDate,
          leaveDate: newStaff.terminationDate,
          commissionRate: newStaff.commissionRate,
          baseSalary: newStaff.salary,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        savePendingSync({ type: 'staff_add', data: staffForSync });
      }

      // Hiển thị thông báo thành công
      setSyncMessageData({
        message: 'Thêm nhân viên mới thành công',
        type: 'success'
      });
      setShowSyncMessage(true);
      setTimeout(() => setShowSyncMessage(false), 3000);

    } catch (error) {
      console.error('Lỗi khi thêm nhân viên:', error);
      setSyncMessageData({
        message: 'Lỗi khi thêm nhân viên mới',
        type: 'error'
      });
      setShowSyncMessage(true);
      setTimeout(() => setShowSyncMessage(false), 3000);
    }
  };

  // Xử lý chỉnh sửa nhân viên
  const handleEditStaff = async (staffData: Partial<Staff>) => {
    try {
      // Tìm nhân viên cần cập nhật
      const existingStaff = staffList.find(s => s.id === staffData.id);
      if (!existingStaff) {
        throw new Error('Không tìm thấy nhân viên cần cập nhật');
      }

      // Tạo đối tượng nhân viên đã cập nhật
      const updatedStaff = {
        ...existingStaff,
        ...staffData
      };

      if (isOnline) {
        // Cập nhật trong Supabase
        const { error } = await supabase
          .from('staff')
          .update(updatedStaff)
          .eq('id', updatedStaff.id);

        if (error) throw error;
      } else {
        // Cập nhật trong localStorage và pending sync
        const updatedStaffList = staffList.map(s => 
          s.id === updatedStaff.id ? updatedStaff : s
        );
        setStaffList(updatedStaffList);
        localStorage.setItem('staffList', JSON.stringify(updatedStaffList));
        savePendingSync({ type: 'staff_update', data: updatedStaff });
      }

      // Hiển thị thông báo thành công
      setSyncMessageData({
        message: 'Cập nhật nhân viên thành công',
        type: 'success'
      });
      setShowSyncMessage(true);
      setTimeout(() => setShowSyncMessage(false), 3000);

    } catch (error) {
      console.error('Lỗi khi cập nhật nhân viên:', error);
      setSyncMessageData({
        message: 'Lỗi khi cập nhật nhân viên',
        type: 'error'
      });
      setShowSyncMessage(true);
      setTimeout(() => setShowSyncMessage(false), 3000);
    }
  };

  // Xử lý xóa nhân viên
  const handleDeleteStaff = async (staffId: string) => {
    try {
      // Kiểm tra xem nhân viên có tồn tại không
      const staffToDelete = staffList.find(s => s.id === staffId);
      if (!staffToDelete) {
        throw new Error(`Không tìm thấy nhân viên với ID: ${staffId}`);
      }

      console.log(`Đang xóa nhân viên: ${staffId}`, staffToDelete);
      
      // Nếu online, xóa từ Supabase trước
      if (isOnline) {
        try {
          console.log("Đang kết nối với Supabase để xóa nhân viên...");
          
          // Sử dụng hàm handleStaffDelete từ syncService
          await handleStaffDelete({ type: 'staff_delete', data: { id: staffId } });
          
          console.log("Đã xóa nhân viên từ Supabase thành công");
        } catch (supabaseError) {
          console.error('Lỗi khi xóa nhân viên từ Supabase:', supabaseError);
          
          // Ghi nhận thao tác để đồng bộ sau nếu lỗi không phải là ràng buộc dữ liệu
          if (!(supabaseError as Error).message?.includes('foreign key constraint')) {
            savePendingSync({ type: 'staff_delete', data: { id: staffId } });
          }
          
          // Hiển thị thông báo lỗi
          setSyncMessageData({
            message: `Lỗi khi xóa nhân viên: ${(supabaseError as Error).message}`,
            type: 'error'
          });
          setShowSyncMessage(true);
          setTimeout(() => setShowSyncMessage(false), 3000);
          
          // Nếu lỗi ràng buộc khóa ngoại, không xóa khỏi localStorage
          if ((supabaseError as Error).message?.includes('foreign key constraint')) {
            throw supabaseError; // Chuyển tiếp lỗi để component gọi có thể xử lý
          }
        }
      } else {
        // Nếu offline, lưu thao tác xóa vào hàng đợi đồng bộ
        savePendingSync({ type: 'staff_delete', data: { id: staffId } });
      }

      // Sau khi xóa từ Supabase (hoặc nếu offline), cập nhật state và localStorage
      const updatedStaffList = staffList.filter(staff => staff.id !== staffId);
      setStaffList(updatedStaffList);
      localStorage.setItem('staffList', JSON.stringify(updatedStaffList));

      // Hiển thị thông báo thành công
      setSyncMessageData({
        message: `Đã xóa nhân viên ${staffToDelete.name} thành công`,
        type: 'success'
      });
      setShowSyncMessage(true);
      setTimeout(() => setShowSyncMessage(false), 3000);

    } catch (error) {
      console.error('Lỗi khi xóa nhân viên:', error);
      
      // Hiển thị thông báo lỗi
      setSyncMessageData({
        message: `Lỗi khi xóa nhân viên: ${(error as Error).message}`,
        type: 'error'
      });
      setShowSyncMessage(true);
      setTimeout(() => setShowSyncMessage(false), 3000);
    }
  };

  // Hàm xử lý chuyển tab an toàn, kiểm tra nếu có dữ liệu chưa lưu
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    // Nếu có dữ liệu chưa lưu và đang chuyển từ tab xe (tab 0)
    if (hasUnsavedChanges && currentTab === 0) {
      // Hiển thị xác nhận nếu có dữ liệu chưa lưu
      const confirmChange = window.confirm('Bạn có dữ liệu chưa lưu. Bạn có chắc chắn muốn chuyển tab không?');
      if (!confirmChange) {
        return; // Không chuyển tab nếu người dùng chọn hủy
      }
      // Reset cờ dữ liệu chưa lưu nếu người dùng xác nhận
      setHasUnsavedChanges(false);
    }
    
    setCurrentTab(newValue);
  };

  // Xử lý thay đổi tháng/năm toàn cục
  const handleGlobalDateChange = (month: number, year: number) => {
    setGlobalMonth(month);
    setGlobalYear(year);
  };

  // Xử lý lưu KPI
  const handleSaveKpi = async (kpiTargets: KpiTarget[]) => {
    try {
      if (isOnline) {
        // Cập nhật trong Supabase
        const { error } = await supabase
          .from('kpi_targets')
          .upsert(kpiTargets);

        if (error) throw error;
      } else {
        // Cập nhật trong localStorage và pending sync
        setKpiList(kpiTargets);
        localStorage.setItem('kpis', JSON.stringify(kpiTargets));
        savePendingSync({ type: 'kpi_update', data: kpiTargets });
      }

      // Hiển thị thông báo thành công
      setSyncMessageData({
        message: 'Cập nhật KPI thành công',
        type: 'success'
      });
      setShowSyncMessage(true);
      setTimeout(() => setShowSyncMessage(false), 3000);

    } catch (error) {
      console.error('Lỗi khi cập nhật KPI:', error);
      setSyncMessageData({
        message: 'Lỗi khi cập nhật KPI',
        type: 'error'
      });
      setShowSyncMessage(true);
      setTimeout(() => setShowSyncMessage(false), 3000);
    }
  };

  // Xử lý lưu thưởng phòng hỗ trợ
  const handleSaveSupportBonus = async (bonuses: SupportDepartmentBonus[]) => {
    try {
      // Kiểm tra dữ liệu đầu vào
      if (!Array.isArray(bonuses)) {
        throw new Error('Dữ liệu thưởng không hợp lệ');
      }

      // Chuẩn bị dữ liệu để lưu
      const dataToSave = bonuses.map(bonus => {
        if (!bonus.department) {
          throw new Error('Tên phòng ban không được để trống');
        }

        return {
          department: bonus.department,
          bonus_month: bonus.bonusMonth instanceof Date 
            ? bonus.bonusMonth.toISOString()
            : bonus.bonusMonth,
          bonus_amount: bonus.bonusAmount,
          achievement_rate: bonus.achievementRate,
          notes: bonus.notes,
          updated_at: new Date().toISOString(),
          ...(bonus.id && { id: bonus.id })
        };
      });

      if (isOnline) {
        // Cập nhật trong Supabase
        const { error } = await supabase
          .from('support_bonuses')
          .upsert(dataToSave, { 
            onConflict: 'id',
            ignoreDuplicates: false
          });

        if (error) throw error;
      } else {
        // Cập nhật trong localStorage và pending sync
        setSupportBonus(bonuses);
        localStorage.setItem('supportBonuses', JSON.stringify(bonuses));
        savePendingSync({ type: 'bonus_update', data: bonuses });
      }

      // Hiển thị thông báo thành công
      setSyncMessageData({
        message: 'Cập nhật thưởng phòng hỗ trợ thành công',
        type: 'success'
      });
      setShowSyncMessage(true);
      setTimeout(() => setShowSyncMessage(false), 3000);

    } catch (error) {
      console.error('Lỗi khi cập nhật thưởng phòng hỗ trợ:', error);
      setSyncMessageData({
        message: error instanceof Error ? error.message : 'Lỗi khi cập nhật thưởng phòng hỗ trợ',
        type: 'error'
      });
      setShowSyncMessage(true);
      setTimeout(() => setShowSyncMessage(false), 3000);
    }
  };

  // Tính toán thống kê với useMemo
  const statistics = useMemo(() => {
    // Đếm số xe theo trạng thái
    const vehicleCountByStatus: Record<VehicleStatus, number> = {
      [VehicleStatus.IN_STOCK]: 0,
      [VehicleStatus.DEPOSITED]: 0,
      [VehicleStatus.BANK_DEPOSITED]: 0,
      [VehicleStatus.OFFSET]: 0,
      [VehicleStatus.SOLD]: 0
    };
    
    // Tính tổng chi phí, lợi nhuận
    let totalProfit = 0;
    let totalRevenue = 0;
    let totalCost = 0;
    
    // Tháng và năm hiện tại để lọc dữ liệu
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Lọc xe theo tháng và năm
    const vehiclesThisMonth = vehicles.filter(vehicle => {
      const rawDate = vehicle.status === VehicleStatus.SOLD
        ? vehicle.exportDate
        : vehicle.importDate;
        
      if (!rawDate) return false;
      
      const vehicleDate = rawDate instanceof Date 
        ? rawDate 
        : new Date(rawDate);
      
      if (isNaN(vehicleDate.getTime())) {
        console.warn('Ngày không hợp lệ:', rawDate);
        return false;
      }
      
      return vehicleDate.getMonth() === currentMonth &&
             vehicleDate.getFullYear() === currentYear;
    });
    
    // Cập nhật số liệu thống kê
    vehicles.forEach(vehicle => {
      // Đếm xe theo trạng thái
      vehicleCountByStatus[vehicle.status]++;
      
      // Cộng dồn lợi nhuận và doanh thu
      totalProfit += vehicle.profit;
      
      if (vehicle.status === VehicleStatus.SOLD) {
        totalRevenue += vehicle.sellPrice;
      }
      
      // Cộng dồn chi phí
      totalCost += vehicle.cost;
    });
    
    return {
      vehicleCountByStatus,
      totalProfit,
      totalRevenue,
      totalCost,
      vehiclesThisMonth
    };
  }, [vehicles]);
  
  // Lọc xe theo trạng thái
  const inStockVehicles = vehicles.filter(v => v.status === VehicleStatus.IN_STOCK);
  const depositedVehicles = vehicles.filter(v => v.status === VehicleStatus.DEPOSITED);
  const soldVehicles = vehicles.filter(v => v.status === VehicleStatus.SOLD);
  
  // Lấy danh sách nhân viên đang hoạt động với useMemo
  const activeStaff = useMemo(() => {
    return staffList.filter(staff => staff.status === StaffStatus.ACTIVE);
  }, [staffList]);

  // Xử lý khi nhấn vào nút báo cáo
  const handleReportClick = () => {
    // Thêm mã xử lý khi cần
    const _statistics = vehicles.reduce((acc, vehicle) => {
      // ... logic tính toán thống kê
      return acc;
    }, {});

    // Các biến thống kê
    const _inStockVehicles = vehicles.filter(v => v.status === VehicleStatus.IN_STOCK);

    // Xe đã đặt cọc
    const _depositedVehicles = vehicles.filter(v => v.status === VehicleStatus.DEPOSITED);

    // ... các biến khác
    
    // Xe đã bán
    const _soldVehicles = vehicles.filter(v => v.status === VehicleStatus.SOLD);

    // Nhân viên đang hoạt động
    const _activeStaff = staffList.filter(s => s.status === StaffStatus.ACTIVE);
  
    // Chuyển sang tab báo cáo
    setCurrentTab(2);
  };

  // Thêm useEffect cho real-time subscription
  useEffect(() => {
    let mounted = true;
    
    // Hàm khởi tạo subscription
    const setupSubscriptions = async () => {
      if (!isOnline) return;

      // Subscription cho vehicles
      const vehiclesSubscription = supabase
        .channel('vehicles-changes')
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'vehicles' 
        }, (payload) => {
          if (!mounted) return;
          
          if (payload.eventType === 'INSERT') {
            setState(prev => ({
              ...prev,
              vehicleList: [...prev.vehicleList, payload.new as Vehicle]
            }));
          } else if (payload.eventType === 'UPDATE') {
            setState(prev => ({
              ...prev,
              vehicleList: prev.vehicleList.map(v => 
                v.id === payload.new.id ? payload.new as Vehicle : v
              )
            }));
          } else if (payload.eventType === 'DELETE') {
            setState(prev => ({
              ...prev,
              vehicleList: prev.vehicleList.filter(v => v.id !== payload.old.id)
            }));
          }
        })
        .subscribe();

      // Subscription cho staff
      const staffSubscription = supabase
        .channel('staff-changes')
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'staff' 
        }, (payload) => {
          if (!mounted) return;
          
          if (payload.eventType === 'INSERT') {
            setStaffList(prev => [...prev, payload.new as Staff]);
          } else if (payload.eventType === 'UPDATE') {
            setStaffList(prev => prev.map(s => 
              s.id === payload.new.id ? payload.new as Staff : s
            ));
          } else if (payload.eventType === 'DELETE') {
            setStaffList(prev => prev.filter(s => s.id !== payload.old.id));
          }
        })
        .subscribe();

      // Subscription cho KPI
      const kpiSubscription = supabase
        .channel('kpi-changes')
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'kpi_targets' 
        }, (payload) => {
          if (!mounted) return;
          setKpiList(prev => {
            if (payload.eventType === 'INSERT') {
              return [...prev, payload.new as KpiTarget];
            } else if (payload.eventType === 'UPDATE') {
              return prev.map(k => k.id === payload.new.id ? payload.new as KpiTarget : k);
            } else if (payload.eventType === 'DELETE') {
              return prev.filter(k => k.id !== payload.old.id);
            }
            return prev;
          });
        })
        .subscribe();

      return () => {
        vehiclesSubscription.unsubscribe();
        staffSubscription.unsubscribe();
        kpiSubscription.unsubscribe();
        mounted = false;
      };
    };

    setupSubscriptions();

    return () => {
      mounted = false;
    };
  }, [isOnline]);

  // Cập nhật useEffect cho việc load dữ liệu ban đầu
  useEffect(() => {
    let mounted = true;
    
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        
        const [vehiclesData, staffData, kpiData, bonusData] = await Promise.all([
          loadVehiclesFromSupabase(),
          loadStaffFromSupabase(),
          loadKpiFromSupabase(),
          loadSupportBonusFromSupabase()
        ]);

        if (!mounted) return;

        // Chuyển đổi ngày tháng cho dữ liệu xe
        const processedVehicles = vehiclesData.map((v: Vehicle) => ({
          ...v,
          importDate: new Date(v.importDate),
          exportDate: v.exportDate ? new Date(v.exportDate) : null
        }));

        // Chuyển đổi ngày tháng cho dữ liệu nhân viên
        const processedStaff = staffData.map((s: Staff) => ({
          ...s,
          joinDate: new Date(s.joinDate),
          terminationDate: s.terminationDate ? new Date(s.terminationDate) : null
        }));

        setState(prev => ({
          ...prev,
          vehicleList: processedVehicles,
          staff: processedStaff,
          kpiTargets: kpiData,
          supportBonus: bonusData
        }));

        // Lưu vào localStorage
        localStorage.setItem('vehicles', JSON.stringify(processedVehicles));
        localStorage.setItem('staffList', JSON.stringify(processedStaff));
        localStorage.setItem('kpis', JSON.stringify(kpiData));
        localStorage.setItem('supportBonuses', JSON.stringify(bonusData));
        
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu ban đầu:', error);
        loadFromLocalStorage();
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadInitialData();

    return () => {
      mounted = false;
    };
  }, []);

  // Thêm hàm loadFromLocalStorage
  const loadFromLocalStorage = () => {
    const savedVehicles = localStorage.getItem('vehicles');
    const savedStaff = localStorage.getItem('staffList');
    const savedKpis = localStorage.getItem('kpis');
    const savedBonuses = localStorage.getItem('supportBonuses');

    if (savedVehicles) {
      setState(prev => ({
        ...prev,
        vehicleList: JSON.parse(savedVehicles).map((v: Vehicle) => ({
          ...v,
          importDate: new Date(v.importDate),
          exportDate: v.exportDate ? new Date(v.exportDate) : null
        }))
      }));
    }

    if (savedStaff) {
      setStaffList(JSON.parse(savedStaff).map((s: Staff) => ({
        ...s,
        joinDate: new Date(s.joinDate),
        terminationDate: s.terminationDate ? new Date(s.terminationDate) : null
      })));
    }

    if (savedKpis) {
      setKpiList(JSON.parse(savedKpis));
    }

    if (savedBonuses) {
      setSupportBonus(JSON.parse(savedBonuses));
    }
  };

  // Thêm các hàm setter
  const setShowSyncMessage = (value: boolean) => {
    setState(prev => ({ ...prev, showSyncMessage: value }));
  };

  const setSyncMessageData = (data: SyncMessage) => {
    setState(prev => ({ ...prev, syncMessageData: data }));
  };

  const setCurrentTab = (value: number) => {
    setState(prev => ({ ...prev, currentTab: value }));
  };

  const setKpiList = (value: KpiTarget[]) => {
    setState(prev => ({ ...prev, kpiList: value }));
  };

  const setSupportBonus = (value: SupportDepartmentBonus[]) => {
    setState(prev => ({ ...prev, supportBonus: value }));
  };

  // Thêm hàm cập nhật dữ liệu tài chính
  const handleUpdateFinancialData = (data: any) => {
    setState(prevState => ({
      ...prevState,
      financialData: {
        ...prevState.financialData,
        ...data
      }
    }));
    
    // Lưu dữ liệu tài chính vào localStorage
    localStorage.setItem('financialData', JSON.stringify({
      ...state.financialData,
      ...data
    }));
  };

  // Hiển thị thông báo kết nối
  const renderConnectionStatus = () => {
    switch (connectionStatus) {
      case 'checking':
        return (
          <div className="connection-status checking">
            <p>Đang kiểm tra kết nối...</p>
          </div>
        );
      case 'connected':
        return (
          <div className="connection-status connected">
            <p>Kết nối Supabase thành công ✅</p>
          </div>
        );
      case 'disconnected':
        return (
          <div className="connection-status disconnected">
            <p>Lỗi kết nối: {connectionError}</p>
          </div>
        );
    }
  };

  // Component chính của ứng dụng
  const MainApp = () => (
    <Container maxWidth={false} sx={{ p: 0 }}>
      <CssBaseline />
      <Box sx={{ width: '100%' }}>
        {connectionStatus === 'checking' ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <CircularProgress />
            <Typography variant="h6" sx={{ ml: 2 }}>
              Đang kiểm tra kết nối...
            </Typography>
          </Box>
        ) : connectionStatus === 'disconnected' ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Alert severity="error" sx={{ mb: 2 }}>
              {connectionError || 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối internet.'}
            </Alert>
            <Button variant="contained" onClick={() => window.location.reload()}>
              Thử lại
            </Button>
          </Box>
        ) : (
          <>
            {/* Rest of your UI here */}
            {/* ... */}
          </>
        )}
      </Box>
    </Container>
  );

  return (
    <Routes>
      <Route path="/login" element={
        <LoginRoute>
          <Login />
        </LoginRoute>
      } />
      <Route path="/" element={
        <ProtectedRoute>
          <MainApp />
        </ProtectedRoute>
      } />
      <Route path="/account-management" element={
        <ProtectedRoute>
          <AccountManagement />
        </ProtectedRoute>
      } />
      <Route path="*" element={
        <FunctionalErrorBoundary>
          <Navigate to="/" replace />
        </FunctionalErrorBoundary>
      } />
    </Routes>
  );
}

export default App;
