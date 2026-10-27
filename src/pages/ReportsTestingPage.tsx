import { useEffect, useState } from 'react';
import { CheckCircle2, Download, Play, RefreshCw, XCircle } from 'lucide-react';
import { apiClient, extractApiError } from '../services/api';

interface PerformanceMonitoringData {
  totalApiRequests: number;
  overallAvgLatencyMs: number;
  memoryRssMb: number;
  uptimeSeconds: number;
  routes: {
    route: string;
    requests: number;
    avgLatencyMs: number;
    maxLatencyMs: number;
  }[];
}

interface AnalyticsPayload {
  totalHeadcount: number;
  totalManagers: number;
  avgPerformanceScore: number;
  totalTrainingPrograms: number;
  totalTrainingEnrollments: number;
  completedTrainings: number;
  leaveStatusCounts: { Pending: number; Approved: number; Rejected: number };
  workModeCounts: { Office: number; Hybrid: number; Remote: number };
  performanceMonitoring: PerformanceMonitoringData;
  employeesSnapshot: {
    employeeCode: string;
    name: string;
    department: string;
    designation: string;
    status: string;
    performanceScore: number;
    annualLeaveRemaining: number;
    sickLeaveRemaining: number;
  }[];
}

interface TestSuiteResponse {
  storageEngine: string;
  passedCount: number;
  totalCount: number;
  executedAt: string;
  results: {
    suite: string;
    name: string;
    passed: boolean;
    durationMs: number;
    detail: string;
  }[];
}

