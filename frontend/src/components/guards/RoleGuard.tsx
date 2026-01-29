import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import type { UserRole } from '@/stores/authStore';

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: UserRole | UserRole[];
  redirectTo?: string;
  fallback?: ReactNode;
}

/**
 * RoleGuard - Protects routes based on user role
 *
 * Usage:
 * <RoleGuard allowedRoles="driver">
 *   <DriverOnlyPage />
 * </RoleGuard>
 *
 * Or with multiple roles:
 * <RoleGuard allowedRoles={['ops', 'admin']}>
 *   <AdminPage />
 * </RoleGuard>
 *
 * With custom fallback:
 * <RoleGuard allowedRoles="admin" fallback={<AccessDenied />}>
 *   <AdminPage />
 * </RoleGuard>
 */
export function RoleGuard({
  children,
  allowedRoles,
  redirectTo = '/',
  fallback,
}: RoleGuardProps) {
  const { user, isAuthenticated, hasRole, isLoading } = useAuthStore();
  const location = useLocation();

  // Show nothing while checking auth status
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 dark:text-slate-400">Checking access...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check if user has required role
  const hasRequiredRole = hasRole(allowedRoles);

  if (!hasRequiredRole) {
    // Show fallback if provided
    if (fallback) {
      return <>{fallback}</>;
    }

    // Otherwise redirect
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}

/**
 * Access Denied component for use as fallback
 */
export function AccessDenied({ message }: { message?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-error-100 dark:bg-error-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-error-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
          Access Denied
        </h2>
        <p className="text-slate-500 dark:text-slate-400">
          {message || "You don't have permission to access this page."}
        </p>
      </div>
    </div>
  );
}

export default RoleGuard;
