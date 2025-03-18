import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { KpiTarget } from '../../types/staff/kpi';

interface KpiState {
  kpiList: KpiTarget[];
  loading: boolean;
  error: string | null;
}

const initialState: KpiState = {
  kpiList: [],
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
    addKpi: (state, action: PayloadAction<KpiTarget>) => {
      state.kpiList.push(action.payload);
    },
    updateKpi: (state, action: PayloadAction<KpiTarget>) => {
      const index = state.kpiList.findIndex(kpi => kpi.id === action.payload.id);
      if (index !== -1) {
        state.kpiList[index] = action.payload;
      }
    },
    deleteKpi: (state, action: PayloadAction<string>) => {
      state.kpiList = state.kpiList.filter(kpi => kpi.id !== action.payload);
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
  addKpi, 
  updateKpi, 
  deleteKpi,
  setLoading,
  setError
} = kpiSlice.actions;

export default kpiSlice.reducer; 