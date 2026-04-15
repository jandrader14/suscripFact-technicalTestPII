import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from './auth.store';
import {type AuthTokenResponse } from '../types/user.types';

const mockAuthResponse: AuthTokenResponse = {
  accessToken: 'token-abc-123',
  user: { id: 1, email: 'test@example.com', role: 'CLIENT' },
};

describe('auth.store', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, token: null, isAuthenticated: false });
  });

  it('starts with null user and not authenticated', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('sets user and token on login', () => {
    useAuthStore.getState().login(mockAuthResponse);
    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockAuthResponse.user);
    expect(state.token).toBe('token-abc-123');
    expect(state.isAuthenticated).toBe(true);
  });

  it('clears state on logout', () => {
    useAuthStore.getState().login(mockAuthResponse);
    useAuthStore.getState().logout();
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('stores ADMIN role correctly', () => {
    useAuthStore.getState().login({
      ...mockAuthResponse,
      user: { ...mockAuthResponse.user, role: 'ADMIN' },
    });
    expect(useAuthStore.getState().user?.role).toBe('ADMIN');
  });
});
