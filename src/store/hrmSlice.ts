import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient, extractApiError } from '../services/api';
import type {
  AnnouncementRecord,
  AttendanceRecord,
  DashboardSummary,
  EmployeeRecord,
  LeaveRecord,
  ManagerRecord,
  NotificationRecord,
  PaginatedResponse,
  TrainingRecord,
} from '../types/hrm';

interface HrmState {
  dashboard: DashboardSummary | null;
  dashboardLoading: boolean;
  employeesPage: PaginatedResponse<EmployeeRecord>;
  employeesLoading: boolean;
  managers: ManagerRecord[];
  attendancePage: PaginatedResponse<AttendanceRecord>;
  attendanceLoading: boolean;
  leavesPage: PaginatedResponse<LeaveRecord>;
  leavesLoading: boolean;
  announcements: AnnouncementRecord[];
  trainings: TrainingRecord[];
  notifications: NotificationRecord[];
  error: string | null;
}

const emptyPage = <T,>(): PaginatedResponse<T> => ({
  items: [],
  total: 0,
  page: 1,
  limit: 8,
  totalPages: 1,
});

const initialState: HrmState = {
  dashboard: null,
  dashboardLoading: false,
  employeesPage: emptyPage<EmployeeRecord>(),
  employeesLoading: false,
  managers: [],
  attendancePage: emptyPage<AttendanceRecord>(),
  attendanceLoading: false,
  leavesPage: emptyPage<LeaveRecord>(),
  leavesLoading: false,
  announcements: [],
  trainings: [],
  notifications: [],
  error: null,
};

export const fetchDashboard = createAsyncThunk(
  'hrm/fetchDashboard',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.get<DashboardSummary>('/dashboard');
      return data;
    } catch (err) {
      return rejectWithValue(extractApiError(err));
    }
  }
);

export const fetchEmployees = createAsyncThunk(
  'hrm/fetchEmployees',
  async (
    params: {
      page?: number;
      limit?: number;
      search?: string;
      department?: string;
      status?: string;
      teamOnly?: boolean;
    } = {},
    { rejectWithValue }
  ) => {
    try {
      const { data } = await apiClient.get<PaginatedResponse<EmployeeRecord>>('/employees', {
        params,
      });
      return data;
    } catch (err) {
      return rejectWithValue(extractApiError(err));
    }
  }
);

export const fetchManagers = createAsyncThunk(
  'hrm/fetchManagers',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.get<ManagerRecord[]>('/managers');
      return data;
    } catch (err) {
      return rejectWithValue(extractApiError(err));
    }
  }
);

export const fetchAttendance = createAsyncThunk(
  'hrm/fetchAttendance',
  async (
    params: {
      page?: number;
      limit?: number;
      date?: string;
      status?: string;
      department?: string;
      scope?: 'me' | 'all';
    } = {},
    { rejectWithValue }
  ) => {
    try {
      const { data } = await apiClient.get<PaginatedResponse<AttendanceRecord>>('/attendance', {
        params,
      });
      return data;
    } catch (err) {
      return rejectWithValue(extractApiError(err));
    }
  }
);

export const markCheckIn = createAsyncThunk(
  'hrm/markCheckIn',
  async (
    payload: { workMode: 'Office' | 'Remote' | 'Hybrid'; notes: string },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await apiClient.post<AttendanceRecord>('/attendance/check-in', payload);
      return data;
    } catch (err) {
      return rejectWithValue(extractApiError(err));
    }
  }
);

export const markCheckOut = createAsyncThunk(
  'hrm/markCheckOut',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.post<AttendanceRecord>('/attendance/check-out');
      return data;
    } catch (err) {
      return rejectWithValue(extractApiError(err));
    }
  }
);

export const fetchLeaves = createAsyncThunk(
  'hrm/fetchLeaves',
  async (
    params: { page?: number; limit?: number; status?: string; scope?: 'me' | 'all' } = {},
    { rejectWithValue }
  ) => {
    try {
      const { data } = await apiClient.get<PaginatedResponse<LeaveRecord>>('/leaves', { params });
      return data;
    } catch (err) {
      return rejectWithValue(extractApiError(err));
    }
  }
);

