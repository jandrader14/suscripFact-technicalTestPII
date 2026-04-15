import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAuth } from './useAuth';
import { useAuthStore } from '../store/auth.store';
import { authService } from '../services/authService';

vi.mock('../services/authService', () => ({
  authService: {
    login: vi.fn(),
  },
}));

const mockAuthResponse = {
  accessToken: 'mock-token',
  user: { id: 1, email: 'user@example.com', role: 'CLIENT' as const },
};

describe('useAuth', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, token: null, isAuthenticated: false });
    vi.clearAllMocks();
  });

  it('returns not authenticated by default', () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it('isAdmin is false for CLIENT role', () => {
    useAuthStore.setState({
      user: { id: 1, email: 'user@example.com', role: 'CLIENT' },
      token: 'tok',
      isAuthenticated: true,
    });
    const { result } = renderHook(() => useAuth());
    expect(result.current.isAdmin).toBe(false);
  });

  it('isAdmin is true for ADMIN role', () => {
    useAuthStore.setState({
      user: { id: 2, email: 'admin@example.com', role: 'ADMIN' },
      token: 'tok',
      isAuthenticated: true,
    });
    const { result } = renderHook(() => useAuth());
    expect(result.current.isAdmin).toBe(true);
  });

  it('login calls authService and updates store', async () => {
    vi.mocked(authService.login).mockResolvedValue(mockAuthResponse);
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.login('user@example.com', 'secret');
    });

    expect(authService.login).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'secret',
    });
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user?.email).toBe('user@example.com');
  });

  it('logout clears user and authentication state', () => {
    useAuthStore.setState({
      user: mockAuthResponse.user,
      token: 'tok',
      isAuthenticated: true,
    });
    const { result } = renderHook(() => useAuth());

    act(() => {
      result.current.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it('login propagates service errors', async () => {
    vi.mocked(authService.login).mockRejectedValue(new Error('Unauthorized'));
    const { result } = renderHook(() => useAuth());

    await expect(
      act(async () => {
        await result.current.login('bad@example.com', 'wrong');
      })
    ).rejects.toThrow('Unauthorized');
  });
});
