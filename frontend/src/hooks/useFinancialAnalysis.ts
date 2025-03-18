import { useMemo } from 'react';
import { VehicleStatus } from '../types/vehicles/vehicle';

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

interface FinancialMetrics {
  overview: {
    totalVehicles: number;
    soldCount: number;
    totalRevenue: number;
    totalProfit: number;
    interestCost: number;
    avgStorageTime: number;
  };
  debt: {
    installmentRate: number;
    avgDebtRecoveryTime: number;
    paymentAnalysis: {
      type: string;
      count: number;
      total: number;
    }[];
  };
  capital: {
    loanReturnRate: number;
    capitalCostRate: number;
    loanTurnover: number;
    capitalAmount: number;
    loanAmount: number;
    interestCost: number;
    totalProfit: number;
  };
  cycle: {
    avgStorageTime: number;
    quickSaleRate: number;
    cycleROI: number;
    dailyReturnRate: number;
    cycleAnalysis: {
      range: string;
      count: number;
      avgProfit: number;
      roi: number;
    }[];
  };
}

const calculateDebtRecoveryTime = (depositDate: string, soldDate: string): number => {
  try {
    return Math.floor((new Date(soldDate).getTime() - new Date(depositDate).getTime()) / (1000 * 60 * 60 * 24));
  } catch {
    return 0;
  }
};

const getPaymentAnalysis = (vehicles: Vehicle[]) => {
  return ['DEPOSIT', 'BANK_DEPOSIT', 'OFFSET', 'FULL_PAYMENT'].map(type => {
    const payments = vehicles.flatMap(v => v.payments || [])
      .filter(p => p.type === type);
    return {
      type,
      count: payments.length,
      total: payments.reduce((sum, p) => sum + (p.amount || 0), 0)
    };
  });
};

const getCycleAnalysis = (soldVehicles: Vehicle[]) => {
  return [
    { range: '0-15 ngày', min: 0, max: 15 },
    { range: '16-30 ngày', min: 16, max: 30 },
    { range: '31-60 ngày', min: 31, max: 60 },
    { range: '61-90 ngày', min: 61, max: 90 },
    { range: 'Trên 90 ngày', min: 91, max: Number.MAX_SAFE_INTEGER }
  ].map(timeRange => {
    const vehiclesInRange = soldVehicles.filter(
      v => (v.storageTime || 0) >= timeRange.min && (v.storageTime || 0) <= timeRange.max
    );
    
    const count = vehiclesInRange.length;
    if (count === 0) {
      return {
        range: timeRange.range,
        count: 0,
        avgProfit: 0,
        roi: 0
      };
    }

    const totalProfit = vehiclesInRange.reduce((sum, v) => sum + (v.profit || 0), 0);
    const avgProfit = totalProfit / count;
    
    const totalInvestment = vehiclesInRange.reduce((sum, v) => sum + (v.purchasePrice || 0), 0);
    const roi = totalInvestment > 0 ? (avgProfit / totalInvestment) * 100 : 0;
    
    return {
      range: timeRange.range,
      count,
      avgProfit,
      roi
    };
  });
};