export const applyLeave = createAsyncThunk(
  'hrm/applyLeave',
  async (
    payload: {
      leaveType: 'Annual' | 'Sick' | 'Personal' | 'Parental';
      startDate: string;
      endDate: string;
      reason: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await apiClient.post<LeaveRecord>('/leaves', payload);
      return data;
    } catch (err) {
      return rejectWithValue(extractApiError(err));
    }
  }
);

export const reviewLeave = createAsyncThunk(
  'hrm/reviewLeave',
  async (
    payload: { id: string; status: 'Approved' | 'Rejected'; reviewComment?: string },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await apiClient.patch<LeaveRecord>(`/leaves/${payload.id}/review`, {
        status: payload.status,
        reviewComment: payload.reviewComment,
      });
      return data;
    } catch (err) {
      return rejectWithValue(extractApiError(err));
    }
  }
);

export const fetchAnnouncements = createAsyncThunk(
  'hrm/fetchAnnouncements',
  async (category: string | undefined, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.get<AnnouncementRecord[]>('/announcements', {
        params: category ? { category } : {},
      });
      return data;
    } catch (err) {
      return rejectWithValue(extractApiError(err));
    }
  }
);

export const postAnnouncement = createAsyncThunk(
  'hrm/postAnnouncement',
  async (
    payload: {
      title: string;
      content: string;
      category: 'Policy' | 'Company News' | 'HR Update' | 'Events';
      priority: 'Standard' | 'Important' | 'Urgent';
      targetAudience: 'All' | 'Employees' | 'Managers';
    },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await apiClient.post<AnnouncementRecord>('/announcements', payload);
      return data;
    } catch (err) {
      return rejectWithValue(extractApiError(err));
    }
  }
);

export const deleteAnnouncement = createAsyncThunk(
  'hrm/deleteAnnouncement',
  async (id: string, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/announcements/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(extractApiError(err));
    }
  }
);

export const fetchTrainings = createAsyncThunk(
  'hrm/fetchTrainings',
  async (category: string | undefined, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.get<TrainingRecord[]>('/trainings', {
        params: category ? { category } : {},
      });
      return data;
    } catch (err) {
      return rejectWithValue(extractApiError(err));
    }
  }
);

export const createTraining = createAsyncThunk(
  'hrm/createTraining',
  async (
    payload: {
      title: string;
      description: string;
      category:
        | 'Engineering'
        | 'Leadership'
        | 'Compliance & Security'
        | 'Product & Design'
        | 'HR & Operations';
      instructor: string;
      durationHours: number;
      startDate: string;
      endDate: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await apiClient.post<TrainingRecord>('/trainings', payload);
      return data;
    } catch (err) {
      return rejectWithValue(extractApiError(err));
    }
  }
);

export const enrollInTraining = createAsyncThunk(
  'hrm/enrollInTraining',
  async (trainingId: string, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.post<TrainingRecord>(`/trainings/${trainingId}/enroll`);
      return data;
    } catch (err) {
      return rejectWithValue(extractApiError(err));
    }
  }
);

export const updateTrainingProgress = createAsyncThunk(
  'hrm/updateTrainingProgress',
  async (payload: { trainingId: string; progress: number }, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.patch<TrainingRecord>(
        `/trainings/${payload.trainingId}/progress`,
        { progress: payload.progress }
      );
      return data;
    } catch (err) {
      return rejectWithValue(extractApiError(err));
    }
  }
);

export const fetchNotifications = createAsyncThunk(
  'hrm/fetchNotifications',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.get<NotificationRecord[]>('/notifications');
      return data;
    } catch (err) {
      return rejectWithValue(extractApiError(err));
    }
  }
);

export const markAllNotificationsRead = createAsyncThunk(
  'hrm/markAllNotificationsRead',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.patch<NotificationRecord[]>('/notifications/read-all');
      return data;
    } catch (err) {
      return rejectWithValue(extractApiError(err));
    }
  }
);

