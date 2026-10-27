import { useEffect, useState } from 'react';
import { Plus, Save, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store';
import { updateMyProfile } from '../store/authSlice';
import { ASSETS } from '../constants/assets';
import { ResilientImage } from '../components/ResilientImage';

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const { user, employee } = useAppSelector((s) => s.auth);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [address, setAddress] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (employee) {
      setName(employee.name);
      setPhone(employee.phone);
      setLocation(employee.location);
      setEmergencyContact(employee.emergencyContact);
      setAddress(employee.address);
      setSkills(employee.skills || []);
    }
  }, [employee]);

  if (!user || !employee) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 text-sm text-slate-500">
        Loading employee profile...
      </div>
    );
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setStatusMessage(null);
    setErrorMessage(null);

    const res = await dispatch(
      updateMyProfile({ name, phone, location, emergencyContact, address, skills })
    );
    setSavingProfile(false);
    if (updateMyProfile.fulfilled.match(res)) {
      setStatusMessage('Personal information saved.');
    } else {
      setErrorMessage((res.payload as string) || 'Failed to update profile.');
    }
  };

  const handleAddSkillItem = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = newSkill.trim();
    if (!cleaned || skills.includes(cleaned)) return;
    const nextSkills = [...skills, cleaned];
    setSkills(nextSkills);
    setNewSkill('');
    dispatch(
      updateMyProfile({ name, phone, location, emergencyContact, address, skills: nextSkills })
    );
    setStatusMessage('Professional skills updated.');
  };

  const handleRemoveSkill = (target: string) => {
    const nextSkills = skills.filter((s) => s !== target);
    setSkills(nextSkills);
    dispatch(
      updateMyProfile({ name, phone, location, emergencyContact, address, skills: nextSkills })
    );
  };

  return (
    <div className="space-y-8">
      {/* Top Identity Summary */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <ResilientImage
            src={ASSETS.avatars[employee.avatarKey]}
            alt={employee.name}
            fallbackType="avatar"
            initials={employee.name}
            className="w-16 h-16 rounded-full object-cover border border-slate-200 shrink-0"
          />
          <div>
            <p className="text-xs font-mono text-slate-500">
              {employee.employeeCode} · Joined {employee.joinDate} · {employee.employmentStatus}
            </p>
            <h1 className="font-display text-2xl font-bold text-slate-900 mt-0.5">
              {employee.name}
            </h1>
            <p className="text-sm text-slate-600">
              {employee.designation} · {employee.department} · Reports to{' '}
              {employee.managerName || 'Executive Leadership'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6 pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-100">
          <div>
            <p className="text-xs text-slate-500">Performance Score</p>
            <p className="font-mono tabular-nums text-2xl font-semibold text-blue-700">
              {employee.performanceScore}/100
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Annual Leave</p>
            <p className="font-mono tabular-nums text-2xl font-semibold text-slate-900">
              {employee.leaveBalance.annual}d
            </p>
          </div>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-800">
          {statusMessage}
        </div>
      )}
      {errorMessage && (
        <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-xs font-medium text-red-800">
          {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Personal Information Form */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6">
          <h2 className="font-display text-base font-semibold text-slate-900">
            Update Personal Information
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 mb-5">
            Maintain accurate contact details, residential address, and emergency contacts.
          </p>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Work Email (Read-only)
              </label>
              <input
                type="email"
                disabled
                value={employee.email}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 text-slate-500 border border-slate-200 rounded-lg"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Emergency Contact
              </label>
              <input
                type="text"
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
                placeholder="Name · Phone number"
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Residential Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{savingProfile ? 'Saving...' : 'Save Personal Information'}</span>
            </button>
          </form>
        </div>

        {/* Employment Summary, Leave Balances & Skills */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <h2 className="font-display text-base font-semibold text-slate-900">
              Employment & Leave Summary
            </h2>
            <dl className="divide-y divide-slate-100 text-xs">
              <div className="py-2.5 flex justify-between">
                <dt className="text-slate-500">Employee ID</dt>
                <dd className="font-mono font-semibold text-slate-900">{employee.employeeCode}</dd>
              </div>
              <div className="py-2.5 flex justify-between">
                <dt className="text-slate-500">Department</dt>
                <dd className="font-medium text-slate-900">{employee.department}</dd>
              </div>
              <div className="py-2.5 flex justify-between">
                <dt className="text-slate-500">Designation</dt>
                <dd className="font-medium text-slate-900">{employee.designation}</dd>
              </div>
              <div className="py-2.5 flex justify-between">
                <dt className="text-slate-500">Reporting Manager</dt>
                <dd className="font-medium text-slate-900">
                  {employee.managerName || 'Executive Leadership'}
                </dd>
              </div>
            </dl>

            <div className="pt-3 border-t border-slate-200">
              <h3 className="text-xs font-semibold text-slate-900 mb-2.5">
                Available Leave Entitlement
              </h3>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="font-mono tabular-nums text-lg font-semibold text-slate-900">
                    {employee.leaveBalance.annual}d
                  </p>
                  <p className="text-xs text-slate-500">Annual</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="font-mono tabular-nums text-lg font-semibold text-slate-900">
                    {employee.leaveBalance.sick}d
                  </p>
                  <p className="text-xs text-slate-500">Sick</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="font-mono tabular-nums text-lg font-semibold text-slate-900">
                    {employee.leaveBalance.personal}d
                  </p>
                  <p className="text-xs text-slate-500">Personal</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <div>
              <h2 className="font-display text-base font-semibold text-slate-900">
                Professional Skills & Expertise
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Listed skills help managers assign projects and training cohorts.
              </p>
            </div>

            <form onSubmit={handleAddSkillItem} className="flex items-center gap-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Add skill (e.g. System Architecture)"
                className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <button
                type="submit"
                className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </form>

            {skills.length === 0 ? (
              <p className="text-xs text-slate-500">No skills added yet.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {skills.map((s) => (
                  <div key={s} className="py-2 flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-800">{s}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(s)}
                      className="p-1 text-slate-400 hover:text-slate-800 rounded"
                      aria-label={`Remove ${s}`}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
