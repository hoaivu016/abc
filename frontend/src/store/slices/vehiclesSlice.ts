import { createSlice } from '@reduxjs/toolkit';
import { Vehicle } from '../../types/vehicle/vehicle';

interface VehiclesState {
  vehicleList: Vehicle[];
  loading: boolean;
  error: string | null;
}

const initialState: VehiclesState = {
  vehicleList: [],
  loading: false,
  error: null
};

const vehiclesSlice = createSlice({
  name: 'vehicles',
  initialState,
  reducers: {
    setVehicles: (state, action) => {
      state.vehicleList = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    }
  }
});

export const { setVehicles, setLoading, setError } = vehiclesSlice.actions;
export default vehiclesSlice.reducer; 