export const useFinancialAnalysis = (
  vehicles: Vehicle[],
  financialInputs: FinancialInputData
): FinancialMetrics => {
  return useMemo(() => {
    if (!vehicles || !financialInputs) {
      return {
        overview: {
          totalVehicles: 0,
          soldCount: 0,
          totalRevenue: 0,
          totalProfit: 0,
          interestCost: 0,
          avgStorageTime: 0
        },
        debt: {
          installmentRate: 0,
          avgDebtRecoveryTime: 0,
          paymentAnalysis: []
        },
        capital: {
          loanReturnRate: 0,
          capitalCostRate: 0,
          loanTurnover: 0,
          capitalAmount: 0,
          loanAmount: 0,
          interestCost: 0,
          totalProfit: 0
        },
        cycle: {
          avgStorageTime: 0,
          quickSaleRate: 0,
          cycleROI: 0,
          dailyReturnRate: 0,
          cycleAnalysis: []
        }
      };
    }

    // Lọc xe đã bán
    const soldVehicles = vehicles.filter(v => v.status === VehicleStatus.SOLD);
    const totalVehicles = vehicles.length;
    const soldCount = soldVehicles.length;
    
    // Tính tổng doanh thu, lợi nhuận
    const totalRevenue = soldVehicles.reduce((sum, v) => sum + (v.sellPrice || 0), 0);
    const totalProfit = soldVehicles.reduce((sum, v) => sum + (v.profit || 0), 0);
    
    // Thời gian tồn kho trung bình
    const totalStorageTime = soldVehicles.reduce((sum, v) => sum + (v.storageTime || 0), 0);
    const avgStorageTime = soldCount > 0 ? totalStorageTime / soldCount : 0;
    
    // Xe bán trả góp
    const installmentSales = soldVehicles.filter(v => 
      v.payments?.some(p => p.type === 'BANK_DEPOSIT')
    );
    const installmentRate = soldCount > 0 ? (installmentSales.length / soldCount) * 100 : 0;
    
    // Thời gian thu hồi công nợ trung bình
    const debtRecoveryTimes = soldVehicles
      .map(vehicle => {
        const depositDate = vehicle.statusHistory?.find(
          h => h.toStatus === VehicleStatus.DEPOSITED || h.toStatus === VehicleStatus.BANK_DEPOSITED
        )?.changedAt;
        
        const soldDate = vehicle.statusHistory?.find(
          h => h.toStatus === VehicleStatus.SOLD
        )?.changedAt;
        
        if (depositDate && soldDate) {
          return calculateDebtRecoveryTime(depositDate, soldDate);
        }
        return 0;
      })
      .filter(time => time > 0);
    
    const avgDebtRecoveryTime = debtRecoveryTimes.length > 0 
      ? debtRecoveryTimes.reduce((sum, time) => sum + time, 0) / debtRecoveryTimes.length 
      : 0;
    
    // Chi phí vốn
    const interestCost = (financialInputs.loanAmount * (financialInputs.interestRate / 100));
    
    // Tỷ suất sinh lời vốn vay
    const loanReturnRate = financialInputs.loanAmount > 0 
      ? (totalProfit / financialInputs.loanAmount) * 100 
      : 0;
    
    // Chi phí vốn
    const capitalCostRate = financialInputs.loanAmount > 0 
      ? (interestCost / financialInputs.loanAmount) * 100 
      : 0;
    
    // Vòng quay vốn vay
    const loanTurnover = financialInputs.loanAmount > 0 
      ? totalRevenue / financialInputs.loanAmount 
      : 0;
    
    // ROI theo chu kỳ và tỷ suất sinh lời/ngày
    const cycleROI = financialInputs.capitalAmount > 0 && avgStorageTime > 0
      ? (totalProfit / financialInputs.capitalAmount) * (365 / avgStorageTime)
      : 0;
    
    const dailyReturnRate = avgStorageTime > 0 && soldCount > 0
      ? totalProfit / (avgStorageTime * soldCount)
      : 0;

    // Phân tích thanh toán
    const paymentAnalysis = getPaymentAnalysis(vehicles);

    // Phân tích chu kỳ
    const cycleAnalysis = getCycleAnalysis(soldVehicles);

    // Tỷ lệ bán nhanh
    const quickSaleRate = totalVehicles > 0 
      ? ((vehicles.filter(v => (v.storageTime || 0) <= 30).length / totalVehicles) * 100)
      : 0;
    
    const metrics: FinancialMetrics = {
      overview: {
        totalVehicles,
        soldCount,
        totalRevenue,
        totalProfit,
        interestCost,
        avgStorageTime
      },
      debt: {
        installmentRate,
        avgDebtRecoveryTime,
        paymentAnalysis
      },
      capital: {
        loanReturnRate,
        capitalCostRate,
        loanTurnover,
        capitalAmount: financialInputs.capitalAmount,
        loanAmount: financialInputs.loanAmount,
        interestCost,
        totalProfit
      },
      cycle: {
        avgStorageTime,
        quickSaleRate,
        cycleROI,
        dailyReturnRate,
        cycleAnalysis
      }
    };

    return metrics;
  }, [vehicles, financialInputs]);
}; 