import mongoose, { Schema } from 'mongoose';

// 1. Users Collection
const UserSchema = new Schema(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['employee', 'manager', 'hr'], default: 'employee' },
    department: { type: String, required: true },
    designation: { type: String, required: true },
    avatarKey: { type: String, enum: ['hr', 'manager', 'employee'], default: 'employee' },
    isActive: { type: Boolean, default: true },
    employeeId: { type: String },
    managerRecordId: { type: String },
    createdAt: { type: String, required: true },
  },
  { versionKey: false }
);
UserSchema.index({ role: 1, department: 1 });

// 2. Employees Collection
const EmployeeSchema = new Schema(
  {
    _id: { type: String, required: true },
    userId: { type: String, required: true, index: true },
    employeeCode: { type: String, required: true, unique: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, default: '' },
    department: { type: String, required: true, index: true },
    designation: { type: String, required: true },
    managerId: { type: String, default: null, index: true },
    managerName: { type: String, default: '' },
    joinDate: { type: String, required: true },
    employmentStatus: {
      type: String,
      enum: ['Active', 'Probation', 'On Leave'],
      default: 'Active',
    },
    location: { type: String, default: 'San Francisco, CA' },
    performanceScore: { type: Number, default: 88, min: 0, max: 100 },
    performanceNotes: { type: String, default: '' },
    leaveBalance: {
      annual: { type: Number, default: 18 },
      sick: { type: Number, default: 10 },
      personal: { type: Number, default: 5 },
    },
    skills: { type: [String], default: [] },
    emergencyContact: { type: String, default: '' },
    address: { type: String, default: '' },
    avatarKey: { type: String, enum: ['hr', 'manager', 'employee'], default: 'employee' },
  },
  { versionKey: false }
);
EmployeeSchema.index({ name: 'text', email: 'text', department: 'text', designation: 'text' });

// 3. Managers Collection
const ManagerSchema = new Schema(
  {
    _id: { type: String, required: true },
    userId: { type: String, required: true, index: true },
    managerCode: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    department: { type: String, required: true, index: true },
    title: { type: String, required: true },
    specialization: { type: String, default: '' },
    directReportIds: { type: [String], default: [] },
    teamSize: { type: Number, default: 0 },
    performanceRating: { type: Number, default: 92 },
    createdAt: { type: String, required: true },
  },
  { versionKey: false }
);

// 4. Attendance Collection
const AttendanceSchema = new Schema(
  {
    _id: { type: String, required: true },
    employeeId: { type: String, required: true },
    userId: { type: String, required: true, index: true },
    employeeName: { type: String, required: true },
    employeeCode: { type: String, required: true },
    department: { type: String, required: true, index: true },
    date: { type: String, required: true },
    checkIn: { type: String, required: true },
    checkOut: { type: String, default: null },
    workHours: { type: Number, default: 0 },
    workMode: { type: String, enum: ['Office', 'Remote', 'Hybrid'], default: 'Hybrid' },
    status: { type: String, enum: ['Present', 'Late', 'Half Day', 'Absent'], default: 'Present' },
    notes: { type: String, default: '' },
  },
  { versionKey: false }
);
AttendanceSchema.index({ employeeId: 1, date: -1 }, { unique: true });
AttendanceSchema.index({ date: -1, status: 1 });

// 5. Leaves Collection
const LeaveSchema = new Schema(
  {
    _id: { type: String, required: true },
    employeeId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    employeeName: { type: String, required: true },
    employeeCode: { type: String, required: true },
    department: { type: String, required: true },
    managerId: { type: String, default: null, index: true },
    leaveType: {
      type: String,
      enum: ['Annual', 'Sick', 'Personal', 'Parental'],
      required: true,
    },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    days: { type: Number, required: true, min: 1 },
    reason: { type: String, required: true },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending', index: true },
    reviewedBy: { type: String },
    reviewComment: { type: String },
    createdAt: { type: String, required: true },
    updatedAt: { type: String, required: true },
  },
  { versionKey: false }
);
LeaveSchema.index({ status: 1, createdAt: -1 });

// 6. Announcements Collection
const AnnouncementSchema = new Schema(
  {
    _id: { type: String, required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    category: {
      type: String,
      enum: ['Policy', 'Company News', 'HR Update', 'Events'],
      default: 'Company News',
    },
    priority: { type: String, enum: ['Standard', 'Important', 'Urgent'], default: 'Standard' },
    targetAudience: { type: String, enum: ['All', 'Employees', 'Managers'], default: 'All' },
    authorId: { type: String, required: true },
    authorName: { type: String, required: true },
    publishedAt: { type: String, required: true, index: true },
  },
  { versionKey: false }
);

// 7. Trainings Collection
const TrainingSchema = new Schema(
  {
    _id: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ['Engineering', 'Leadership', 'Compliance & Security', 'Product & Design', 'HR & Operations'],
      default: 'Engineering',
    },
    instructor: { type: String, required: true },
    durationHours: { type: Number, required: true },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    status: { type: String, enum: ['Upcoming', 'Active', 'Completed'], default: 'Active', index: true },
    createdBy: { type: String, required: true },
    enrollments: {
      type: [
        new Schema(
          {
            employeeId: { type: String, required: true },
            employeeName: { type: String, required: true },
            progress: { type: Number, default: 0 },
            status: { type: String, enum: ['Enrolled', 'In Progress', 'Completed'], default: 'Enrolled' },
            enrolledAt: { type: String, required: true },
            completedAt: { type: String },
          },
          { _id: false }
        ),
      ],
      default: [],
    },
  },
  { versionKey: false }
);

// 8. Notifications Collection
const NotificationSchema = new Schema(
  {
    _id: { type: String, required: true },
    recipientUserId: { type: String, required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ['leave', 'attendance', 'announcement', 'training', 'profile'],
      default: 'announcement',
    },
    read: { type: Boolean, default: false },
    createdAt: { type: String, required: true },
  },
  { versionKey: false }
);
NotificationSchema.index({ recipientUserId: 1, read: 1, createdAt: -1 });

export const UserModel = mongoose.models.User || mongoose.model('User', UserSchema);
export const EmployeeModel = mongoose.models.Employee || mongoose.model('Employee', EmployeeSchema);
export const ManagerModel = mongoose.models.Manager || mongoose.model('Manager', ManagerSchema);
export const AttendanceModel = mongoose.models.Attendance || mongoose.model('Attendance', AttendanceSchema);
export const LeaveModel = mongoose.models.Leave || mongoose.model('Leave', LeaveSchema);
export const AnnouncementModel = mongoose.models.Announcement || mongoose.model('Announcement', AnnouncementSchema);
export const TrainingModel = mongoose.models.Training || mongoose.model('Training', TrainingSchema);
export const NotificationModel = mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);
