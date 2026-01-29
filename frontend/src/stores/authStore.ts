import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'rider' | 'driver' | 'ops' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  login: (user: User, token: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  hasRole: (role: UserRole | UserRole[]) => boolean;
}

interface AuthStateWithHydration extends AuthState {
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
}

export const useAuthStore = create<AuthStateWithHydration>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      _hasHydrated: false,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
        }),

      setToken: (token) =>
        set({ token }),

      login: (user, token) =>
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        }),

      logout: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        }),

      setLoading: (isLoading) =>
        set({ isLoading }),

      hasRole: (role) => {
        const { user } = get();
        if (!user) return false;

        if (Array.isArray(role)) {
          return role.includes(user.role);
        }
        return user.role === role;
      },

      setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: 'swiftride-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

// Demo users for development/testing
export const demoUsers: Record<UserRole, User> = {
  rider: {
    id: '00000000-0000-0000-0000-000000000002',
    email: 'rider@demo.com',
    name: 'Demo Rider',
    role: 'rider',
    phone: '+1 (555) 123-4567',
  },
  driver: {
    id: '00000000-0000-0000-0000-000000000003',
    email: 'driver@demo.com',
    name: 'Demo Driver',
    role: 'driver',
    phone: '+1 (555) 234-5678',
  },
  ops: {
    id: '00000000-0000-0000-0000-000000000004',
    email: 'ops@demo.com',
    name: 'Operations Admin',
    role: 'ops',
  },
  admin: {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'admin@demo.com',
    name: 'System Admin',
    role: 'admin',
  },
};
