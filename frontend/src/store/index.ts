import { configureStore } from '@reduxjs/toolkit';
import vehicleReducer from './slices/vehicleSlice';
import staffReducer from './slices/staffSlice';
import kpiReducer from './slices/kpiSlice';

export const store = configureStore({
  reducer: {
    vehicles: vehicleReducer,
    staff: staffReducer,
    kpi: kpiReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 