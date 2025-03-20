import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface FinancialState {
  capitalAmount: number;
  loanAmount: number;
  interestRate: number;
  loading: boolean;
  error: string | null;
}

const initialState: FinancialState = {
  capitalAmount: 0,
  loanAmount: 0,
  interestRate: 0,
  loading: false,
  error: null
};

const financialSlice = createSlice({
  name: 'financial',
  initialState,
  reducers: {
    setFinancialData: (state, action: PayloadAction<{
      capitalAmount?: number;
      loanAmount?: number;
      interestRate?: number;
    }>) => {
      if (action.payload.capitalAmount !== undefined) {
        state.capitalAmount = action.payload.capitalAmount;
      }
      if (action.payload.loanAmount !== undefined) {
        state.loanAmount = action.payload.loanAmount;
      }
      if (action.payload.interestRate !== undefined) {
        state.interestRate = action.payload.interestRate;
      }
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
  setFinancialData, 
  setLoading, 
  setError 
} = financialSlice.actions;

export default financialSlice.reducer; 