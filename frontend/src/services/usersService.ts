import api from './api';
import type { User } from '../types/user.types';

export const usersService = {
  getAll: (): Promise<User[]> =>
    api.get<User[]>('/auth/users').then((r) => r.data),
};
