import { configureStore } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';
import vehicleReducer from './slices/vehicleSlice';
import staffReducer from './slices/staffSlice';
import authReducer from './slices/authSlice';
import financialReducer from './slices/financialSlice';
import kpiReducer from './slices/kpiSlice';

export const store = configureStore({
  reducer: {
    vehicle: vehicleReducer,
    staff: staffReducer,
    auth: authReducer,
    financial: financialReducer,
    kpi: kpiReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>(); 