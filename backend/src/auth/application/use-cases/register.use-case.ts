import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { User, UserRole } from '../../domain/entities/User';
import {
  IRegisterUseCase,
  RegisterInput,
} from '../../domain/ports/in/IAuthUseCase';
import { IUserRepository } from '../../domain/ports/out/IUserRepository';
import { UserAlreadyExistsException } from '../../domain/exceptions/AuthExceptions';

@Injectable()
export class RegisterUseCase implements IRegisterUseCase {
  private readonly SALT_ROUNDS = 10;

  constructor(private readonly userRepository: IUserRepository) {}

  async execute(input: RegisterInput): Promise<User> {
    await this.validateEmailNotTaken(input.email);

    const hashedPassword = await this.hashPassword(input.password);

    const user = new User({
      email: input.email.toLowerCase().trim(),
      password: hashedPassword,
      role: this.resolveRole(input.role),
    });

    return this.userRepository.save(user);
  }

  private async validateEmailNotTaken(email: string): Promise<void> {
    const exists = await this.userRepository.existsByEmail(email);
    if (exists) {
      throw new UserAlreadyExistsException(email);
    }
  }

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  private resolveRole(role?: string): UserRole {
    if (role === UserRole.ADMIN) {
      return UserRole.ADMIN;
    }
    return UserRole.CLIENT;
  }
}
