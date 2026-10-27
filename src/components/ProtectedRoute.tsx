import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../store';
import type { UserRole } from '../types/hrm';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { token, user, initialized, loading } = useAppSelector((s) => s.auth);
  const location = useLocation();

  if (!initialized || (token && !user && loading)) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="w-full max-w-sm bg-white border border-slate-200 rounded-xl p-6 space-y-3">
          <div className="h-4 w-36 bg-slate-200 rounded animate-pulse" />
          <div className="h-3 w-56 bg-slate-100 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/workspace/dashboard" replace />;
  }

  return <>{children}</>;
}
