import * as bcrypt from 'bcrypt';

import { User, UserRole } from '../../domain/entities/User';
import { UserAlreadyExistsException } from '../../domain/exceptions/AuthExceptions';
import { IUserRepository } from '../../domain/ports/out/IUserRepository';
import { RegisterUseCase } from './register.use-case';

jest.mock('bcrypt');

const mockUserRepository = (): jest.Mocked<IUserRepository> => ({
  save: jest.fn(),
  findByEmail: jest.fn(),
  findById: jest.fn(),
  existsByEmail: jest.fn(),
});

const buildUser = (overrides: Partial<User> = {}): User =>
  new User({
    id: 1,
    email: 'test@example.com',
    password: 'hashed_password',
    role: UserRole.CLIENT,
    isActive: true,
    createdAt: new Date('2026-01-01'),
    ...overrides,
  });

describe('RegisterUseCase', () => {
  let useCase: RegisterUseCase;
  let userRepository: jest.Mocked<IUserRepository>;

  beforeEach(() => {
    userRepository = mockUserRepository();
    useCase = new RegisterUseCase(userRepository);
    jest.clearAllMocks();
  });

  describe('Happy path', () => {
    it('registra un usuario nuevo con rol CLIENT por defecto', async () => {
      userRepository.existsByEmail.mockResolvedValue(false);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
      const savedUser = buildUser();
      userRepository.save.mockResolvedValue(savedUser);

      const result = await useCase.execute({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).toBe(savedUser);
      expect(userRepository.save).toHaveBeenCalledTimes(1);
      const savedArg: User = userRepository.save.mock.calls[0][0];
      expect(savedArg.role).toBe(UserRole.CLIENT);
    });

    it('registra un usuario con rol ADMIN cuando se especifica', async () => {
      userRepository.existsByEmail.mockResolvedValue(false);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
      const adminUser = buildUser({ role: UserRole.ADMIN });
      userRepository.save.mockResolvedValue(adminUser);

      const result = await useCase.execute({
        email: 'admin@example.com',
        password: 'password123',
        role: 'ADMIN',
      });

      expect(result.role).toBe(UserRole.ADMIN);
    });

    it('hashea la contraseña antes de persistir', async () => {
      userRepository.existsByEmail.mockResolvedValue(false);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
      userRepository.save.mockResolvedValue(buildUser());

      await useCase.execute({ email: 'test@example.com', password: 'plain_password' });

      expect(bcrypt.hash).toHaveBeenCalledWith('plain_password', 10);
      const savedArg: User = userRepository.save.mock.calls[0][0];
      expect(savedArg.password).toBe('hashed_password');
      expect(savedArg.password).not.toBe('plain_password');
    });

    it('normaliza el email a minúsculas antes de guardar', async () => {
      userRepository.existsByEmail.mockResolvedValue(false);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
      userRepository.save.mockResolvedValue(buildUser({ email: 'user@example.com' }));

      await useCase.execute({ email: 'USER@EXAMPLE.COM', password: 'password123' });

      const savedArg: User = userRepository.save.mock.calls[0][0];
      expect(savedArg.email).toBe('user@example.com');
    });

    it('elimina espacios del email antes de guardar', async () => {
      userRepository.existsByEmail.mockResolvedValue(false);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
      userRepository.save.mockResolvedValue(buildUser({ email: 'user@example.com' }));

      await useCase.execute({ email: '  user@example.com  ', password: 'password123' });

      const savedArg: User = userRepository.save.mock.calls[0][0];
      expect(savedArg.email).toBe('user@example.com');
    });
  });

  describe('Conflicto de negocio', () => {
    it('lanza UserAlreadyExistsException si el email ya está registrado', async () => {
      userRepository.existsByEmail.mockResolvedValue(true);

      await expect(
        useCase.execute({ email: 'existing@example.com', password: 'password123' }),
      ).rejects.toThrow(UserAlreadyExistsException);
    });

    it('no llama a save si el email ya existe', async () => {
      userRepository.existsByEmail.mockResolvedValue(true);

      await expect(
        useCase.execute({ email: 'existing@example.com', password: 'password123' }),
      ).rejects.toThrow();

      expect(userRepository.save).not.toHaveBeenCalled();
    });

    it('no hashea la contraseña si el email ya existe (Fail Fast)', async () => {
      userRepository.existsByEmail.mockResolvedValue(true);

      await expect(
        useCase.execute({ email: 'existing@example.com', password: 'password123' }),
      ).rejects.toThrow();

      expect(bcrypt.hash).not.toHaveBeenCalled();
    });
  });

  describe('Resolución de rol', () => {
    it('asigna CLIENT cuando no se proporciona rol', async () => {
      userRepository.existsByEmail.mockResolvedValue(false);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
      userRepository.save.mockResolvedValue(buildUser());

      await useCase.execute({ email: 'test@example.com', password: 'password123' });

      const savedArg: User = userRepository.save.mock.calls[0][0];
      expect(savedArg.role).toBe(UserRole.CLIENT);
    });

    it('asigna CLIENT cuando se pasa un rol desconocido', async () => {
      userRepository.existsByEmail.mockResolvedValue(false);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
      userRepository.save.mockResolvedValue(buildUser());

      await useCase.execute({
        email: 'test@example.com',
        password: 'password123',
        role: 'SUPERADMIN',
      });

      const savedArg: User = userRepository.save.mock.calls[0][0];
      expect(savedArg.role).toBe(UserRole.CLIENT);
    });
  });
});
