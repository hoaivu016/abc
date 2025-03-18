import { configureStore } from '@reduxjs/toolkit';
import staffReducer from './slices/staffSlice';
import vehiclesReducer from './slices/vehiclesSlice';
import kpiReducer from './slices/kpiSlice';

export const store = configureStore({
  reducer: {
    staff: staffReducer,
    vehicles: vehiclesReducer,
    kpi: kpiReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 