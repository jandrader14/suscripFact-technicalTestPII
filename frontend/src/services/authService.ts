import api from './api';
import type { AuthTokenResponse, LoginPayload, RegisterPayload } from '../types/user.types';

export const authService = {
  login: (payload: LoginPayload): Promise<AuthTokenResponse> =>
    api.post<AuthTokenResponse>('/auth/login', payload).then((r) => r.data),

  register: (payload: RegisterPayload): Promise<void> =>
    api.post('/auth/register', payload).then((r) => r.data),
};
