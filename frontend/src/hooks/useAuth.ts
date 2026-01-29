import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, demoUsers } from '@/stores/authStore';
import type { UserRole } from '@/stores/authStore';

export function useAuth() {
  const navigate = useNavigate();
  const {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    logout,
    setLoading,
    hasRole,
  } = useAuthStore();

  // Login with credentials (placeholder - would call API)
  const loginWithCredentials = useCallback(
    async (email: string, password: string) => {
      setLoading(true);
      // Placeholder for future API integration
      void password;
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // For demo, match email to demo users
        const demoUser = Object.values(demoUsers).find(
          (u) => u.email.toLowerCase() === email.toLowerCase()
        );

        if (demoUser) {
          login(demoUser, 'demo-token-' + demoUser.role);
          return { success: true, user: demoUser };
        }

        return { success: false, error: 'Invalid credentials' };
      } catch {
        return { success: false, error: 'Login failed' };
      } finally {
        setLoading(false);
      }
    },
    [login, setLoading]
  );

  // Login as demo user
  const loginAsDemo = useCallback(
    (role: UserRole) => {
      const demoUser = demoUsers[role];
      login(demoUser, 'demo-token-' + role);

      // Navigate to appropriate app
      switch (role) {
        case 'rider':
          navigate('/rider');
          break;
        case 'driver':
          navigate('/driver');
          break;
        case 'ops':
        case 'admin':
          navigate('/ops');
          break;
      }
    },
    [login, navigate]
  );

  // Logout and redirect
  const logoutAndRedirect = useCallback(() => {
    logout();
    navigate('/');
  }, [logout, navigate]);

  // Check if user can access a specific app
  const canAccessApp = useCallback(
    (app: 'rider' | 'driver' | 'ops') => {
      if (!user) return false;

      switch (app) {
        case 'rider':
          return user.role === 'rider' || user.role === 'admin';
        case 'driver':
          return user.role === 'driver' || user.role === 'admin';
        case 'ops':
          return user.role === 'ops' || user.role === 'admin';
        default:
          return false;
      }
    },
    [user]
  );

  // Get redirect path based on user role
  const getDefaultPath = useCallback(() => {
    if (!user) return '/';

    switch (user.role) {
      case 'rider':
        return '/rider';
      case 'driver':
        return '/driver';
      case 'ops':
      case 'admin':
        return '/ops';
      default:
        return '/';
    }
  }, [user]);

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    hasRole,
    loginWithCredentials,
    loginAsDemo,
    logout: logoutAndRedirect,
    canAccessApp,
    getDefaultPath,
  };
}

export default useAuth;
