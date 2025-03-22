import { createAsyncThunk } from '@reduxjs/toolkit';
import supabase from '../../lib/database/supabase';
import { login, logout } from '../../store/slices/authSlice';
import { handleAuthError } from '../../lib/auth/auth';

/**
 * Hành động đăng nhập
 */
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password }: { email: string; password: string }, { dispatch }) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw error;
      }

      if (data && data.session) {
        const userData = {
          user: data.user,
          token: data.session.access_token
        };
        dispatch(login(userData));
        return userData;
      }

      throw new Error('Không lấy được thông tin người dùng');
    } catch (error) {
      console.error('Lỗi đăng nhập:', error);
      throw error;
    }
  }
);

/**
 * Hành động đăng xuất
 */
export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { dispatch }) => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      dispatch(logout());
      return true;
    } catch (error) {
      console.error('Lỗi đăng xuất:', error);
      throw error;
    }
  }
);

/**
 * Hành động lấy phiên đăng nhập hiện tại
 */
export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { dispatch }) => {
    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        throw error;
      }

      if (data && data.session) {
        const userData = {
          user: data.session.user,
          token: data.session.access_token
        };
        dispatch(login(userData));
        return userData;
      }

      return null;
    } catch (error) {
      console.error('Lỗi lấy phiên đăng nhập:', error);
      if (await handleAuthError(error)) {
        return null;
      }
      throw error;
    }
  }
); 