const hrmSlice = createSlice({
  name: 'hrm',
  initialState,
  reducers: {
    clearHrmError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboard.pending, (state) => {
        state.dashboardLoading = true;
      })
      .addCase(fetchDashboard.fulfilled, (state, action) => {
        state.dashboardLoading = false;
        state.dashboard = action.payload;
      })
      .addCase(fetchDashboard.rejected, (state, action) => {
        state.dashboardLoading = false;
        state.error = (action.payload as string) || null;
      })
      .addCase(fetchEmployees.pending, (state) => {
        state.employeesLoading = true;
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.employeesLoading = false;
        state.employeesPage = action.payload;
      })
      .addCase(fetchEmployees.rejected, (state) => {
        state.employeesLoading = false;
      })
      .addCase(fetchManagers.fulfilled, (state, action) => {
        state.managers = action.payload;
      })
      .addCase(fetchAttendance.pending, (state) => {
        state.attendanceLoading = true;
      })
      .addCase(fetchAttendance.fulfilled, (state, action) => {
        state.attendanceLoading = false;
        state.attendancePage = action.payload;
      })
      .addCase(fetchAttendance.rejected, (state) => {
        state.attendanceLoading = false;
      })
      .addCase(markCheckIn.fulfilled, (state, action) => {
        state.attendancePage.items = [action.payload, ...state.attendancePage.items];
        if (state.dashboard) {
          state.dashboard.todayAttendance = action.payload;
        }
      })
      .addCase(markCheckOut.fulfilled, (state, action) => {
        state.attendancePage.items = state.attendancePage.items.map((item) =>
          item._id === action.payload._id ? action.payload : item
        );
        if (state.dashboard) {
          state.dashboard.todayAttendance = action.payload;
        }
      })
      .addCase(fetchLeaves.pending, (state) => {
        state.leavesLoading = true;
      })
      .addCase(fetchLeaves.fulfilled, (state, action) => {
        state.leavesLoading = false;
        state.leavesPage = action.payload;
      })
      .addCase(fetchLeaves.rejected, (state) => {
        state.leavesLoading = false;
      })
      .addCase(applyLeave.fulfilled, (state, action) => {
        state.leavesPage.items = [action.payload, ...state.leavesPage.items];
        state.leavesPage.total += 1;
      })
      .addCase(reviewLeave.fulfilled, (state, action) => {
        state.leavesPage.items = state.leavesPage.items.map((l) =>
          l._id === action.payload._id ? action.payload : l
        );
        if (state.dashboard) {
          state.dashboard.recentLeaves = state.dashboard.recentLeaves.map((l) =>
            l._id === action.payload._id ? action.payload : l
          );
        }
      })
      .addCase(fetchAnnouncements.fulfilled, (state, action) => {
        state.announcements = action.payload;
      })
      .addCase(postAnnouncement.fulfilled, (state, action) => {
        state.announcements = [action.payload, ...state.announcements];
      })
      .addCase(deleteAnnouncement.fulfilled, (state, action) => {
        state.announcements = state.announcements.filter((a) => a._id !== action.payload);
      })
      .addCase(fetchTrainings.fulfilled, (state, action) => {
        state.trainings = action.payload;
      })
      .addCase(createTraining.fulfilled, (state, action) => {
        state.trainings = [action.payload, ...state.trainings];
      })
      .addCase(enrollInTraining.fulfilled, (state, action) => {
        state.trainings = state.trainings.map((t) =>
          t._id === action.payload._id ? action.payload : t
        );
      })
      .addCase(updateTrainingProgress.fulfilled, (state, action) => {
        state.trainings = state.trainings.map((t) =>
          t._id === action.payload._id ? action.payload : t
        );
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.notifications = action.payload;
      })
      .addCase(markAllNotificationsRead.fulfilled, (state, action) => {
        state.notifications = action.payload;
      });
  },
});

export const { clearHrmError } = hrmSlice.actions;
export default hrmSlice.reducer;
