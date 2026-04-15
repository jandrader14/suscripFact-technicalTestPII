/// <reference types="jest" />
import * as bcrypt from 'bcrypt';

import { jest } from '@jest/globals';
import { User, UserRole } from '../../domain/entities/User';
import {
  InactiveUserException,
  InvalidCredentialsException,
} from '../../domain/exceptions/AuthExceptions';
import { ITokenService } from '../../domain/ports/out/ITokenService';
import { IUserRepository } from '../../domain/ports/out/IUserRepository';
import { LoginUseCase } from './login.use-case';

jest.mock('bcrypt');

const mockUserRepository = (): jest.Mocked<IUserRepository> => ({
  save: jest.fn(),
  findByEmail: jest.fn(),
  findById: jest.fn(),
  existsByEmail: jest.fn(),
});

const mockTokenService = (): jest.Mocked<ITokenService> => ({
  sign: jest.fn(),
});

const buildUser = (overrides: Partial<User> = {}): User =>
  new User({
    id: 1,
    email: 'user@example.com',
    password: 'hashed_password',
    role: UserRole.CLIENT,
    isActive: true,
    createdAt: new Date('2026-01-01'),
    ...overrides,
  });

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;
  let userRepository: jest.Mocked<IUserRepository>;
  let tokenService: jest.Mocked<ITokenService>;

  beforeEach(() => {
    userRepository = mockUserRepository();
    tokenService = mockTokenService();
    useCase = new LoginUseCase(userRepository, tokenService);
    jest.clearAllMocks();
  });

  describe('Happy path', () => {
    it('retorna accessToken y datos públicos del usuario', async () => {
      const user = buildUser();
      userRepository.findByEmail.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      tokenService.sign.mockReturnValue('signed.jwt.token');

      const result = await useCase.execute({
        email: 'user@example.com',
        password: 'plain_password',
      });

      expect(result.accessToken).toBe('signed.jwt.token');
      expect(result.user).toEqual({
        id: 1,
        email: 'user@example.com',
        role: UserRole.CLIENT,
      });
    });

    it('firma el token con sub, email y role correctos', async () => {
      const user = buildUser({ id: 42, email: 'admin@example.com', role: UserRole.ADMIN });
      userRepository.findByEmail.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      tokenService.sign.mockReturnValue('admin.jwt.token');

      await useCase.execute({ email: 'admin@example.com', password: 'password123' });

      expect(tokenService.sign).toHaveBeenCalledWith({
        sub: 42,
        email: 'admin@example.com',
        role: UserRole.ADMIN,
      });
    });

    it('normaliza el email a minúsculas y sin espacios antes de buscar', async () => {
      const user = buildUser({ email: 'user@example.com' });
      userRepository.findByEmail.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      tokenService.sign.mockReturnValue('token');

      await useCase.execute({ email: '  USER@EXAMPLE.COM  ', password: 'password123' });

      expect(userRepository.findByEmail).toHaveBeenCalledWith('user@example.com');
    });
  });

  describe('Entidad no encontrada', () => {
    it('lanza InvalidCredentialsException cuando el usuario no existe', async () => {
      userRepository.findByEmail.mockResolvedValue(null);

      await expect(
        useCase.execute({ email: 'unknown@example.com', password: 'password123' }),
      ).rejects.toThrow(InvalidCredentialsException);
    });

    it('no revela si el email existe o no (mismo error que contraseña incorrecta)', async () => {
      userRepository.findByEmail.mockResolvedValue(null);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const notFoundError = await useCase
        .execute({ email: 'noexist@example.com', password: 'wrong' })
        .catch((e: unknown) => e);

      const wrongPasswordError = await useCase
        .execute({ email: 'noexist@example.com', password: 'wrong' })
        .catch((e: unknown) => e);

      expect(notFoundError).toBeInstanceOf(InvalidCredentialsException);
      expect(wrongPasswordError).toBeInstanceOf(InvalidCredentialsException);
      expect((notFoundError as Error).message).toBe((wrongPasswordError as Error).message);
    });
  });

  describe('Cuenta inactiva', () => {
    it('lanza InactiveUserException cuando isActive es false', async () => {
      const inactiveUser = buildUser({ isActive: false });
      userRepository.findByEmail.mockResolvedValue(inactiveUser);

      await expect(
        useCase.execute({ email: 'user@example.com', password: 'password123' }),
      ).rejects.toThrow(InactiveUserException);
    });

    it('no verifica la contraseña si la cuenta está inactiva (Fail Fast)', async () => {
      const inactiveUser = buildUser({ isActive: false });
      userRepository.findByEmail.mockResolvedValue(inactiveUser);

      await expect(
        useCase.execute({ email: 'user@example.com', password: 'password123' }),
      ).rejects.toThrow();

      expect(bcrypt.compare).not.toHaveBeenCalled();
    });
  });

  describe('Contraseña incorrecta', () => {
    it('lanza InvalidCredentialsException cuando la contraseña no coincide', async () => {
      const user = buildUser();
      userRepository.findByEmail.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        useCase.execute({ email: 'user@example.com', password: 'wrong_password' }),
      ).rejects.toThrow(InvalidCredentialsException);
    });

    it('no genera token si la contraseña es incorrecta', async () => {
      const user = buildUser();
      userRepository.findByEmail.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        useCase.execute({ email: 'user@example.com', password: 'wrong_password' }),
      ).rejects.toThrow();

      expect(tokenService.sign).not.toHaveBeenCalled();
    });
  });

  describe('Forma de la respuesta', () => {
    it('retorna id 0 cuando el usuario no tiene id asignado', async () => {
      const userWithoutId = buildUser({ id: undefined });
      userRepository.findByEmail.mockResolvedValue(userWithoutId);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      tokenService.sign.mockReturnValue('token');

      const result = await useCase.execute({
        email: 'user@example.com',
        password: 'password123',
      });

      expect(result.user.id).toBe(0);
    });

    it('incluye role en la respuesta', async () => {
      const adminUser = buildUser({ role: UserRole.ADMIN });
      userRepository.findByEmail.mockResolvedValue(adminUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      tokenService.sign.mockReturnValue('token');

      const result = await useCase.execute({
        email: 'admin@example.com',
        password: 'password123',
      });

      expect(result.user.role).toBe(UserRole.ADMIN);
    });
  });
});
