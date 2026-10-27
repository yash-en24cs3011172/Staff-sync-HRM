import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft, Lock } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store';
import { clearAuthError, loginUser, registerUser } from '../store/authSlice';
import type { UserRole } from '../types/hrm';

export default function AuthPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, loading, error } = useAppSelector((s) => s.auth);

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('employee');
  const [department, setDepartment] = useState('Engineering');
  const [designation, setDesignation] = useState('Software Engineer');
  const [validationMsg, setValidationMsg] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      navigate('/workspace/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const switchMode = (nextMode: 'login' | 'register') => {
    setMode(nextMode);
    setValidationMsg(null);
    dispatch(clearAuthError());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationMsg(null);

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setValidationMsg('Please enter a valid work email address.');
      return;
    }
    if (password.length < 6) {
      setValidationMsg('Password must be at least 6 characters.');
      return;
    }

    if (mode === 'login') {
      const res = await dispatch(loginUser({ email: email.trim(), password }));
      if (loginUser.fulfilled.match(res)) {
        navigate('/workspace/dashboard');
      }
    } else {
      if (name.trim().length < 2) {
        setValidationMsg('Please enter your full name.');
        return;
      }
      const res = await dispatch(
        registerUser({
          name: name.trim(),
          email: email.trim(),
          password,
          role,
          department,
          designation: designation.trim() || 'Team Member',
        })
      );
      if (registerUser.fulfilled.match(res)) {
        navigate('/workspace/dashboard');
      }
    }
  };

  const handleDemoFillAndLogin = async (demoEmail: string) => {
    setValidationMsg(null);
    const res = await dispatch(loginUser({ email: demoEmail, password: 'HrmPass@123' }));
    if (loginUser.fulfilled.match(res)) {
      navigate('/workspace/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="px-6 lg:px-12 py-4 bg-white border-b border-slate-200 flex items-center justify-between">
        <Link
          to="/"
          className="font-display text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap"
        >
          HRM System
        </Link>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 whitespace-nowrap"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Form Column */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 sm:p-8">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="font-display text-2xl font-bold text-slate-900">
                  {mode === 'login' ? 'Sign in to HRM System' : 'Register HRM Account'}
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Secured with JWT Bearer authentication & bcryptjs password hashing
                </p>
              </div>
              <Lock className="w-5 h-5 text-slate-400 shrink-0" />
            </div>

            {/* Interactive Mode Toggle */}
            <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-lg mb-6">
              <button
                type="button"
                onClick={() => switchMode('login')}
                className={`py-2 px-3 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                  mode === 'login'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => switchMode('register')}
                className={`py-2 px-3 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                  mode === 'register'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Register Account
              </button>
            </div>

            {(validationMsg || error) && (
              <div className="mb-5 p-3.5 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-800">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{validationMsg || error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jordan Taylor"
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Work Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@hrmportal.io"
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>

              {mode === 'register' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Account Role
                      </label>
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value as UserRole)}
                        className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                      >
                        <option value="employee">Employee</option>
                        <option value="manager">Manager</option>
                        <option value="hr">HR Personnel</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Department
                      </label>
                      <select
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                      >
                        <option value="Engineering">Engineering</option>
                        <option value="Product & Design">Product & Design</option>
                        <option value="Human Resources">Human Resources</option>
                        <option value="Operations">Operations</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Job Title / Designation
                    </label>
                    <input
                      type="text"
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      placeholder="Senior Full-Stack Engineer"
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 disabled:opacity-60 rounded-lg transition-colors whitespace-nowrap"
              >
                {loading
                  ? 'Authenticating...'
                  : mode === 'login'
                    ? 'Sign In'
                    : 'Create Account'}
              </button>
            </form>
          </div>

          {/* Instant Demo Role Access Column */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 sm:p-7 space-y-5">
            <div>
              <h2 className="font-display text-base font-semibold text-slate-900">
                Role-Based Demo Accounts
              </h2>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Test Employee, Manager, and HR workflows immediately using pre-seeded accounts
                (password: <span className="font-mono text-slate-700">HrmPass@123</span>).
              </p>
            </div>

            <div className="divide-y divide-slate-200 border-y border-slate-200">
              <div className="py-3.5 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Claire Vance · HR</p>
                  <p className="text-xs font-mono text-slate-500">claire.vance@hrmportal.io</p>
                </div>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleDemoFillAndLogin('claire.vance@hrmportal.io')}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
                >
                  Sign In
                </button>
              </div>

              <div className="py-3.5 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Marcus Chen · Manager</p>
                  <p className="text-xs font-mono text-slate-500">marcus.chen@hrmportal.io</p>
                </div>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleDemoFillAndLogin('marcus.chen@hrmportal.io')}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0"
                >
                  Sign In
                </button>
              </div>

              <div className="py-3.5 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Arjun Patel · Employee</p>
                  <p className="text-xs font-mono text-slate-500">arjun.patel@hrmportal.io</p>
                </div>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleDemoFillAndLogin('arjun.patel@hrmportal.io')}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0"
                >
                  Sign In
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Switch between Employee, Manager, and HR consoles anytime from the bottom of the
              workspace sidebar.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
