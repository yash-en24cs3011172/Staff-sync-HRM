export type UserRole = 'employee' | 'manager' | 'hr';

export interface UserAccount {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  designation: string;
  avatarKey: 'hr' | 'manager' | 'employee';
  isActive: boolean;
  employeeId?: string;
  managerRecordId?: string;
  createdAt: string;
}

export interface LeaveBalance {
  annual: number;
  sick: number;
  personal: number;
}

export interface EmployeeRecord {
  _id: string;
  userId: string;
  employeeCode: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  managerId: string | null;
  managerName?: string;
  joinDate: string;
  employmentStatus: 'Active' | 'Probation' | 'On Leave';
  location: string;
  performanceScore: number;
  performanceNotes?: string;
  leaveBalance: LeaveBalance;
  skills: string[];
  emergencyContact: string;
  address: string;
  avatarKey: 'hr' | 'manager' | 'employee';
}

export interface ManagerRecord {
  _id: string;
  userId: string;
  managerCode: string;
  name: string;
  email: string;
  department: string;
  title: string;
  specialization: string;
  directReportIds: string[];
  teamSize: number;
  performanceRating: number;
  createdAt: string;
}

export interface AttendanceRecord {
  _id: string;
  employeeId: string;
  userId: string;
  employeeName: string;
  employeeCode: string;
  department: string;
  date: string;
  checkIn: string;
  checkOut: string | null;
  workHours: number;
  workMode: 'Office' | 'Remote' | 'Hybrid';
  status: 'Present' | 'Late' | 'Half Day' | 'Absent';
  notes: string;
}

export interface LeaveRecord {
  _id: string;
  employeeId: string;
  userId: string;
  employeeName: string;
  employeeCode: string;
  department: string;
  managerId: string | null;
  leaveType: 'Annual' | 'Sick' | 'Personal' | 'Parental';
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  reviewedBy?: string;
  reviewComment?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AnnouncementRecord {
  _id: string;
  title: string;
  content: string;
  category: 'Policy' | 'Company News' | 'HR Update' | 'Events';
  priority: 'Standard' | 'Important' | 'Urgent';
  targetAudience: 'All' | 'Employees' | 'Managers';
  authorId: string;
  authorName: string;
  publishedAt: string;
}

export interface TrainingEnrollment {
  employeeId: string;
  employeeName: string;
  progress: number;
  status: 'Enrolled' | 'In Progress' | 'Completed';
  enrolledAt: string;
  completedAt?: string;
}

export interface TrainingRecord {
  _id: string;
  title: string;
  description: string;
  category: 'Engineering' | 'Leadership' | 'Compliance & Security' | 'Product & Design' | 'HR & Operations';
  instructor: string;
  durationHours: number;
  startDate: string;
  endDate: string;
  status: 'Upcoming' | 'Active' | 'Completed';
  createdBy: string;
  enrollments: TrainingEnrollment[];
}

export interface NotificationRecord {
  _id: string;
  recipientUserId: string;
  title: string;
  message: string;
  type: 'leave' | 'attendance' | 'announcement' | 'training' | 'profile';
  read: boolean;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DashboardSummary {
  role: UserRole;
  todayDate: string;
  myEmployee?: EmployeeRecord | null;
  todayAttendance?: AttendanceRecord | null;
  metrics: {
    totalEmployees: number;
    totalManagers: number;
    presentToday: number;
    attendanceRate: number;
    pendingLeaves: number;
    approvedLeavesCount: number;
    activeTrainings: number;
    completedTrainingsCount: number;
    avgPerformanceScore: number;
  };
  departmentBreakdown: {
    department: string;
    headcount: number;
    avgPerformance: number;
    presentToday: number;
  }[];
  recentAnnouncements: AnnouncementRecord[];
  recentLeaves: LeaveRecord[];
  teamMembers?: EmployeeRecord[];
  teamAttendanceToday?: AttendanceRecord[];
}
