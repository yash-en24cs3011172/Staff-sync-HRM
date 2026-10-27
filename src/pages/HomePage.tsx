import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store';
import { loginUser } from '../store/authSlice';
import { ASSETS } from '../constants/assets';
import { ResilientImage } from '../components/ResilientImage';

export default function HomePage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((s) => s.auth);
  const [signingInEmail, setSigningInEmail] = useState<string | null>(null);

  const handleQuickDemoAccess = async (email: string) => {
    setSigningInEmail(email);
    const result = await dispatch(loginUser({ email, password: 'HrmPass@123' }));
    setSigningInEmail(null);
    if (loginUser.fulfilled.match(result)) {
      navigate('/workspace/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col">
      {/* Strict 3-Zone Top Bar Contract */}
      <header className="flex items-center justify-between gap-8 px-6 lg:px-12 py-4 border-b border-slate-200 bg-white sticky top-0 z-20">
        <Link
          to="/"
          className="font-display text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
        >
          HRM System
        </Link>

        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
          <a
            href="#modules"
            className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Modules
          </a>
          <a
            href="#workflows"
            className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Workflows
          </a>
          <a
            href="#dashboards"
            className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Dashboards
          </a>
          <a
            href="#security"
            className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Security
          </a>
        </nav>

        <div className="flex items-center shrink-0">
          <Link
            to={user ? '/workspace/dashboard' : '/login'}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            {user ? 'Open Dashboard' : 'Sign In'}
          </Link>
        </div>
      </header>

      {/* Hero Section: 2-Column Stretch Split + Full-Width 4-Column Metric Row Below */}
      <section className="px-6 lg:px-12 pt-12 pb-16 max-w-[1360px] w-full mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
          <div className="lg:col-span-6 flex flex-col justify-between py-2">
            <div>
              <p className="text-xs font-medium text-slate-500 mb-4">
                Human Resource Management System · MERN Enterprise Platform
              </p>
              <h1
                className="font-display font-bold tracking-tight text-slate-900 leading-[1.08] max-w-xl"
                style={{ fontSize: 'clamp(2.25rem, 4vw, 3.5rem)', textWrap: 'balance' }}
              >
                Streamline employee records, attendance, leave requests, and training in one place.
              </h1>
              <p className="mt-5 text-base text-slate-600 leading-relaxed max-w-xl">
                Designed for HR personnel, managers, and employees to coordinate daily attendance,
                leave approvals, performance monitoring, training programs, and organization-wide
                announcements through a role-secured interface.
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-200 flex flex-wrap items-center gap-4">
              <Link
                to={user ? '/workspace/dashboard' : '/login'}
                className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                <span>{user ? 'Return to Dashboard' : 'Open HRM Workspace'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#dashboards"
                className="px-4 py-3 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
              >
                Explore Role Dashboards
              </a>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="h-full min-h-[300px] rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
              <ResilientImage
                src={ASSETS.heroWorkspace}
                alt="Modern enterprise human resources collaborative office"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Full-Width 4-Column Operational Architecture Row */}
        <div className="mt-10 pt-8 border-t border-slate-200 grid grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <p className="font-mono tabular-nums text-2xl sm:text-3xl font-semibold text-slate-900">
              8 Collections
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Users · Employees · Managers · Attendance · Leaves · Trainings
            </p>
          </div>
          <div>
            <p className="font-mono tabular-nums text-2xl sm:text-3xl font-semibold text-slate-900">
              3 Role Tiers
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Dedicated permissions & dashboards for Employee, Manager, and HR
            </p>
          </div>
          <div>
            <p className="font-mono tabular-nums text-2xl sm:text-3xl font-semibold text-slate-900">
              5 Test Suites
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Built-in verification across Auth, Attendance, Leave, Employee & Dashboards
            </p>
          </div>
          <div>
            <p className="font-mono tabular-nums text-2xl sm:text-3xl font-semibold text-slate-900">
              Indexed APIs
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Compound Mongoose indexes, lazy-loaded routes, pagination & latency monitoring
            </p>
          </div>
        </div>
      </section>

      {/* Core Modules & Workflows Section */}
      <section id="modules" className="bg-slate-50 border-y border-slate-200 py-16 px-6 lg:px-12">
        <div className="max-w-[1360px] mx-auto">
          <div className="max-w-2xl mb-12">
            <h2
              className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900"
              style={{ textWrap: 'balance' }}
            >
              Automated HR workflows across every organizational level
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
              Every attendance check-in, leave request, training enrollment, and HR announcement
              stays synchronized across Employee, Manager, and HR views.
            </p>
          </div>

          <div id="workflows" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-7 flex flex-col justify-between">
              <div>
                <p className="text-xs font-mono tabular-nums text-blue-700 font-semibold">
                  01 · Employee Records & Performance Management
                </p>
                <h3 className="font-display text-xl font-semibold text-slate-900 mt-2">
                  Centralized employee profiles, manager assignments, and performance evaluations
                </h3>
                <p className="text-sm text-slate-600 mt-2.5 leading-relaxed max-w-2xl">
                  Employees update personal contact and emergency information directly, managers
                  monitor team performance and direct reports, and HR personnel onboard staff,
                  govern department managers, and audit workforce analytics.
                </p>
              </div>
              <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-500">
                <span>Employee Self-Service</span>
                <span aria-hidden="true">·</span>
                <span>Manager Team Oversight</span>
                <span aria-hidden="true">·</span>
                <span>HR Directory Governance</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-7 flex flex-col justify-between">
              <div>
                <p className="text-xs font-mono tabular-nums text-blue-700 font-semibold">
                  02 · Attendance Management
                </p>
                <h3 className="font-display text-xl font-semibold text-slate-900 mt-2">
                  Daily check-in, check-out, and work-mode logs
                </h3>
                <p className="text-sm text-slate-600 mt-2.5 leading-relaxed">
                  Records Office, Hybrid, and Remote shifts with automatic late-arrival detection,
                  decimal work-hour calculation, and paginated attendance history.
                </p>
              </div>
              <p className="mt-6 pt-5 border-t border-slate-100 text-xs text-slate-500">
                Employee & Date Compound Index · Paginated Logs
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-7 flex flex-col justify-between">
              <div>
                <p className="text-xs font-mono tabular-nums text-blue-700 font-semibold">
                  03 · Leave Management
                </p>
                <h3 className="font-display text-xl font-semibold text-slate-900 mt-2">
                  Balance-checked leave requests & approval queue
                </h3>
                <p className="text-sm text-slate-600 mt-2.5 leading-relaxed">
                  Supports Annual, Sick, Personal, and Parental leave applications with manager and
                  HR review comments, instant notifications, and automatic balance updates.
                </p>
              </div>
              <p className="mt-6 pt-5 border-t border-slate-100 text-xs text-slate-500">
                Approve / Reject Workflow · Real-Time Notifications
              </p>
            </div>

            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-7 flex flex-col justify-between">
              <div>
                <p className="text-xs font-mono tabular-nums text-blue-700 font-semibold">
                  04 · Training Programs, Announcements & HR Analytics
                </p>
                <h3 className="font-display text-xl font-semibold text-slate-900 mt-2">
                  Structured employee training, targeted company announcements, and CSV reporting
                </h3>
                <p className="text-sm text-slate-600 mt-2.5 leading-relaxed max-w-2xl">
                  Managers and HR create training programs and monitor completion rates, HR posts
                  organization-wide announcements, and administrators export CSV workforce reports
                  alongside live API performance monitoring and automated module testing.
                </p>
              </div>
              <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-500">
                <span>Training Enrollment & Progress</span>
                <span aria-hidden="true">·</span>
                <span>Targeted Announcements</span>
                <span aria-hidden="true">·</span>
                <span>Reports & Performance Monitoring</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Role Dashboards Section */}
      <section id="dashboards" className="py-16 px-6 lg:px-12 max-w-[1360px] w-full mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <h2
              className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900"
              style={{ textWrap: 'balance' }}
            >
              Access Employee, Manager, and HR Dashboards
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-600">
              Sign in directly to a pre-configured role account or register a new user profile.
            </p>
          </div>
          <Link
            to="/login"
            className="text-sm font-semibold text-blue-700 hover:text-blue-800 whitespace-nowrap shrink-0"
          >
            Sign in with custom credentials or register →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Employee Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <ResilientImage
                  src={ASSETS.avatars.employee}
                  alt="Arjun Patel"
                  fallbackType="avatar"
                  initials="AP"
                  className="w-11 h-11 rounded-full object-cover border border-slate-200"
                />
                <div>
                  <h3 className="font-display text-base font-semibold text-slate-900">
                    Employee Dashboard
                  </h3>
                  <p className="text-xs text-slate-500">Arjun Patel · Senior Full-Stack Engineer</p>
                </div>
              </div>
              <ul className="space-y-2 text-xs text-slate-600 mb-6">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Manage profile & update personal information</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Mark daily attendance & apply for leave</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>View leave status, announcements & training programs</span>
                </li>
              </ul>
            </div>
            <button
              type="button"
              disabled={signingInEmail !== null}
              onClick={() => handleQuickDemoAccess('arjun.patel@hrmportal.io')}
              className="w-full px-4 py-2.5 text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap"
            >
              {signingInEmail === 'arjun.patel@hrmportal.io'
                ? 'Opening Employee Dashboard...'
                : 'Enter Employee Dashboard'}
            </button>
          </div>

          {/* Manager Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <ResilientImage
                  src={ASSETS.avatars.manager}
                  alt="Marcus Chen"
                  fallbackType="avatar"
                  initials="MC"
                  className="w-11 h-11 rounded-full object-cover border border-slate-200"
                />
                <div>
                  <h3 className="font-display text-base font-semibold text-slate-900">
                    Manager Dashboard
                  </h3>
                  <p className="text-xs text-slate-500">Marcus Chen · Engineering Manager</p>
                </div>
              </div>
              <ul className="space-y-2 text-xs text-slate-600 mb-6">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Manage team members & view team attendance</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Review, approve, or reject employee leave requests</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Manage training programs & monitor employee performance</span>
                </li>
              </ul>
            </div>
            <button
              type="button"
              disabled={signingInEmail !== null}
              onClick={() => handleQuickDemoAccess('marcus.chen@hrmportal.io')}
              className="w-full px-4 py-2.5 text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap"
            >
              {signingInEmail === 'marcus.chen@hrmportal.io'
                ? 'Opening Manager Dashboard...'
                : 'Enter Manager Dashboard'}
            </button>
          </div>

          {/* HR Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <ResilientImage
                  src={ASSETS.avatars.hr}
                  alt="Claire Vance"
                  fallbackType="avatar"
                  initials="CV"
                  className="w-11 h-11 rounded-full object-cover border border-slate-200"
                />
                <div>
                  <h3 className="font-display text-base font-semibold text-slate-900">
                    HR Dashboard
                  </h3>
                  <p className="text-xs text-slate-500">
                    Claire Vance · Director of Human Resources
                  </p>
                </div>
              </div>
              <ul className="space-y-2 text-xs text-slate-600 mb-6">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Manage employees, manage managers & track attendance</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Manage organization leave requests & post announcements</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>View reports, analytics, API performance & test suites</span>
                </li>
              </ul>
            </div>
            <button
              type="button"
              disabled={signingInEmail !== null}
              onClick={() => handleQuickDemoAccess('claire.vance@hrmportal.io')}
              className="w-full px-4 py-2.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors whitespace-nowrap"
            >
              {signingInEmail === 'claire.vance@hrmportal.io'
                ? 'Opening HR Dashboard...'
                : 'Enter HR Dashboard'}
            </button>
          </div>
        </div>

        {/* Security Architecture Banner */}
        <div
          id="security"
          className="mt-12 bg-slate-900 text-white rounded-xl p-7 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6"
        >
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-medium text-blue-300 mb-2">
              <ShieldCheck className="w-4 h-4" />
              <span>Enterprise Security & Data Protection</span>
            </div>
            <h3 className="font-display text-xl font-semibold text-white">
              JWT authentication, bcryptjs password hashing, and role-based access control
            </h3>
            <p className="text-sm text-slate-300 mt-2 leading-relaxed">
              Protected React Router views and Express middleware enforce strict authorization gates,
              payload validation, and secure data management across all eight Mongoose collections.
            </p>
          </div>
          <Link
            to="/login"
            className="px-5 py-3 text-xs font-semibold text-slate-900 bg-white hover:bg-slate-100 rounded-lg transition-colors whitespace-nowrap shrink-0 self-start lg:self-center"
          >
            Register or Sign In
          </Link>
        </div>
      </section>

      {/* Quiet Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white px-6 lg:px-12 py-6">
        <div className="max-w-[1360px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <span className="font-display font-semibold text-slate-800">
            Human Resource Management System
          </span>
          <div className="flex items-center gap-6">
            <a href="#modules" className="hover:text-slate-900">
              Modules
            </a>
            <a href="#dashboards" className="hover:text-slate-900">
              Dashboards
            </a>
            <Link to="/login" className="hover:text-slate-900">
              Sign In
            </Link>
          </div>
          <span>© 2026 Enterprise HRM System. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
