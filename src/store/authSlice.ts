import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { apiClient, extractApiError, TOKEN_STORAGE_KEY } from '../services/api';
import type { EmployeeRecord, UserAccount, UserRole } from '../types/hrm';

interface AuthState {
  token: string | null;
  user: UserAccount | null;
  employee: EmployeeRecord | null;
  initialized: boolean;
  loading: boolean;
  error: string | null;
}

const storedToken =
  typeof window !== 'undefined' ? localStorage.getItem(TOKEN_STORAGE_KEY) : null;

const initialState: AuthState = {
  token: storedToken,
  user: null,
  employee: null,
  initialized: !storedToken,
  loading: false,
  error: null,
};

export const hydrateSession = createAsyncThunk(
  'auth/hydrateSession',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.get<{ user: UserAccount; employee: EmployeeRecord | null }>(
        '/auth/me'
      );
      return data;
    } catch (err) {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      return rejectWithValue(extractApiError(err, 'Session expired'));
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (payload: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.post<{
        token: string;
        user: UserAccount;
        employee: EmployeeRecord | null;
      }>('/auth/login', payload);
      localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
      return data;
    } catch (err) {
      return rejectWithValue(extractApiError(err, 'Unable to sign in'));
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (
    payload: {
      name: string;
      email: string;
      password: string;
      role: UserRole;
      department: string;
      designation: string;
      location?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await apiClient.post<{
        token: string;
        user: UserAccount;
        employee: EmployeeRecord | null;
      }>('/auth/register', payload);
      localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
      return data;
    } catch (err) {
      return rejectWithValue(extractApiError(err, 'Registration failed'));
    }
  }
);

export const updateMyProfile = createAsyncThunk(
  'auth/updateMyProfile',
  async (
    payload: {
      name: string;
      phone: string;
      location: string;
      emergencyContact: string;
      address: string;
      skills?: string[];
    },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await apiClient.put<EmployeeRecord>('/employees/me', payload);
      return data;
    } catch (err) {
      return rejectWithValue(extractApiError(err, 'Failed to update profile'));
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      state.token = null;
      state.user = null;
      state.employee = null;
      state.error = null;
      state.initialized = true;
    },
    clearAuthError(state) {
      state.error = null;
    },
    syncMyEmployee(state, action: PayloadAction<EmployeeRecord>) {
      state.employee = action.payload;
      if (state.user && state.user._id === action.payload.userId) {
        state.user.name = action.payload.name;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(hydrateSession.pending, (state) => {
        state.loading = true;
      })
      .addCase(hydrateSession.fulfilled, (state, action) => {
        state.loading = false;
        state.initialized = true;
        state.user = action.payload.user;
        state.employee = action.payload.employee;
      })
      .addCase(hydrateSession.rejected, (state) => {
        state.loading = false;
        state.initialized = true;
        state.token = null;
        state.user = null;
        state.employee = null;
      })
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.initialized = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.employee = action.payload.employee;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Sign in failed';
      })
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.initialized = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.employee = action.payload.employee;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Registration failed';
      })
      .addCase(updateMyProfile.fulfilled, (state, action) => {
        state.employee = action.payload;
        if (state.user) {
          state.user.name = action.payload.name;
        }
      });
  },
});

export const { logout, clearAuthError, syncMyEmployee } = authSlice.actions;
export default authSlice.reducer;
