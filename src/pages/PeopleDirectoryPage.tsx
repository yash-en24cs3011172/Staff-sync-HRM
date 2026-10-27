import { useEffect, useState } from 'react';
import { Plus, Save, Search, Trash2, UserPlus } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchEmployees, fetchManagers } from '../store/hrmSlice';
import { apiClient, extractApiError } from '../services/api';
import type { EmployeeRecord, ManagerRecord, UserRole } from '../types/hrm';

export default function PeopleDirectoryPage() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);
  const { employeesPage, employeesLoading, managers } = useAppSelector((s) => s.hrm);

  const [tab, setTab] = useState<'employees' | 'managers'>('employees');
  const [teamOnly, setTeamOnly] = useState(user?.role === 'manager');
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [page, setPage] = useState(1);

  const [selectedEmp, setSelectedEmp] = useState<EmployeeRecord | null>(null);
  const [perfNotesDraft, setPerfNotesDraft] = useState('');
  const [selectedMgr, setSelectedMgr] = useState<ManagerRecord | null>(null);
  const [mgrSpecDraft, setMgrSpecDraft] = useState('');
  const [mgrRatingDraft, setMgrRatingDraft] = useState(92);

  const [showAddForm, setShowAddForm] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  // Add Employee State (HR)
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newDept, setNewDept] = useState('Engineering');
  const [newDesignation, setNewDesignation] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('employee');
  const [newManagerId, setNewManagerId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const reloadDirectory = () => {
    dispatch(
      fetchEmployees({
        page,
        limit: 8,
        search: search.trim() || undefined,
        department: departmentFilter,
        teamOnly: user?.role === 'manager' ? teamOnly : false,
      })
    );
    dispatch(fetchManagers());
  };

  useEffect(() => {
    reloadDirectory();
  }, [dispatch, page, departmentFilter, teamOnly, user?.role]);

  if (!user) return null;

  const handleSelectEmployee = (emp: EmployeeRecord) => {
    setSelectedEmp(emp);
    setPerfNotesDraft(emp.performanceNotes || '');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    reloadDirectory();
  };

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);
    try {
      const { data } = await apiClient.post<EmployeeRecord>('/employees', {
        name: newName,
        email: newEmail,
        department: newDept,
        designation: newDesignation,
        role: newRole,
        managerId: newManagerId || null,
      });
      setShowAddForm(false);
      setNewName('');
      setNewEmail('');
      setNewDesignation('');
      setFeedback({
        type: 'ok',
        text: `Added ${data.name} (${data.employeeCode}) to employee directory.`,
      });
      reloadDirectory();
    } catch (err) {
      setFeedback({ type: 'err', text: extractApiError(err) });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateEmployee = async (
    empId: string,
    updates: {
      performanceScore?: number;
      performanceNotes?: string;
      employmentStatus?: 'Active' | 'Probation' | 'On Leave';
      managerId?: string | null;
    }
  ) => {
    try {
      const { data } = await apiClient.put<EmployeeRecord>(`/employees/${empId}`, updates);
      setSelectedEmp(data);
      setPerfNotesDraft(data.performanceNotes || '');
      setFeedback({ type: 'ok', text: `Saved employee evaluation for ${data.name}.` });
      reloadDirectory();
    } catch (err) {
      setFeedback({ type: 'err', text: extractApiError(err) });
    }
  };

  const handleSaveManager = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMgr) return;
    try {
      const { data } = await apiClient.put<ManagerRecord>(`/managers/${selectedMgr._id}`, {
        specialization: mgrSpecDraft,
        performanceRating: mgrRatingDraft,
      });
      setSelectedMgr(data);
      setFeedback({ type: 'ok', text: `Updated manager record for ${data.name}.` });
      reloadDirectory();
    } catch (err) {
      setFeedback({ type: 'err', text: extractApiError(err) });
    }
  };

  const handleDeleteEmployee = async (emp: EmployeeRecord) => {
    try {
      await apiClient.delete(`/employees/${emp._id}`);
      if (selectedEmp?._id === emp._id) setSelectedEmp(null);
      setFeedback({ type: 'ok', text: `Removed ${emp.name} from active directory.` });
      reloadDirectory();
    } catch (err) {
      setFeedback({ type: 'err', text: extractApiError(err) });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">
            {user.role === 'hr'
              ? 'Manage Employees & Managers'
              : 'Team Members & Performance Monitoring'}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            {user.role === 'hr'
              ? 'Onboard staff, assign reporting managers, and oversee department leadership.'
              : 'Monitor direct reports, update performance evaluations, and review team status.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 self-start">
          {user.role === 'hr' && (
            <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg">
              <button
                type="button"
                onClick={() => setTab('employees')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap ${
                  tab === 'employees' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Employees ({employeesPage.total})
              </button>
              <button
                type="button"
                onClick={() => setTab('managers')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap ${
                  tab === 'managers' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Managers ({managers.length})
              </button>
            </div>
          )}

          {user.role === 'manager' && (
            <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg">
              <button
                type="button"
                onClick={() => {
                  setTeamOnly(true);
                  setPage(1);
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap ${
                  teamOnly ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                My Team
              </button>
              <button
                type="button"
                onClick={() => {
                  setTeamOnly(false);
                  setPage(1);
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap ${
                  !teamOnly ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                All Employees
              </button>
            </div>
          )}

          {user.role === 'hr' && (
            <button
              type="button"
              onClick={() => setShowAddForm((p) => !p)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg whitespace-nowrap"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{showAddForm ? 'Close' : 'Add Employee / Manager'}</span>
            </button>
          )}
        </div>
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

      {/* HR Add Employee / Manager Form */}
      {showAddForm && user.role === 'hr' && (
        <form
          onSubmit={handleCreateEmployee}
          className="bg-white border border-slate-200 rounded-xl p-6 space-y-4"
        >
          <h2 className="font-display text-base font-semibold text-slate-900">
            Onboard New Employee or Manager
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="David Kim"
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Work Email</label>
              <input
                type="email"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="david.kim@hrmportal.io"
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Designation</label>
              <input
                type="text"
                required
                value={newDesignation}
                onChange={(e) => setNewDesignation(e.target.value)}
                placeholder="Site Reliability Engineer"
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Department</label>
              <select
                value={newDept}
                onChange={(e) => setNewDept(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg"
              >
                <option value="Engineering">Engineering</option>
                <option value="Product & Design">Product & Design</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Operations">Operations</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">System Role</label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as UserRole)}
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg"
              >
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
                <option value="hr">HR Personnel</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Reporting Manager
              </label>
              <select
                value={newManagerId}
                onChange={(e) => setNewManagerId(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg"
              >
                <option value="">Executive Leadership / Unassigned</option>
                {managers.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name} ({m.department})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-xs font-medium text-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{submitting ? 'Creating...' : 'Create Record'}</span>
            </button>
          </div>
        </form>
      )}

      {tab === 'managers' && user.role === 'hr' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div
            className={`${
              selectedMgr ? 'lg:col-span-8' : 'lg:col-span-12'
            } bg-white border border-slate-200 rounded-xl overflow-hidden`}
          >
            <div className="px-6 py-4 border-b border-slate-200">
              <h2 className="font-display text-base font-semibold text-slate-900">
                Department Managers Directory
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-xs font-medium text-slate-500 bg-slate-50/70">
                    <th className="py-3 px-6">Manager</th>
                    <th className="py-3 px-6">Department & Title</th>
                    <th className="py-3 px-6">Focus Area</th>
                    <th className="py-3 px-6 text-right">Direct Reports</th>
                    <th className="py-3 px-6 text-right">Rating</th>
                    <th className="py-3 px-6 text-right">Manage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {managers.map((m) => (
                    <tr key={m._id} className="hover:bg-slate-50/70">
                      <td className="py-4 px-6">
                        <p className="font-medium text-slate-900">{m.name}</p>
                        <p className="text-xs font-mono text-slate-500">{m.managerCode}</p>
                      </td>
                      <td className="py-4 px-6">
                        <p className="text-slate-900">{m.department}</p>
                        <p className="text-xs text-slate-500">{m.title}</p>
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-600">{m.specialization}</td>
                      <td className="py-4 px-6 text-right font-mono tabular-nums font-medium text-slate-900">
                        {m.teamSize}
                      </td>
                      <td className="py-4 px-6 text-right font-mono tabular-nums text-blue-700 font-semibold">
                        {m.performanceRating}/100
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedMgr(m);
                            setMgrSpecDraft(m.specialization);
                            setMgrRatingDraft(m.performanceRating);
                          }}
                          className="px-2.5 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-50 rounded-md whitespace-nowrap"
                        >
                          Edit Manager
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {selectedMgr && (
            <form
              onSubmit={handleSaveManager}
              className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-6 space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-mono text-slate-500">{selectedMgr.managerCode}</p>
                  <h3 className="font-display text-lg font-bold text-slate-900">
                    {selectedMgr.name}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedMgr(null)}
                  className="text-xs text-slate-500 hover:text-slate-900"
                >
                  Close
                </button>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Specialization / Scope
                </label>
                <input
                  type="text"
                  value={mgrSpecDraft}
                  onChange={(e) => setMgrSpecDraft(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Leadership Rating (0–100)
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={mgrRatingDraft}
                  onChange={(e) => setMgrRatingDraft(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg"
                />
              </div>
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Manager Record</span>
              </button>
            </form>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Employees Table */}
          <div
            className={`${
              selectedEmp ? 'lg:col-span-7' : 'lg:col-span-12'
            } bg-white border border-slate-200 rounded-xl overflow-hidden`}
          >
            <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search employee name, ID, title, or skill..."
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <button
                  type="submit"
                  className="px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg whitespace-nowrap"
                >
                  Search
                </button>
              </form>

              <select
                value={departmentFilter}
                onChange={(e) => {
                  setDepartmentFilter(e.target.value);
                  setPage(1);
                }}
                aria-label="Filter by department"
                className="px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg"
              >
                <option value="All">All Departments</option>
                <option value="Engineering">Engineering</option>
                <option value="Product & Design">Product & Design</option>
                <option value="Human Resources">Human Resources</option>
              </select>
            </div>

            {employeesLoading ? (
              <div className="p-6 space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-12 bg-slate-100 rounded animate-pulse" />
                ))}
              </div>
            ) : employeesPage.items.length === 0 ? (
              <div className="p-10 text-center text-sm text-slate-500">
                No matching employee records found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs font-medium text-slate-500 bg-slate-50/70">
                      <th className="py-3 px-5">Employee</th>
                      <th className="py-3 px-5">Department & Status</th>
                      <th className="py-3 px-5">Manager</th>
                      <th className="py-3 px-5 text-right">Performance</th>
                      <th className="py-3 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {employeesPage.items.map((emp) => (
                      <tr
                        key={emp._id}
                        className={`hover:bg-slate-50/80 ${
                          selectedEmp?._id === emp._id ? 'bg-blue-50/40' : ''
                        }`}
                      >
                        <td className="py-3.5 px-5">
                          <p className="font-medium text-slate-900">{emp.name}</p>
                          <p className="text-xs text-slate-500">
                            <span className="font-mono">{emp.employeeCode}</span> ·{' '}
                            {emp.designation}
                          </p>
                        </td>
                        <td className="py-3.5 px-5 text-xs text-slate-600">
                          {emp.department} · {emp.employmentStatus}
                        </td>
                        <td className="py-3.5 px-5 text-xs text-slate-600">
                          {emp.managerName || 'Executive'}
                        </td>
                        <td className="py-3.5 px-5 text-right font-mono tabular-nums text-xs font-semibold text-slate-900">
                          {emp.performanceScore}/100
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleSelectEmployee(emp)}
                              className="px-2.5 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-50 rounded-md whitespace-nowrap"
                            >
                              Evaluate / Edit
                            </button>
                            {user.role === 'hr' && emp.userId !== user._id && (
                              <button
                                type="button"
                                onClick={() => handleDeleteEmployee(emp)}
                                title="Delete employee"
                                className="p-1 text-slate-400 hover:text-red-600 rounded"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="px-5 py-3.5 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <span className="font-mono tabular-nums">
                Page {employeesPage.page} of {employeesPage.totalPages} ({employeesPage.total}{' '}
                employees)
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
                  disabled={page >= employeesPage.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1.5 font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 rounded-md"
                >
                  Next
                </button>
              </div>
            </div>
          </div>

          {/* Employee Performance & HR Assignment Panel */}
          {selectedEmp && (
            <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 space-y-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-mono text-slate-500">{selectedEmp.employeeCode}</p>
                  <h2 className="font-display text-lg font-bold text-slate-900">
                    {selectedEmp.name}
                  </h2>
                  <p className="text-xs text-slate-600">
                    {selectedEmp.designation} · {selectedEmp.location}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedEmp(null)}
                  className="text-xs font-medium text-slate-500 hover:text-slate-900"
                >
                  Close
                </button>
              </div>

              <div className="pt-4 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Employment Status
                  </label>
                  <select
                    value={selectedEmp.employmentStatus}
                    onChange={(e) =>
                      handleUpdateEmployee(selectedEmp._id, {
                        employmentStatus: e.target.value as 'Active' | 'Probation' | 'On Leave',
                      })
                    }
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                  >
                    <option value="Active">Active</option>
                    <option value="Probation">Probation</option>
                    <option value="On Leave">On Leave</option>
                  </select>
                </div>

                {user.role === 'hr' && (
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Assigned Manager
                    </label>
                    <select
                      value={selectedEmp.managerId || ''}
                      onChange={(e) =>
                        handleUpdateEmployee(selectedEmp._id, {
                          managerId: e.target.value || null,
                        })
                      }
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                    >
                      <option value="">Executive Leadership</option>
                      {managers.map((m) => (
                        <option key={m._id} value={m._id}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-200 space-y-3">
                <label className="block text-xs font-medium text-slate-700">
                  Performance Evaluation Score ({selectedEmp.performanceScore}/100)
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  {[80, 85, 90, 95, 98].map((score) => (
                    <button
                      key={score}
                      type="button"
                      onClick={() =>
                        handleUpdateEmployee(selectedEmp._id, { performanceScore: score })
                      }
                      className={`px-3 py-1.5 text-xs font-mono tabular-nums rounded-md border ${
                        selectedEmp.performanceScore === score
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {score}
                    </button>
                  ))}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Manager / HR Performance Notes
                  </label>
                  <textarea
                    rows={3}
                    value={perfNotesDraft}
                    onChange={(e) => setPerfNotesDraft(e.target.value)}
                    placeholder="Record quarterly performance feedback..."
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      handleUpdateEmployee(selectedEmp._id, { performanceNotes: perfNotesDraft })
                    }
                    className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Performance Feedback</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