export default function ReportsTestingPage() {
  const [analytics, setAnalytics] = useState<AnalyticsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [testReport, setTestReport] = useState<TestSuiteResponse | null>(null);
  const [runningTests, setRunningTests] = useState(false);

  const loadAnalytics = () => {
    setLoading(true);
    apiClient
      .get<AnalyticsPayload>('/reports/analytics')
      .then(({ data }) => {
        setAnalytics(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(extractApiError(err));
        setLoading(false);
      });
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const handleDownloadCsv = () => {
    if (!analytics) return;
    const headers = [
      'Employee Code',
      'Name',
      'Department',
      'Designation',
      'Status',
      'Performance Score',
      'Annual Leave Remaining',
      'Sick Leave Remaining',
    ];
    const rows = analytics.employeesSnapshot.map((r) => [
      r.employeeCode,
      `"${r.name.replace(/"/g, '""')}"`,
      `"${r.department}"`,
      `"${r.designation}"`,
      r.status,
      r.performanceScore,
      r.annualLeaveRemaining,
      r.sickLeaveRemaining,
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'hrm-workforce-analytics-report.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleRunTestSuite = async () => {
    setRunningTests(true);
    try {
      const { data } = await apiClient.post<TestSuiteResponse>('/testing/run-suite');
      setTestReport(data);
      loadAnalytics();
    } catch (err) {
      setError(extractApiError(err));
    } finally {
      setRunningTests(false);
    }
  };

  if (loading && !analytics) {
    return (
      <div className="space-y-6">
        <div className="h-24 bg-white border border-slate-200 rounded-xl animate-pulse" />
        <div className="h-64 bg-white border border-slate-200 rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">
            HR Reports, Performance Monitoring & Testing
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Export workforce analytics, inspect API latency & optimization metrics, and execute
            module verification suites.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start">
          <button
            type="button"
            onClick={loadAnalytics}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg whitespace-nowrap"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            onClick={handleDownloadCsv}
            disabled={!analytics}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg whitespace-nowrap"
          >
            <Download className="w-4 h-4" />
            <span>Download CSV</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-800">
          {error}
        </div>
      )}

      {analytics && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <p className="text-xs text-slate-500">Avg Performance Score</p>
              <p className="font-mono tabular-nums text-2xl font-semibold text-slate-900 mt-1.5">
                {analytics.avgPerformanceScore}/100
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Across {analytics.totalHeadcount} active employees
              </p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <p className="text-xs text-slate-500">Training Completion</p>
              <p className="font-mono tabular-nums text-2xl font-semibold text-blue-700 mt-1.5">
                {analytics.completedTrainings}/{analytics.totalTrainingEnrollments}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Across {analytics.totalTrainingPrograms} active programs
              </p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <p className="text-xs text-slate-500">Work-Mode Distribution</p>
              <p className="font-mono tabular-nums text-sm font-semibold text-slate-900 mt-2.5">
                {analytics.workModeCounts.Hybrid} Hybrid · {analytics.workModeCounts.Office} Office
                · {analytics.workModeCounts.Remote} Remote
              </p>
              <p className="text-xs text-slate-500 mt-1.5">Logged attendance sessions</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <p className="text-xs text-slate-500">API Avg Response Time</p>
              <p className="font-mono tabular-nums text-2xl font-semibold text-emerald-700 mt-1.5">
                {analytics.performanceMonitoring.overallAvgLatencyMs} ms
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {analytics.performanceMonitoring.totalApiRequests} requests ·{' '}
                {analytics.performanceMonitoring.memoryRssMb} MB RSS
              </p>
            </div>
          </div>

          {/* Workforce Snapshot Table */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200">
              <h2 className="font-display text-base font-semibold text-slate-900">
                Workforce & Leave Entitlement Report
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-xs font-medium text-slate-500 bg-slate-50/70">
                    <th className="py-3 px-6">Employee ID</th>
                    <th className="py-3 px-6">Employee</th>
                    <th className="py-3 px-6">Department</th>
                    <th className="py-3 px-6">Status</th>
                    <th className="py-3 px-6 text-right">Performance</th>
                    <th className="py-3 px-6 text-right">Annual Leave</th>
                    <th className="py-3 px-6 text-right">Sick Leave</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {analytics.employeesSnapshot.map((row) => (
                    <tr key={row.employeeCode} className="hover:bg-slate-50/70">
                      <td className="py-3 px-6 font-mono text-xs text-slate-600">
                        {row.employeeCode}
                      </td>
                      <td className="py-3 px-6 font-medium text-slate-900">
                        {row.name}
                        <span className="block text-xs font-normal text-slate-500">
                          {row.designation}
                        </span>
                      </td>
                      <td className="py-3 px-6 text-xs text-slate-600">{row.department}</td>
                      <td className="py-3 px-6 text-xs text-slate-600">{row.status}</td>
                      <td className="py-3 px-6 text-right font-mono tabular-nums text-xs font-semibold text-slate-900">
                        {row.performanceScore}/100
                      </td>
                      <td className="py-3 px-6 text-right font-mono tabular-nums text-xs text-slate-700">
                        {row.annualLeaveRemaining}d
                      </td>
                      <td className="py-3 px-6 text-right font-mono tabular-nums text-xs text-slate-700">
                        {row.sickLeaveRemaining}d
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Optimization: Live API Performance Monitoring Table */}
          {analytics.performanceMonitoring.routes.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200">
                <h2 className="font-display text-base font-semibold text-slate-900">
                  API Optimization & Endpoint Performance Monitoring
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Real server-measured latency across indexed HRM endpoints
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs font-medium text-slate-500 bg-slate-50/70">
                      <th className="py-3 px-6">Endpoint</th>
                      <th className="py-3 px-6 text-right">Requests</th>
                      <th className="py-3 px-6 text-right">Avg Latency</th>
                      <th className="py-3 px-6 text-right">Max Latency</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {analytics.performanceMonitoring.routes.map((rt) => (
                      <tr key={rt.route} className="hover:bg-slate-50/70">
                        <td className="py-3 px-6 font-mono text-slate-800">{rt.route}</td>
                        <td className="py-3 px-6 text-right font-mono tabular-nums text-slate-700">
                          {rt.requests}
                        </td>
                        <td className="py-3 px-6 text-right font-mono tabular-nums text-emerald-700 font-medium">
                          {rt.avgLatencyMs} ms
                        </td>
                        <td className="py-3 px-6 text-right font-mono tabular-nums text-slate-600">
                          {rt.maxLatencyMs} ms
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Testing Module: Automated Verification Test Suite Runner */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-base font-semibold text-slate-900">
              Automated HRM Testing Suite
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Runs live server checks for Authentication, Attendance Management, Leave Management,
              Employee Management, and Dashboards.
            </p>
          </div>
          <button
            type="button"
            disabled={runningTests}
            onClick={handleRunTestSuite}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg whitespace-nowrap self-start sm:self-center"
          >
            <Play className="w-3.5 h-3.5" />
            <span>{runningTests ? 'Running Tests...' : 'Run All 5 Test Suites'}</span>
          </button>
        </div>

        {!testReport ? (
          <div className="p-8 text-center text-xs text-slate-500">
            Click “Run All 5 Test Suites” to verify Authentication, Attendance, Leave, Employee, and
            Dashboard modules.
          </div>
        ) : (
          <div>
            <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
              <span>Database Engine: {testReport.storageEngine}</span>
              <span className="font-mono tabular-nums font-semibold text-emerald-700">
                {testReport.passedCount}/{testReport.totalCount} Suites Passed
              </span>
            </div>
            <div className="divide-y divide-slate-100">
              {testReport.results.map((r) => (
                <div
                  key={r.suite}
                  className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {r.suite} · <span className="font-normal text-slate-600">{r.name}</span>
                    </p>
                    <p className="text-xs text-slate-500 mt-1">{r.detail}</p>
                  </div>
                  <div className="flex items-center gap-4 shrink-0 text-xs">
                    <span className="font-mono tabular-nums text-slate-400">{r.durationMs} ms</span>
                    {r.passed ? (
                      <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Passed</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-semibold text-red-700">
                        <XCircle className="w-4 h-4" />
                        <span>Failed</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
