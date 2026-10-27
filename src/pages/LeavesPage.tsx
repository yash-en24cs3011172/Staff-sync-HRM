import { useEffect, useState } from 'react';
import { CalendarPlus, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store';
import { hydrateSession } from '../store/authSlice';
import { applyLeave, fetchLeaves, fetchNotifications, reviewLeave } from '../store/hrmSlice';

export default function LeavesPage() {
  const dispatch = useAppDispatch();
  const { user, employee } = useAppSelector((s) => s.auth);
  const { leavesPage, leavesLoading } = useAppSelector((s) => s.hrm);

  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);

  const [showApplyForm, setShowApplyForm] = useState(false);
  const [leaveType, setLeaveType] = useState<'Annual' | 'Sick' | 'Personal' | 'Parental'>('Annual');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const [reviewComments, setReviewComments] = useState<Record<string, string>>({});
  const [reviewingId, setReviewingId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchLeaves({ page, limit: 8, status: statusFilter }));
  }, [dispatch, page, statusFilter]);

  if (!user) return null;

  const computedDays =
    startDate && endDate && endDate >= startDate
      ? Math.round((Date.parse(endDate) - Date.parse(startDate)) / (24 * 60 * 60 * 1000)) + 1
      : 0;

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);
    const res = await dispatch(applyLeave({ leaveType, startDate, endDate, reason }));
    setSubmitting(false);
    if (applyLeave.fulfilled.match(res)) {
      setShowApplyForm(false);
      setStartDate('');
      setEndDate('');
      setReason('');
      setFeedback({
        type: 'ok',
        text: `Submitted ${res.payload.days}-day ${res.payload.leaveType} leave request for review.`,
      });
      dispatch(fetchLeaves({ page: 1, limit: 8, status: statusFilter }));
    } else {
      setFeedback({ type: 'err', text: (res.payload as string) || 'Failed to submit leave.' });
    }
  };

  const handleReview = async (id: string, status: 'Approved' | 'Rejected') => {
    setReviewingId(id);
    setFeedback(null);
    const res = await dispatch(
      reviewLeave({
        id,
        status,
        reviewComment: reviewComments[id] || undefined,
      })
    );
    setReviewingId(null);
    if (reviewLeave.fulfilled.match(res)) {
      setFeedback({
        type: 'ok',
        text: `Leave request ${status.toLowerCase()} for ${res.payload.employeeName}.`,
      });
      dispatch(hydrateSession());
      dispatch(fetchNotifications());
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">
            Leave Management & Approvals
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            {employee ? (
              <>
                Remaining Balance:{' '}
                <span className="font-mono tabular-nums font-medium text-slate-800">
                  {employee.leaveBalance.annual}d Annual · {employee.leaveBalance.sick}d Sick ·{' '}
                  {employee.leaveBalance.personal}d Personal
                </span>
              </>
            ) : (
              'Manage employee time-off requests and leave approvals.'
            )}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowApplyForm((prev) => !prev)}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors whitespace-nowrap self-start"
        >
          <CalendarPlus className="w-4 h-4" />
          <span>{showApplyForm ? 'Close Application Form' : 'Apply for Leave'}</span>
        </button>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-lg border text-xs font-medium ${
            feedback.type === 'ok'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {feedback.text}
        </div>
      )}

      {/* Collapsible Apply Leave Form */}
      {showApplyForm && (
        <form
          onSubmit={handleApplyLeave}
          className="bg-white border border-slate-200 rounded-xl p-6 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-slate-900">
              New Leave Application
            </h2>
            {computedDays > 0 && (
              <span className="text-xs font-mono tabular-nums font-semibold text-blue-700">
                Duration: {computedDays} day(s)
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Leave Type</label>
              <select
                value={leaveType}
                onChange={(e) =>
                  setLeaveType(e.target.value as 'Annual' | 'Sick' | 'Personal' | 'Parental')
                }
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg"
              >
                <option value="Annual">Annual Leave</option>
                <option value="Sick">Sick Leave</option>
                <option value="Personal">Personal Leave</option>
                <option value="Parental">Parental / Family Leave</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Start Date</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3.5 py-2 text-sm font-mono bg-white border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">End Date</label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3.5 py-2 text-sm font-mono bg-white border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Reason & Handover Notes
            </label>
            <textarea
              rows={2}
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Briefly describe your leave reason and task coverage handover..."
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg"
            />
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowApplyForm(false)}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg whitespace-nowrap"
            >
              {submitting ? 'Submitting...' : 'Submit Leave Request'}
            </button>
          </div>
        </form>
      )}

      {/* Leave List & Approval Controls */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            {['All', 'Pending', 'Approved', 'Rejected'].map((st) => (
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

          <span className="text-xs font-mono tabular-nums text-slate-500">
            {leavesPage.total} total requests
          </span>
        </div>

        {leavesLoading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-slate-100 rounded animate-pulse" />
            ))}
          </div>
        ) : leavesPage.items.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500">
            No leave requests found for this status filter.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {leavesPage.items.map((lv) => {
              const canReview =
                lv.status === 'Pending' && (user.role === 'manager' || user.role === 'hr');

              return (
                <div key={lv._id} className="p-6 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {lv.employeeName} · {lv.leaveType} Leave
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        <span className="font-mono">{lv.employeeCode}</span> · {lv.department} ·{' '}
                        <span className="font-mono tabular-nums">
                          {lv.startDate} to {lv.endDate} ({lv.days}d)
                        </span>
                      </p>
                      <p className="text-sm text-slate-700 mt-2">{lv.reason}</p>
                      {lv.reviewedBy && (
                        <p className="text-xs text-slate-500 mt-1.5">
                          Reviewed by {lv.reviewedBy}
                          {lv.reviewComment ? ` — "${lv.reviewComment}"` : ''}
                        </p>
                      )}
                    </div>

                    <div className="shrink-0">
                      {lv.status === 'Approved' ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Approved</span>
                        </span>
                      ) : lv.status === 'Rejected' ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-700">
                          <XCircle className="w-4 h-4" />
                          <span>Rejected</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700">
                          <Clock className="w-4 h-4" />
                          <span>Pending Review</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {canReview && (
                    <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                      <input
                        type="text"
                        value={reviewComments[lv._id] || ''}
                        onChange={(e) =>
                          setReviewComments((prev) => ({ ...prev, [lv._id]: e.target.value }))
                        }
                        placeholder="Optional review note (e.g. Handover verified with team)..."
                        className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
                      />
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          disabled={reviewingId === lv._id}
                          onClick={() => handleReview(lv._id, 'Approved')}
                          className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg whitespace-nowrap"
                        >
                          Approve Leave
                        </button>
                        <button
                          type="button"
                          disabled={reviewingId === lv._id}
                          onClick={() => handleReview(lv._id, 'Rejected')}
                          className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg whitespace-nowrap"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="px-6 py-3.5 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span className="font-mono tabular-nums">
            Page {leavesPage.page} of {leavesPage.totalPages}
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
              disabled={page >= leavesPage.totalPages}
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
