import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';

// Đăng ký tất cả các components cần thiết cho Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// Cấu hình mặc định cho Chart.js
ChartJS.defaults.font.family = 'Mulish, sans-serif';
ChartJS.defaults.color = '#666';
ChartJS.defaults.responsive = true; 