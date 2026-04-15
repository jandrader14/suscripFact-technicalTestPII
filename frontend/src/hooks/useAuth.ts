import { useAuthStore } from '../store/auth.store';
import { authService } from '../services/authService';
import type { AuthUser } from '../types/user.types';

interface UseAuthReturn {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export function useAuth(): UseAuthReturn {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const storeLogin = useAuthStore((state) => state.login);
  const storeLogout = useAuthStore((state) => state.logout);

  const login = async (email: string, password: string): Promise<void> => {
    const data = await authService.login({ email, password });
    storeLogin(data);
  };

  const logout = (): void => {
    storeLogout();
  };

  return {
    user,
    isAuthenticated,
    isAdmin: user?.role === 'ADMIN',
    login,
    logout,
  };
}
