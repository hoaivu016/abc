import { useState, useEffect } from 'react';
import { KpiTarget, KpiTargetType, SupportDepartmentBonus } from '../types/staff/kpi';
import { Staff } from '../types/staff/staff';
import { supabase } from '../lib/database/supabase';

interface KpiDataState {
  kpis: KpiTarget[];
  supportBonuses: SupportDepartmentBonus[];
  isLoading: boolean;
  error: string | null;
}

interface KpiDataParams {
  staffList: Staff[];
  currentKpis?: KpiTarget[];
  currentSupportBonuses?: SupportDepartmentBonus[];
  selectedMonth: number;
  selectedYear: number;
}

export const useKpiData = (params: KpiDataParams) => {
  const { selectedMonth, selectedYear, currentKpis = [], currentSupportBonuses = [] } = params;
  
  const [salesKpis, setSalesKpis] = useState<KpiTarget[]>([]);
  const [departmentKpis, setDepartmentKpis] = useState<KpiTarget[]>([]);
  const [managementKpi, setManagementKpi] = useState<KpiTarget | null>(null);
  const [supportBonuses, setSupportBonuses] = useState<SupportDepartmentBonus[]>([]);
  
  const [state, setState] = useState<KpiDataState>({
    kpis: [],
    supportBonuses: [],
    isLoading: false,
    error: null
  });

  // Khởi tạo dữ liệu từ props
  useEffect(() => {
    const salesKpisFromProps = currentKpis.filter(kpi => kpi.type === KpiTargetType.SALES);
    const departmentKpisFromProps = currentKpis.filter(kpi => kpi.type === KpiTargetType.DEPARTMENT);
    const managementKpiFromProps = currentKpis.find(kpi => kpi.type === KpiTargetType.MANAGEMENT) || null;
    
    setSalesKpis(salesKpisFromProps);
    setDepartmentKpis(departmentKpisFromProps);
    setManagementKpi(managementKpiFromProps);
    setSupportBonuses(currentSupportBonuses || []);
  }, [currentKpis, currentSupportBonuses]);

  useEffect(() => {
    const fetchKpiData = async () => {
      if (!selectedMonth || !selectedYear) return;
      
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      try {
        // Tải thông tin cấu trúc bảng để kiểm tra tên cột
        const { data: schemaInfo, error: schemaError } = await supabase
          .from('kpi_targets')
          .select('*')
          .limit(1);
          
        if (schemaInfo && schemaInfo.length > 0) {
          console.log('Cấu trúc bảng kpi_targets:', Object.keys(schemaInfo[0]));
        }
        
        // Tải dữ liệu KPI từ Supabase
        const { data: kpiData, error: kpiError } = await supabase
          .from('kpi_targets')
          .select('*');
          
        if (kpiError) throw new Error(`Lỗi khi tải KPI: ${kpiError.message}`);
        
        // Kiểm tra để xác định tên cột chính xác của tháng và năm
        const monthFieldName = schemaInfo && schemaInfo.length > 0 ? 
          (Object.keys(schemaInfo[0]).find(key => 
            key === 'month' || key === 'target_month' || key === 'date_month' || key.includes('month')
          ) || 'month') : 'month';
          
        const yearFieldName = schemaInfo && schemaInfo.length > 0 ? 
          (Object.keys(schemaInfo[0]).find(key => 
            key === 'year' || key === 'target_year' || key === 'date_year' || key.includes('year')
          ) || 'year') : 'year';
        
        console.log('Tên trường tháng:', monthFieldName);
        console.log('Tên trường năm:', yearFieldName);
        
        // Thực hiện lọc bằng JavaScript
        const filteredKpiData = kpiData ? kpiData.filter(item => {
          const itemMonth = item[monthFieldName];
          const itemYear = item[yearFieldName];
          
          return itemMonth === selectedMonth && itemYear === selectedYear;
        }) : [];
        
        // Tải dữ liệu thưởng bộ phận hỗ trợ từ Supabase
        const { data: bonusData, error: bonusError } = await supabase
          .from('support_bonuses')
          .select('*');
          
        if (bonusError) throw new Error(`Lỗi khi tải thưởng: ${bonusError.message}`);
        
        // Thực hiện lọc bằng JavaScript cho bảng support_bonuses
        const filteredBonusData = bonusData ? bonusData.filter(item => {
          const itemMonth = item[monthFieldName];
          const itemYear = item[yearFieldName];
          
          return itemMonth === selectedMonth && itemYear === selectedYear;
        }) : [];
        
        // Cập nhật state với dữ liệu đã tải
        setState({
          kpis: filteredKpiData || [],
          supportBonuses: filteredBonusData || [],
          isLoading: false,
          error: null
        });
      } catch (error) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Lỗi không xác định'
        }));
        console.error('Lỗi khi tải dữ liệu KPI:', error);
      }
    };
    
    fetchKpiData();
  }, [selectedMonth, selectedYear]);
  
  // Hàm cập nhật giá trị KPI sales
  const updateSalesKpiValue = (index: number, field: string, value: any) => {
    const newSalesKpis = [...salesKpis];
    newSalesKpis[index] = { ...newSalesKpis[index], [field]: value };
    setSalesKpis(newSalesKpis);
  };
  
  // Hàm cập nhật giá trị KPI department
  const updateDepartmentKpiValue = (index: number, field: string, value: any) => {
    const newDepartmentKpis = [...departmentKpis];
    newDepartmentKpis[index] = { ...newDepartmentKpis[index], [field]: value };
    setDepartmentKpis(newDepartmentKpis);
  };
  
  // Hàm cập nhật giá trị KPI management
  const updateManagementKpiValue = (field: string, value: any) => {
    if (managementKpi) {
      setManagementKpi({ ...managementKpi, [field]: value });
    }
  };
  
  // Hàm cập nhật giá trị thưởng hỗ trợ
  const updateSupportBonusValue = (index: number, field: string, value: any) => {
    const newSupportBonuses = [...supportBonuses];
    newSupportBonuses[index] = { ...newSupportBonuses[index], [field]: value };
    setSupportBonuses(newSupportBonuses);
  };
  
  // Hàm lưu dữ liệu KPI
  const saveKpiTargets = async (kpiTargets: KpiTarget[]): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Lấy mẫu để xác định tên trường
      const { data: schemaInfo, error: schemaError } = await supabase
        .from('kpi_targets')
        .select('*')
        .limit(1);
      
      if (schemaError) throw new Error(`Lỗi khi kiểm tra bảng: ${schemaError.message}`);
      
      // Xác định tên trường tháng và năm
      let monthFieldName = 'month';
      let yearFieldName = 'year';
      
      if (schemaInfo && schemaInfo.length > 0) {
        monthFieldName = Object.keys(schemaInfo[0]).find(key => 
          key === 'month' || key === 'target_month' || key === 'date_month' || key.includes('month')
        ) || 'month';
        
        yearFieldName = Object.keys(schemaInfo[0]).find(key => 
          key === 'year' || key === 'target_year' || key === 'date_year' || key.includes('year')
        ) || 'year';
      }
      
      // Chuẩn bị dữ liệu để lưu
      const dataToSave = kpiTargets.map(kpi => {
        const data: any = { ...kpi };
        
        // Đảm bảo sử dụng đúng tên trường
        if (monthFieldName !== 'month') {
          data[monthFieldName] = kpi.month;
          delete data.month;
        }
        
        if (yearFieldName !== 'year') {
          data[yearFieldName] = kpi.year;
          delete data.year;
        }
        
        return data;
      });
      
      // Đối với mỗi KPI target, cần upsert (insert hoặc update)
      const { error } = await supabase
        .from('kpi_targets')
        .upsert(dataToSave, { onConflict: 'id' });
      
      if (error) throw new Error(`Lỗi khi lưu KPI: ${error.message}`);
      
      // Cập nhật state
      setState(prev => ({
        ...prev,
        kpis: kpiTargets,
        isLoading: false,
        error: null
      }));
      
      return true;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Lỗi không xác định'
      }));
      console.error('Lỗi khi lưu KPI targets:', error);
      return false;
    }
  };
  
  // Hàm lưu dữ liệu thưởng bộ phận hỗ trợ
  const saveSupportBonuses = async (bonuses: SupportDepartmentBonus[]): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Chuẩn bị dữ liệu để lưu
      const dataToSave = bonuses.map(bonus => {
        const data: any = { ...bonus };
        
        // Cập nhật dữ liệu khớp với schema
        if (data.bonusMonth) {
          data.bonus_month = data.bonusMonth instanceof Date 
            ? data.bonusMonth.toISOString()
            : data.bonusMonth;
          delete data.bonusMonth;
        }
        
        if (data.bonusAmount !== undefined) {
          data.bonus_amount = data.bonusAmount;
          delete data.bonusAmount;
        }
        
        if (data.achievementRate !== undefined) {
          data.achievement_rate = data.achievementRate;
          delete data.achievementRate;
        }
        
        return data;
      });
      
      // Đối với mỗi bonus, cần upsert (insert hoặc update)
      const { error } = await supabase
        .from('support_bonuses')
        .upsert(dataToSave, { onConflict: 'id' });
      
      if (error) throw new Error(`Lỗi khi lưu thưởng: ${error.message}`);
      
      // Cập nhật state
      setState(prev => ({
        ...prev,
        supportBonuses: bonuses,
        isLoading: false,
        error: null
      }));
      
      return true;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Lỗi không xác định'
      }));
      console.error('Lỗi khi lưu support bonuses:', error);
      return false;
    }
  };
  
  return {
    ...state,
    salesKpis,
    departmentKpis,
    managementKpi,
    supportBonuses,
    updateSalesKpiValue,
    updateDepartmentKpiValue,
    updateManagementKpiValue,
    updateSupportBonusValue,
    saveKpiTargets,
    saveSupportBonuses
  };
}; 