import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { KpiTarget, SupportDepartmentBonus } from '../../types/staff/kpi';

interface KpiState {
  kpiList: KpiTarget[];
  supportBonusList: SupportDepartmentBonus[];
  loading: boolean;
  error: string | null;
}

const initialState: KpiState = {
  kpiList: [],
  supportBonusList: [],
  loading: false,
  error: null
};

const kpiSlice = createSlice({
  name: 'kpi',
  initialState,
  reducers: {
    setKpiList: (state, action: PayloadAction<KpiTarget[]>) => {
      state.kpiList = action.payload;
    },
    setSupportBonusList: (state, action: PayloadAction<SupportDepartmentBonus[]>) => {
      state.supportBonusList = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    }
  }
});

export const { 
  setKpiList, 
  setSupportBonusList, 
  setLoading, 
  setError 
} = kpiSlice.actions;

export default kpiSlice.reducer; 