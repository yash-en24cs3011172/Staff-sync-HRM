import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  LogIn,
  LogOut,
  XCircle,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store';
import {
  fetchDashboard,
  fetchNotifications,
  markCheckIn,
  markCheckOut,
  reviewLeave,
} from '../store/hrmSlice';

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);
  const { dashboard, dashboardLoading } = useAppSelector((s) => s.hrm);

  const [workMode, setWorkMode] = useState<'Office' | 'Hybrid' | 'Remote'>('Hybrid');
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchDashboard());
  }, [dispatch, user?._id]);

  if (dashboardLoading && !dashboard) {
    return (
      <div className="space-y-6">
        <div className="h-24 bg-white border border-slate-200 rounded-xl animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-white border border-slate-200 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="h-72 bg-white border border-slate-200 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!dashboard || !user) return null;

  const { metrics, todayAttendance, myEmployee } = dashboard;

  const handleQuickCheckIn = async () => {
    setBusyAction('checkin');
    setFeedback(null);
    const res = await dispatch(
      markCheckIn({ workMode, notes: `Checked in via ${user.role.toUpperCase()} dashboard` })
    );
    setBusyAction(null);
    if (markCheckIn.fulfilled.match(res)) {
      setFeedback(`Checked in at ${res.payload.checkIn} (${res.payload.workMode}).`);
      dispatch(fetchDashboard());
    }
  };

  const handleQuickCheckOut = async () => {
    setBusyAction('checkout');
    setFeedback(null);
    const res = await dispatch(markCheckOut());
    setBusyAction(null);
    if (markCheckOut.fulfilled.match(res)) {
      setFeedback(`Checked out at ${res.payload.checkOut} · ${res.payload.workHours}h logged.`);
      dispatch(fetchDashboard());
    }
  };

  const handleQuickReviewLeave = async (id: string, status: 'Approved' | 'Rejected') => {
    setBusyAction(id);
    const res = await dispatch(
      reviewLeave({
        id,
        status,
        reviewComment:
          status === 'Approved'
            ? `Approved by ${user.name} from dashboard.`
            : `Declined by ${user.name} due to team capacity.`,
      })
    );
    setBusyAction(null);
    if (reviewLeave.fulfilled.match(res)) {
      dispatch(fetchDashboard());
      dispatch(fetchNotifications());
    }
  };

  const dashboardHeading =
    user.role === 'hr'
      ? 'HR Dashboard · Workforce & Operations'
      : user.role === 'manager'
        ? 'Manager Dashboard · Team & Performance'
        : 'Employee Dashboard · Attendance, Leave & Training';

  return (
    <div className="space-y-8">
      {/* Header & Daily Check-In Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <p className="text-xs text-slate-500">
            {dashboard.todayDate} · {user.department} · {user.designation}
          </p>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 mt-1">
            {dashboardHeading}
          </h1>
          {feedback && <p className="text-xs font-medium text-emerald-700 mt-2">{feedback}</p>}
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {!todayAttendance ? (
            <>
              <select
                value={workMode}
                onChange={(e) => setWorkMode(e.target.value as 'Office' | 'Hybrid' | 'Remote')}
                aria-label="Work mode"
                className="px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg text-slate-700"
              >
                <option value="Hybrid">Hybrid Mode</option>
                <option value="Office">In Office</option>
                <option value="Remote">Remote</option>
              </select>
              <button
                type="button"
                disabled={busyAction === 'checkin'}
                onClick={handleQuickCheckIn}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors whitespace-nowrap"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{busyAction === 'checkin' ? 'Recording...' : 'Mark Check-In'}</span>
              </button>
            </>
          ) : !todayAttendance.checkOut ? (
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs font-semibold text-emerald-700">
                  Checked In · <span className="font-mono tabular-nums">{todayAttendance.checkIn}</span>
                </p>
                <p className="text-xs text-slate-500">{todayAttendance.workMode} Mode</p>
              </div>
              <button
                type="button"
                disabled={busyAction === 'checkout'}
                onClick={handleQuickCheckOut}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{busyAction === 'checkout' ? 'Closing...' : 'Mark Check-Out'}</span>
              </button>
            </div>
          ) : (
            <div className="text-right">
              <p className="text-xs font-semibold text-slate-900">
                Shift Complete ·{' '}
                <span className="font-mono tabular-nums">{todayAttendance.workHours}h</span>
              </p>
              <p className="text-xs font-mono tabular-nums text-slate-500">
                {todayAttendance.checkIn} – {todayAttendance.checkOut}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Role-Scoped 4-Column Metric Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <p className="text-xs font-medium text-slate-500">
            {user.role === 'hr'
              ? 'Total Employees'
              : user.role === 'manager'
                ? 'Team Members'
                : 'Annual Leave Balance'}
          </p>
          <p className="font-mono tabular-nums text-2xl font-semibold text-slate-900 mt-2">
            {user.role === 'employee'
              ? `${myEmployee?.leaveBalance.annual ?? 0} days`
              : metrics.totalEmployees}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {user.role === 'hr'
              ? `${metrics.totalManagers} active department managers`
              : user.role === 'manager'
                ? `${metrics.presentToday} checked in today`
                : `${myEmployee?.leaveBalance.sick ?? 0} sick · ${myEmployee?.leaveBalance.personal ?? 0} personal`}
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <p className="text-xs font-medium text-slate-500">
            {user.role === 'employee' ? 'Performance Score' : 'Today’s Attendance Rate'}
          </p>
          <p className="font-mono tabular-nums text-2xl font-semibold text-slate-900 mt-2">
            {user.role === 'employee'
              ? `${myEmployee?.performanceScore ?? 90}/100`
              : `${metrics.attendanceRate}%`}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {user.role === 'employee'
              ? `Manager: ${myEmployee?.managerName || 'Executive Leadership'}`
              : `${metrics.presentToday} of ${metrics.totalEmployees} present today`}
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <p className="text-xs font-medium text-slate-500">Pending Leave Requests</p>
          <p className="font-mono tabular-nums text-2xl font-semibold text-slate-900 mt-2">
            {metrics.pendingLeaves}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            <span className="font-mono tabular-nums">{metrics.approvedLeavesCount}</span> approved
            leaves on record
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <p className="text-xs font-medium text-slate-500">Training Programs</p>
          <p className="font-mono tabular-nums text-2xl font-semibold text-blue-700 mt-2">
            {metrics.activeTrainings} Active
          </p>
          <p className="text-xs text-slate-500 mt-1">
            <span className="font-mono tabular-nums">{metrics.completedTrainingsCount}</span>{' '}
            {user.role === 'employee' ? 'completed by you' : 'completions recorded'}
          </p>
        </div>
      </div>

      {/* Role-Specific Primary Data Sections */}
      {user.role === 'hr' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-base font-semibold text-slate-900">
                Department Headcount, Attendance & Performance Summary
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Live organization metrics aggregated across Employees and Attendance collections
              </p>
            </div>
            <Link
              to="/workspace/people"
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-800 whitespace-nowrap"
            >
              <span>Manage Employees & Managers</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-medium text-slate-500 bg-slate-50/70">
                  <th className="py-3 px-6">Department</th>
                  <th className="py-3 px-6 text-right">Headcount</th>
                  <th className="py-3 px-6 text-right">Present Today</th>
                  <th className="py-3 px-6 text-right">Avg Performance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {dashboard.departmentBreakdown.map((dept) => (
                  <tr key={dept.department} className="hover:bg-slate-50/70">
                    <td className="py-3.5 px-6 font-medium text-slate-900">{dept.department}</td>
                    <td className="py-3.5 px-6 text-right font-mono tabular-nums text-slate-700">
                      {dept.headcount}
                    </td>
                    <td className="py-3.5 px-6 text-right font-mono tabular-nums text-emerald-700 font-medium">
                      {dept.presentToday}
                    </td>
                    <td className="py-3.5 px-6 text-right font-mono tabular-nums text-slate-800">
                      {dept.avgPerformance}/100
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {user.role === 'manager' && dashboard.teamMembers && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-base font-semibold text-slate-900">
                Direct Team Members & Daily Attendance
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Monitor employee performance, employment status, and today’s check-ins
              </p>
            </div>
            <Link
              to="/workspace/people"
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-800 whitespace-nowrap"
            >
              <span>Manage Team Performance</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-medium text-slate-500 bg-slate-50/70">
                  <th className="py-3 px-6">Team Member</th>
                  <th className="py-3 px-6">Designation</th>
                  <th className="py-3 px-6">Today’s Attendance</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6 text-right">Performance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {dashboard.teamMembers.map((member) => {
                  const att = dashboard.teamAttendanceToday?.find(
                    (a) => a.employeeId === member._id
                  );
                  return (
                    <tr key={member._id} className="hover:bg-slate-50/70">
                      <td className="py-3.5 px-6">
                        <p className="font-medium text-slate-900">{member.name}</p>
                        <p className="text-xs font-mono text-slate-500">{member.employeeCode}</p>
                      </td>
                      <td className="py-3.5 px-6 text-slate-600">{member.designation}</td>
                      <td className="py-3.5 px-6 text-xs">
                        {att ? (
                          <span className="font-medium text-emerald-700 font-mono tabular-nums">
                            {att.checkIn} · {att.workMode}
                          </span>
                        ) : (
                          <span className="text-slate-400">Not checked in yet</span>
                        )}
                      </td>
                      <td className="py-3.5 px-6 text-xs text-slate-600">
                        {member.employmentStatus}
                      </td>
                      <td className="py-3.5 px-6 text-right font-mono tabular-nums font-semibold text-slate-900">
                        {member.performanceScore}/100
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {user.role === 'employee' && myEmployee && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-mono text-slate-500">
              {myEmployee.employeeCode} · Joined {myEmployee.joinDate} · {myEmployee.location}
            </p>
            <h2 className="font-display text-base font-semibold text-slate-900 mt-1">
              Employee Record & Core Skills
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              {myEmployee.skills.length > 0
                ? myEmployee.skills.join(' · ')
                : 'No skills listed yet'}
            </p>
          </div>
          <Link
            to="/workspace/profile"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg whitespace-nowrap self-start sm:self-center"
          >
            <span>Update Profile</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Bottom 2-Column Split: Leave Queue & Recent Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-4">
            <h2 className="font-display text-base font-semibold text-slate-900">
              {user.role === 'employee' ? 'My Leave Status' : 'Leave Approval Queue'}
            </h2>
            <Link
              to="/workspace/leaves"
              className="text-xs font-semibold text-blue-700 hover:text-blue-800 whitespace-nowrap"
            >
              {user.role === 'employee' ? 'Apply for Leave →' : 'Open Leave Management →'}
            </Link>
          </div>

          {dashboard.recentLeaves.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              No leave requests recorded yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {dashboard.recentLeaves.slice(0, 4).map((leave) => (
                <div
                  key={leave._id}
                  className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900">
                      {leave.employeeName} · {leave.leaveType} Leave
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5 font-mono tabular-nums">
                      {leave.startDate} to {leave.endDate} ({leave.days}d)
                    </p>
                    <p className="text-xs text-slate-600 mt-1 truncate">{leave.reason}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {leave.status === 'Pending' &&
                    (user.role === 'manager' || user.role === 'hr') ? (
                      <>
                        <button
                          type="button"
                          disabled={busyAction === leave._id}
                          onClick={() => handleQuickReviewLeave(leave._id, 'Approved')}
                          className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors whitespace-nowrap"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          disabled={busyAction === leave._id}
                          onClick={() => handleQuickReviewLeave(leave._id, 'Rejected')}
                          className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap"
                        >
                          Reject
                        </button>
                      </>
                    ) : leave.status === 'Approved' ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approved</span>
                      </span>
                    ) : leave.status === 'Rejected' ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Rejected</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Pending</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-4">
            <h2 className="font-display text-base font-semibold text-slate-900">
              Latest Announcements
            </h2>
            <Link
              to="/workspace/announcements"
              className="text-xs font-semibold text-blue-700 hover:text-blue-800 whitespace-nowrap"
            >
              {user.role === 'hr' ? 'Post Announcement →' : 'View All →'}
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {dashboard.recentAnnouncements.map((ann) => (
              <div key={ann._id} className="px-6 py-4">
                <p className="text-xs text-slate-500">
                  {ann.category} · {ann.priority} ·{' '}
                  <span className="font-mono tabular-nums">{ann.publishedAt.slice(0, 10)}</span>
                </p>
                <h3 className="text-sm font-semibold text-slate-900 mt-1">{ann.title}</h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed line-clamp-2">
                  {ann.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
