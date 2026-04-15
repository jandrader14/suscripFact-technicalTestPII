import { Injectable } from '@nestjs/common';

import { User } from '../../domain/entities/User';
import { IGetAllUsersUseCase } from '../../domain/ports/in/IAuthUseCase';
import { IUserRepository } from '../../domain/ports/out/IUserRepository';

@Injectable()
export class GetAllUsersUseCase implements IGetAllUsersUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(): Promise<User[]> {
    return await this.userRepository.findAll();
  }
}
