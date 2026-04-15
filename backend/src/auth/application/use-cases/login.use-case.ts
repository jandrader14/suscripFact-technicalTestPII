import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import {
  ILoginUseCase,
  LoginInput,
  AuthTokenResponse,
} from '../../domain/ports/in/IAuthUseCase';
import { IUserRepository } from '../../domain/ports/out/IUserRepository';
import { ITokenService } from '../../domain/ports/out/ITokenService';
import { User } from '../../domain/entities/User';
import {
  InvalidCredentialsException,
  InactiveUserException,
} from '../../domain/exceptions/AuthExceptions';

@Injectable()
export class LoginUseCase implements ILoginUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly tokenService: ITokenService,
  ) {}

  async execute(input: LoginInput): Promise<AuthTokenResponse> {
    const user = await this.findUserOrFail(input.email);

    this.validateAccountIsActive(user.isActive);

    await this.validatePassword(input.password, user.password);

    const accessToken = this.generateToken(user);

    return {
      accessToken,
      user: {
        id: user.id ?? 0,
        email: user.email,
        role: user.role,
      },
    };
  }

  private async findUserOrFail(email: string): Promise<User> {
    const user = await this.userRepository.findByEmail(email.toLowerCase().trim());
    if (!user) {
      throw new InvalidCredentialsException();
    }
    return user;
  }

  private validateAccountIsActive(isActive: boolean): void {
    if (!isActive) {
      throw new InactiveUserException();
    }
  }

  private async validatePassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<void> {
    const isValid = await bcrypt.compare(plainPassword, hashedPassword);
    if (!isValid) {
      throw new InvalidCredentialsException();
    }
  }

  private generateToken(user: User): string {
    return this.tokenService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
  }
}
