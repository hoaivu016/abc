import React, { useState, useCallback } from 'react';
import { Box, Typography, Tabs, Tab } from '@mui/material';
import { VehicleStatus } from '../../../../types/vehicles/vehicle';
import FinancialInputs from './components/FinancialInputs';
import FinancialOverview from './components/FinancialOverview';
import DebtAnalysis from './components/DebtAnalysis';
import CapitalEfficiency from './components/CapitalEfficiency';
import BusinessCycle from './components/BusinessCycle';
import CapitalInfo from './components/CapitalInfo';
import { useFinancialAnalysis } from '../../../../hooks/useFinancialAnalysis';
import { CapitalList } from '../CapitalList';

interface Payment {
  type: 'DEPOSIT' | 'BANK_DEPOSIT' | 'OFFSET' | 'FULL_PAYMENT';
  amount: number;
}

interface StatusHistory {
  toStatus: VehicleStatus;
  changedAt: string;
}

interface Vehicle {
  status: VehicleStatus;
  sellPrice?: number;
  profit?: number;
  storageTime?: number;
  payments?: Payment[];
  statusHistory?: StatusHistory[];
  purchasePrice?: number;
}

interface FinancialInputData {
  capitalAmount: number;
  loanAmount: number;
  interestRate: number;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`financial-tabpanel-${index}`}
    aria-labelledby={`financial-tab-${index}`}
  >
    {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
  </div>
);

interface FinancialAnalysisProps {
  vehicles: Vehicle[];
  capitalAmount?: number;
  loanAmount?: number;
  interestRate?: number;
  onUpdateFinancialData?: (data: FinancialInputData) => void;
}

const TAB_LABELS = [
  'Tổng Quan Tài Chính',
  'Chỉ Số Công Nợ',
  'Hiệu Quả Vốn',
  'Chu Kỳ Kinh Doanh',
  'Thông Tin Vốn'
];

const FinancialAnalysis: React.FC<FinancialAnalysisProps> = ({
  vehicles = [],
  capitalAmount = 0,
  loanAmount = 0,
  interestRate = 0,
  onUpdateFinancialData
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [financialInputs, setFinancialInputs] = useState<FinancialInputData>({
    capitalAmount,
    loanAmount,
    interestRate
  });

  // Xử lý thay đổi tab
  const handleTabChange = useCallback((_event: unknown, newValue: number) => {
    setActiveTab(newValue);
  }, []);

  // Xử lý thay đổi input
  const handleInputChange = useCallback((field: keyof FinancialInputData, value: number) => {
    const newInputs: FinancialInputData = {
      ...financialInputs,
      [field]: value
    };
    setFinancialInputs(newInputs);
    onUpdateFinancialData?.(newInputs);
  }, [financialInputs, onUpdateFinancialData]);

  // Sử dụng hook để tính toán các chỉ số tài chính
  const financialMetrics = useFinancialAnalysis(vehicles, financialInputs);

  return (
    <Box sx={{ width: '100%', p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Phân Tích Tài Chính
      </Typography>
      
      <FinancialInputs
        capitalAmount={financialInputs.capitalAmount}
        loanAmount={financialInputs.loanAmount}
        interestRate={financialInputs.interestRate}
        onInputChange={handleInputChange}
      />
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          {TAB_LABELS.map((label, index) => (
            <Tab key={index} label={label} />
          ))}
        </Tabs>
      </Box>
      
      <TabPanel value={activeTab} index={0}>
        <FinancialOverview metrics={financialMetrics?.overview} />
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <DebtAnalysis metrics={financialMetrics?.debt} />
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        <CapitalEfficiency metrics={financialMetrics?.capital} />
      </TabPanel>

      <TabPanel value={activeTab} index={3}>
        <BusinessCycle metrics={financialMetrics?.cycle} />
      </TabPanel>

      <TabPanel value={activeTab} index={4}>
        <CapitalList />
      </TabPanel>
    </Box>
  );
};

export default FinancialAnalysis; 