import { useEffect, useState } from 'react';
import { Award, BookOpen, CheckCircle2, Plus } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store';
import {
  createTraining,
  enrollInTraining,
  fetchNotifications,
  fetchTrainings,
  updateTrainingProgress,
} from '../store/hrmSlice';

export default function TrainingsPage() {
  const dispatch = useAppDispatch();
  const { user, employee } = useAppSelector((s) => s.auth);
  const { trainings } = useAppSelector((s) => s.hrm);

  const [categoryFilter, setCategoryFilter] = useState('All');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Create Training State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<
    | 'Engineering'
    | 'Leadership'
    | 'Compliance & Security'
    | 'Product & Design'
    | 'HR & Operations'
  >('Engineering');
  const [durationHours, setDurationHours] = useState(10);
  const [startDate, setStartDate] = useState('2026-11-01');
  const [endDate, setEndDate] = useState('2026-11-25');

  useEffect(() => {
    dispatch(fetchTrainings(categoryFilter === 'All' ? undefined : categoryFilter));
  }, [dispatch, categoryFilter]);

  if (!user) return null;

  const canManageTrainings = user.role === 'manager' || user.role === 'hr';

  const handleEnroll = async (trainingId: string) => {
    setBusyId(trainingId);
    setMessage(null);
    const res = await dispatch(enrollInTraining(trainingId));
    setBusyId(null);
    if (enrollInTraining.fulfilled.match(res)) {
      setMessage(`Enrolled in "${res.payload.title}".`);
    }
  };

  const handleProgress = async (trainingId: string, progress: number) => {
    setBusyId(trainingId);
    setMessage(null);
    const res = await dispatch(updateTrainingProgress({ trainingId, progress }));
    setBusyId(null);
    if (updateTrainingProgress.fulfilled.match(res)) {
      if (progress >= 100) {
        setMessage(`Completed training program "${res.payload.title}".`);
        dispatch(fetchNotifications());
      } else {
        setMessage(`Updated progress in "${res.payload.title}" to ${progress}%.`);
      }
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusyId('create');
    const res = await dispatch(
      createTraining({
        title,
        description,
        category,
        instructor: user.name,
        durationHours,
        startDate,
        endDate,
      })
    );
    setBusyId(null);
    if (createTraining.fulfilled.match(res)) {
      setShowCreateForm(false);
      setTitle('');
      setDescription('');
      setMessage(`Published training program "${res.payload.title}".`);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">
            Employee Training Programs
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Enroll in professional development workshops, track completion progress, and manage
            organization training activities.
          </p>
        </div>

        {canManageTrainings && (
          <button
            type="button"
            onClick={() => setShowCreateForm((p) => !p)}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors whitespace-nowrap self-start"
          >
            <Plus className="w-4 h-4" />
            <span>{showCreateForm ? 'Close Form' : 'Create Training Program'}</span>
          </button>
        )}
      </div>

      {message && (
        <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-800">
          {message}
        </div>
      )}

      {showCreateForm && canManageTrainings && (
        <form
          onSubmit={handleCreate}
          className="bg-white border border-slate-200 rounded-xl p-6 space-y-4"
        >
          <h2 className="font-display text-base font-semibold text-slate-900">
            Create New Training Program
          </h2>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Program Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Zero-Downtime Database Operations"
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Syllabus Summary</label>
            <textarea
              rows={2}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Outline learning objectives and schedule..."
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) =>
                  setCategory(
                    e.target.value as
                      | 'Engineering'
                      | 'Leadership'
                      | 'Compliance & Security'
                      | 'Product & Design'
                      | 'HR & Operations'
                  )
                }
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
              >
                <option value="Engineering">Engineering</option>
                <option value="Compliance & Security">Compliance & Security</option>
                <option value="Leadership">Leadership</option>
                <option value="Product & Design">Product & Design</option>
                <option value="HR & Operations">HR & Operations</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Duration (Hours)
              </label>
              <input
                type="number"
                min={1}
                max={120}
                value={durationHours}
                onChange={(e) => setDurationHours(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="px-4 py-2 text-xs font-medium text-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busyId === 'create'}
              className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg whitespace-nowrap"
            >
              Publish Program
            </button>
          </div>
        </form>
      )}

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-200/70 rounded-lg w-fit">
        {[
          'All',
          'Engineering',
          'Compliance & Security',
          'Leadership',
          'Product & Design',
          'HR & Operations',
        ].map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategoryFilter(cat)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              categoryFilter === cat
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Training Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {trainings.map((trn) => {
          const myEnrollment = employee
            ? trn.enrollments.find((e) => e.employeeId === employee._id)
            : undefined;

          return (
            <div
              key={trn._id}
              className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between space-y-5"
            >
              <div>
                <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                  <span>
                    {trn.category} · {trn.status}
                  </span>
                  <span className="font-mono tabular-nums font-semibold text-slate-700">
                    {trn.durationHours} hours
                  </span>
                </div>

                <h2 className="font-display text-lg font-semibold text-slate-900 mt-2">
                  {trn.title}
                </h2>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">{trn.description}</p>

                <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-600">
                  <p>
                    <span className="text-slate-400">Instructor:</span> {trn.instructor} ·{' '}
                    <span className="font-mono tabular-nums">
                      {trn.startDate} to {trn.endDate}
                    </span>{' '}
                    · <span className="font-mono tabular-nums">{trn.enrollments.length}</span>{' '}
                    enrolled
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200">
                {!myEnrollment ? (
                  <button
                    type="button"
                    disabled={busyId === trn._id}
                    onClick={() => handleEnroll(trn._id)}
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>{busyId === trn._id ? 'Enrolling...' : 'Enroll in Program'}</span>
                  </button>
                ) : myEnrollment.status === 'Completed' ? (
                  <div className="flex items-center justify-between text-xs font-semibold text-emerald-700">
                    <span className="inline-flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Completed ({myEnrollment.completedAt})</span>
                    </span>
                    <span className="font-mono tabular-nums">100%</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-700">Your Progress</span>
                      <span className="font-mono tabular-nums font-semibold text-blue-700">
                        {myEnrollment.progress}%
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 transition-transform origin-left"
                        style={{ transform: `scaleX(${myEnrollment.progress / 100})` }}
                      />
                    </div>
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <button
                        type="button"
                        disabled={busyId === trn._id}
                        onClick={() =>
                          handleProgress(trn._id, Math.min(90, myEnrollment.progress + 25))
                        }
                        className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg whitespace-nowrap"
                      >
                        Advance +25%
                      </button>
                      <button
                        type="button"
                        disabled={busyId === trn._id}
                        onClick={() => handleProgress(trn._id, 100)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg whitespace-nowrap"
                      >
                        <Award className="w-3.5 h-3.5" />
                        <span>Mark Completed</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
