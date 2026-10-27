import { useEffect, useState } from 'react';
import { CheckCircle2, Clock, LogIn, LogOut } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchAttendance, fetchDashboard, markCheckIn, markCheckOut } from '../store/hrmSlice';

export default function AttendancePage() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);
  const { attendancePage, attendanceLoading, dashboard } = useAppSelector((s) => s.hrm);

  const [scope, setScope] = useState<'all' | 'me'>(user?.role === 'employee' ? 'me' : 'all');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('');
  const [page, setPage] = useState(1);

  const [workMode, setWorkMode] = useState<'Office' | 'Hybrid' | 'Remote'>('Hybrid');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [banner, setBanner] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  useEffect(() => {
    dispatch(fetchDashboard());
  }, [dispatch]);

  useEffect(() => {
    dispatch(
      fetchAttendance({
        page,
        limit: 8,
        status: statusFilter,
        date: dateFilter || undefined,
        scope,
      })
    );
  }, [dispatch, page, statusFilter, dateFilter, scope]);

  if (!user) return null;

  const todayRecord = dashboard?.todayAttendance || null;

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setBanner(null);
    const res = await dispatch(markCheckIn({ workMode, notes }));
    setSubmitting(false);
    if (markCheckIn.fulfilled.match(res)) {
      setNotes('');
      setBanner({
        type: 'ok',
        text: `Attendance recorded at ${res.payload.checkIn} (${res.payload.workMode}).`,
      });
      dispatch(fetchDashboard());
      dispatch(fetchAttendance({ page: 1, limit: 8, status: statusFilter, scope }));
    } else {
      setBanner({ type: 'err', text: (res.payload as string) || 'Unable to check in.' });
    }
  };

  const handleCheckOut = async () => {
    setSubmitting(true);
    setBanner(null);
    const res = await dispatch(markCheckOut());
    setSubmitting(false);
    if (markCheckOut.fulfilled.match(res)) {
      setBanner({
        type: 'ok',
        text: `Checked out at ${res.payload.checkOut} · Total logged: ${res.payload.workHours} hours.`,
      });
      dispatch(fetchDashboard());
      dispatch(fetchAttendance({ page, limit: 8, status: statusFilter, scope }));
    } else {
      setBanner({ type: 'err', text: (res.payload as string) || 'Unable to check out.' });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">
            Attendance & Work-Mode Tracking
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Mark daily check-in and check-out times or audit indexed attendance logs.
          </p>
        </div>

        {user.role !== 'employee' && (
          <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg self-start">
            <button
              type="button"
              onClick={() => {
                setScope('all');
                setPage(1);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                scope === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              {user.role === 'hr' ? 'All Organization' : 'Team Attendance'}
            </button>
            <button
              type="button"
              onClick={() => {
                setScope('me');
                setPage(1);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                scope === 'me' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              My Personal Log
            </button>
          </div>
        )}
      </div>

      {/* Daily Check-In / Check-Out Action Panel */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <h2 className="font-display text-base font-semibold text-slate-900 mb-4">
          Today’s Shift ({dashboard?.todayDate || 'Today'})
        </h2>

        {banner && (
          <div
            className={`mb-4 p-3 rounded-lg border text-xs font-medium ${
              banner.type === 'ok'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            {banner.text}
          </div>
        )}

        {!todayRecord ? (
          <form
            onSubmit={handleCheckIn}
            className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end"
          >
            <div className="md:col-span-3">
              <label className="block text-xs font-medium text-slate-700 mb-1">Work Mode</label>
              <select
                value={workMode}
                onChange={(e) => setWorkMode(e.target.value as 'Office' | 'Hybrid' | 'Remote')}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg"
              >
                <option value="Hybrid">Hybrid</option>
                <option value="Office">Office</option>
                <option value="Remote">Remote</option>
              </select>
            </div>
            <div className="md:col-span-6">
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Daily Focus / Shift Note
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Working on sprint deliverables & team code review"
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg"
              />
            </div>
            <div className="md:col-span-3">
              <button
                type="submit"
                disabled={submitting}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors whitespace-nowrap"
              >
                <LogIn className="w-4 h-4" />
                <span>{submitting ? 'Recording...' : 'Mark Check-In'}</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-900">
                Checked in at{' '}
                <span className="font-mono tabular-nums font-semibold">{todayRecord.checkIn}</span>{' '}
                · {todayRecord.workMode} Mode · {todayRecord.status}
              </p>
              {todayRecord.notes && <p className="text-xs text-slate-500">{todayRecord.notes}</p>}
            </div>

            {!todayRecord.checkOut ? (
              <button
                type="button"
                disabled={submitting}
                onClick={handleCheckOut}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap self-start sm:self-center"
              >
                <LogOut className="w-4 h-4" />
                <span>{submitting ? 'Closing Shift...' : 'Mark Check-Out'}</span>
              </button>
            ) : (
              <div className="text-xs font-mono tabular-nums text-emerald-700 font-semibold">
                Checked out at {todayRecord.checkOut} · {todayRecord.workHours}h logged
              </div>
            )}
          </div>
        )}
      </div>

      {/* Attendance Table & Filters */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start">
            {['All', 'Present', 'Late'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => {
                  setStatusFilter(st);
                  setPage(1);
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  statusFilter === st
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setPage(1);
              }}
              aria-label="Filter by date"
              className="px-3 py-1.5 text-xs font-mono border border-slate-300 rounded-lg bg-white"
            />
            {dateFilter && (
              <button
                type="button"
                onClick={() => setDateFilter('')}
                className="text-xs text-slate-500 hover:text-slate-900 whitespace-nowrap"
              >
                Clear date
              </button>
            )}
          </div>
        </div>

        {attendanceLoading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 bg-slate-100 rounded animate-pulse" />
            ))}
          </div>
        ) : attendancePage.items.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500">
            No attendance records match the current filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-medium text-slate-500 bg-slate-50/70">
                  <th className="py-3 px-6">Employee</th>
                  <th className="py-3 px-6">Date</th>
                  <th className="py-3 px-6">Mode</th>
                  <th className="py-3 px-6 text-right">Check-In</th>
                  <th className="py-3 px-6 text-right">Check-Out</th>
                  <th className="py-3 px-6 text-right">Hours</th>
                  <th className="py-3 px-6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {attendancePage.items.map((row) => (
                  <tr key={row._id} className="hover:bg-slate-50/70">
                    <td className="py-3.5 px-6">
                      <p className="font-medium text-slate-900">{row.employeeName}</p>
                      <p className="text-xs text-slate-500">
                        <span className="font-mono">{row.employeeCode}</span> · {row.department}
                      </p>
                    </td>
                    <td className="py-3.5 px-6 font-mono tabular-nums text-xs text-slate-700">
                      {row.date}
                    </td>
                    <td className="py-3.5 px-6 text-xs text-slate-600">{row.workMode}</td>
                    <td className="py-3.5 px-6 text-right font-mono tabular-nums text-xs text-slate-800">
                      {row.checkIn}
                    </td>
                    <td className="py-3.5 px-6 text-right font-mono tabular-nums text-xs text-slate-600">
                      {row.checkOut || 'Active'}
                    </td>
                    <td className="py-3.5 px-6 text-right font-mono tabular-nums text-xs font-medium text-slate-900">
                      {row.workHours > 0 ? `${row.workHours}h` : '—'}
                    </td>
                    <td className="py-3.5 px-6 text-xs font-medium">
                      {row.status === 'Present' ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Present</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-700">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{row.status}</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        <div className="px-6 py-3.5 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span className="font-mono tabular-nums">
            Showing page {attendancePage.page} of {attendancePage.totalPages} ({attendancePage.total}{' '}
            records)
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 rounded-md"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page >= attendancePage.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 rounded-md"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
