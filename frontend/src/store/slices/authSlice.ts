import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  isAuthenticated: boolean;
  user: {
    id?: string;
    email?: string;
    name?: string;
  } | null;
  token?: string;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: undefined
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{ user: any; token: string }>) => {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = undefined;
    }
  }
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer; 