import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import {
  UserModel,
  EmployeeModel,
  ManagerModel,
  AttendanceModel,
  LeaveModel,
  AnnouncementModel,
  TrainingModel,
  NotificationModel,
} from '../models/mongooseModels.ts';
import { buildInitialSeedData, type DatabaseState, type StoredUser } from './seedData.ts';
import type {
  EmployeeRecord,
  ManagerRecord,
  AttendanceRecord,
  LeaveRecord,
  AnnouncementRecord,
  TrainingRecord,
  NotificationRecord,
} from '../../src/types/hrm.ts';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'hrm-system.json');

class HrmRepository {
  private useMongo = false;
  private state: DatabaseState | null = null;
  // In-memory secondary indexes for O(1) lookup when running in local persistent mode
  private userByEmailIndex = new Map<string, StoredUser>();
  private employeeByUserIdIndex = new Map<string, EmployeeRecord>();

  public async init(): Promise<void> {
    const mongoUri = (process.env.MONGODB_URI || '').trim();
    if (mongoUri && (mongoUri.startsWith('mongodb://') || mongoUri.startsWith('mongodb+srv://'))) {
      try {
        await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 4000 });
        this.useMongo = true;
        const existingCount = await UserModel.countDocuments();
        if (existingCount === 0) {
          const seed = await buildInitialSeedData();
          await Promise.all([
            UserModel.insertMany(seed.users),
            EmployeeModel.insertMany(seed.employees),
            ManagerModel.insertMany(seed.managers),
            AttendanceModel.insertMany(seed.attendance),
            LeaveModel.insertMany(seed.leaves),
            AnnouncementModel.insertMany(seed.announcements),
            TrainingModel.insertMany(seed.trainings),
            NotificationModel.insertMany(seed.notifications),
          ]);
        }
        return;
      } catch (err) {
        console.warn('MongoDB URI unreachable, falling back to persistent embedded document store:', err);
        this.useMongo = false;
      }
    }

    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DATA_FILE)) {
      try {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        this.state = JSON.parse(raw) as DatabaseState;
      } catch {
        this.state = await buildInitialSeedData();
        this.persist();
      }
    } else {
      this.state = await buildInitialSeedData();
      this.persist();
    }

    this.rebuildIndexes();
  }

  private rebuildIndexes(): void {
    if (!this.state) return;
    this.userByEmailIndex.clear();
    this.employeeByUserIdIndex.clear();
    for (const u of this.state.users) {
      this.userByEmailIndex.set(u.email.toLowerCase(), u);
    }
    for (const e of this.state.employees) {
      this.employeeByUserIdIndex.set(e.userId, e);
    }
  }

  private persist(): void {
    if (!this.state || this.useMongo) return;
    this.rebuildIndexes();
    fs.writeFileSync(DATA_FILE, JSON.stringify(this.state, null, 2), 'utf-8');
  }

  public isMongoConnected(): boolean {
    return this.useMongo;
  }

  // --- USERS ---
  public async findUserByEmail(email: string): Promise<StoredUser | null> {
    const normalized = email.toLowerCase().trim();
    if (this.useMongo) {
      return (await UserModel.findOne({ email: normalized }).lean()) as StoredUser | null;
    }
    return this.userByEmailIndex.get(normalized) || null;
  }

  public async findUserById(id: string): Promise<StoredUser | null> {
    if (this.useMongo) {
      return (await UserModel.findById(id).lean()) as StoredUser | null;
    }
    return this.state!.users.find((u) => u._id === id) || null;
  }

  public async getAllUsers(): Promise<StoredUser[]> {
    if (this.useMongo) {
      return (await UserModel.find().lean()) as StoredUser[];
    }
    return [...this.state!.users];
  }

  public async createUser(user: StoredUser): Promise<StoredUser> {
    if (this.useMongo) {
      await UserModel.create(user);
      return user;
    }
    this.state!.users.push(user);
    this.persist();
    return user;
  }

  public async updateUser(id: string, updates: Partial<StoredUser>): Promise<StoredUser | null> {
    if (this.useMongo) {
      return (await UserModel.findByIdAndUpdate(id, updates, { new: true }).lean()) as StoredUser | null;
    }
    const idx = this.state!.users.findIndex((u) => u._id === id);
    if (idx === -1) return null;
    this.state!.users[idx] = { ...this.state!.users[idx], ...updates };
    this.persist();
    return this.state!.users[idx];
  }

  public async deleteUser(id: string): Promise<void> {
    if (this.useMongo) {
      await UserModel.findByIdAndDelete(id);
      return;
    }
    this.state!.users = this.state!.users.filter((u) => u._id !== id);
    this.persist();
  }

  // --- EMPLOYEES ---
  public async getAllEmployees(): Promise<EmployeeRecord[]> {
    if (this.useMongo) {
      return (await EmployeeModel.find().sort({ name: 1 }).lean()) as EmployeeRecord[];
    }
    return [...this.state!.employees].sort((a, b) => a.name.localeCompare(b.name));
  }

  public async findEmployeeById(id: string): Promise<EmployeeRecord | null> {
    if (this.useMongo) {
      return (await EmployeeModel.findById(id).lean()) as EmployeeRecord | null;
    }
    return this.state!.employees.find((e) => e._id === id) || null;
  }

  public async findEmployeeByUserId(userId: string): Promise<EmployeeRecord | null> {
    if (this.useMongo) {
      return (await EmployeeModel.findOne({ userId }).lean()) as EmployeeRecord | null;
    }
    return this.employeeByUserIdIndex.get(userId) || null;
  }

  public async createEmployee(emp: EmployeeRecord): Promise<EmployeeRecord> {
    if (this.useMongo) {
      await EmployeeModel.create(emp);
      return emp;
    }
    this.state!.employees.push(emp);
    this.persist();
    return emp;
  }

  public async updateEmployee(id: string, updates: Partial<EmployeeRecord>): Promise<EmployeeRecord | null> {
    if (this.useMongo) {
      return (await EmployeeModel.findByIdAndUpdate(id, updates, { new: true }).lean()) as EmployeeRecord | null;
    }
    const idx = this.state!.employees.findIndex((e) => e._id === id);
    if (idx === -1) return null;
    this.state!.employees[idx] = { ...this.state!.employees[idx], ...updates };
    this.persist();
    return this.state!.employees[idx];
  }

  public async deleteEmployee(id: string): Promise<boolean> {
    if (this.useMongo) {
      const res = await EmployeeModel.findByIdAndDelete(id);
      return Boolean(res);
    }
    const prev = this.state!.employees.length;
    this.state!.employees = this.state!.employees.filter((e) => e._id !== id);
    this.persist();
    return this.state!.employees.length < prev;
  }

  // --- MANAGERS ---
  public async getAllManagers(): Promise<ManagerRecord[]> {
    if (this.useMongo) {
      return (await ManagerModel.find().sort({ name: 1 }).lean()) as ManagerRecord[];
    }
    return [...this.state!.managers];
  }

  public async findManagerById(id: string): Promise<ManagerRecord | null> {
    if (this.useMongo) {
      return (await ManagerModel.findById(id).lean()) as ManagerRecord | null;
    }
    return this.state!.managers.find((m) => m._id === id) || null;
  }

  public async findManagerByUserId(userId: string): Promise<ManagerRecord | null> {
    if (this.useMongo) {
      return (await ManagerModel.findOne({ userId }).lean()) as ManagerRecord | null;
    }
    return this.state!.managers.find((m) => m.userId === userId) || null;
  }

  public async createManager(mgr: ManagerRecord): Promise<ManagerRecord> {
    if (this.useMongo) {
      await ManagerModel.create(mgr);
      return mgr;
    }
    this.state!.managers.push(mgr);
    this.persist();
    return mgr;
  }

  public async updateManager(id: string, updates: Partial<ManagerRecord>): Promise<ManagerRecord | null> {
    if (this.useMongo) {
      return (await ManagerModel.findByIdAndUpdate(id, updates, { new: true }).lean()) as ManagerRecord | null;
    }
    const idx = this.state!.managers.findIndex((m) => m._id === id);
    if (idx === -1) return null;
    this.state!.managers[idx] = { ...this.state!.managers[idx], ...updates };
    this.persist();
    return this.state!.managers[idx];
  }

  // --- ATTENDANCE ---
  public async getAllAttendance(): Promise<AttendanceRecord[]> {
    if (this.useMongo) {
      return (await AttendanceModel.find().sort({ date: -1, checkIn: -1 }).lean()) as AttendanceRecord[];
    }
    return [...this.state!.attendance].sort((a, b) =>
      b.date === a.date ? b.checkIn.localeCompare(a.checkIn) : b.date.localeCompare(a.date)
    );
  }

  public async findAttendanceByEmployeeAndDate(
    employeeId: string,
    date: string
  ): Promise<AttendanceRecord | null> {
    if (this.useMongo) {
      return (await AttendanceModel.findOne({ employeeId, date }).lean()) as AttendanceRecord | null;
    }
    return this.state!.attendance.find((a) => a.employeeId === employeeId && a.date === date) || null;
  }

  public async createAttendance(record: AttendanceRecord): Promise<AttendanceRecord> {
    if (this.useMongo) {
      await AttendanceModel.create(record);
      return record;
    }
    this.state!.attendance.unshift(record);
    this.persist();
    return record;
  }

  public async updateAttendance(
    id: string,
    updates: Partial<AttendanceRecord>
  ): Promise<AttendanceRecord | null> {
    if (this.useMongo) {
      return (await AttendanceModel.findByIdAndUpdate(id, updates, { new: true }).lean()) as AttendanceRecord | null;
    }
    const idx = this.state!.attendance.findIndex((a) => a._id === id);
    if (idx === -1) return null;
    this.state!.attendance[idx] = { ...this.state!.attendance[idx], ...updates };
    this.persist();
    return this.state!.attendance[idx];
  }

  // --- LEAVES ---
  public async getAllLeaves(): Promise<LeaveRecord[]> {
    if (this.useMongo) {
      return (await LeaveModel.find().sort({ createdAt: -1 }).lean()) as LeaveRecord[];
    }
    return [...this.state!.leaves].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  public async findLeaveById(id: string): Promise<LeaveRecord | null> {
    if (this.useMongo) {
      return (await LeaveModel.findById(id).lean()) as LeaveRecord | null;
    }
    return this.state!.leaves.find((l) => l._id === id) || null;
  }

  public async createLeave(leave: LeaveRecord): Promise<LeaveRecord> {
    if (this.useMongo) {
      await LeaveModel.create(leave);
      return leave;
    }
    this.state!.leaves.unshift(leave);
    this.persist();
    return leave;
  }

  public async updateLeave(id: string, updates: Partial<LeaveRecord>): Promise<LeaveRecord | null> {
    if (this.useMongo) {
      return (await LeaveModel.findByIdAndUpdate(id, updates, { new: true }).lean()) as LeaveRecord | null;
    }
    const idx = this.state!.leaves.findIndex((l) => l._id === id);
    if (idx === -1) return null;
    this.state!.leaves[idx] = { ...this.state!.leaves[idx], ...updates };
    this.persist();
    return this.state!.leaves[idx];
  }

  // --- ANNOUNCEMENTS ---
  public async getAllAnnouncements(): Promise<AnnouncementRecord[]> {
    if (this.useMongo) {
      return (await AnnouncementModel.find().sort({ publishedAt: -1 }).lean()) as AnnouncementRecord[];
    }
    return [...this.state!.announcements].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  }

  public async createAnnouncement(ann: AnnouncementRecord): Promise<AnnouncementRecord> {
    if (this.useMongo) {
      await AnnouncementModel.create(ann);
      return ann;
    }
    this.state!.announcements.unshift(ann);
    this.persist();
    return ann;
  }

  public async deleteAnnouncement(id: string): Promise<boolean> {
    if (this.useMongo) {
      const res = await AnnouncementModel.findByIdAndDelete(id);
      return Boolean(res);
    }
    const prev = this.state!.announcements.length;
    this.state!.announcements = this.state!.announcements.filter((a) => a._id !== id);
    this.persist();
    return this.state!.announcements.length < prev;
  }

  // --- TRAININGS ---
  public async getAllTrainings(): Promise<TrainingRecord[]> {
    if (this.useMongo) {
      return (await TrainingModel.find().sort({ startDate: -1 }).lean()) as TrainingRecord[];
    }
    return [...this.state!.trainings];
  }

  public async findTrainingById(id: string): Promise<TrainingRecord | null> {
    if (this.useMongo) {
      return (await TrainingModel.findById(id).lean()) as TrainingRecord | null;
    }
    return this.state!.trainings.find((t) => t._id === id) || null;
  }

  public async createTraining(trn: TrainingRecord): Promise<TrainingRecord> {
    if (this.useMongo) {
      await TrainingModel.create(trn);
      return trn;
    }
    this.state!.trainings.unshift(trn);
    this.persist();
    return trn;
  }

  public async updateTraining(
    id: string,
    updates: Partial<TrainingRecord>
  ): Promise<TrainingRecord | null> {
    if (this.useMongo) {
      return (await TrainingModel.findByIdAndUpdate(id, updates, { new: true }).lean()) as TrainingRecord | null;
    }
    const idx = this.state!.trainings.findIndex((t) => t._id === id);
    if (idx === -1) return null;
    this.state!.trainings[idx] = { ...this.state!.trainings[idx], ...updates };
    this.persist();
    return this.state!.trainings[idx];
  }

  // --- NOTIFICATIONS ---
  public async getNotificationsForUser(userId: string): Promise<NotificationRecord[]> {
    if (this.useMongo) {
      return (await NotificationModel.find({ recipientUserId: userId })
        .sort({ createdAt: -1 })
        .limit(30)
        .lean()) as NotificationRecord[];
    }
    return this.state!.notifications
      .filter((n) => n.recipientUserId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 30);
  }

  public async createNotification(ntf: NotificationRecord): Promise<NotificationRecord> {
    if (this.useMongo) {
      await NotificationModel.create(ntf);
      return ntf;
    }
    this.state!.notifications.unshift(ntf);
    this.persist();
    return ntf;
  }

  public async markNotificationRead(id: string, userId: string): Promise<void> {
    if (this.useMongo) {
      await NotificationModel.updateOne({ _id: id, recipientUserId: userId }, { read: true });
      return;
    }
    const ntf = this.state!.notifications.find((n) => n._id === id && n.recipientUserId === userId);
    if (ntf) {
      ntf.read = true;
      this.persist();
    }
  }

  public async markAllNotificationsRead(userId: string): Promise<void> {
    if (this.useMongo) {
      await NotificationModel.updateMany({ recipientUserId: userId }, { read: true });
      return;
    }
    for (const ntf of this.state!.notifications) {
      if (ntf.recipientUserId === userId) {
        ntf.read = true;
      }
    }
    this.persist();
  }
}

export const dbRepo = new HrmRepository();
