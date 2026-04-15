import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User, UserRole } from '../../domain/entities/User';
import { IUserRepository } from '../../domain/ports/out/IUserRepository';
import { UserOrmEntity, UserRoleOrm } from './user.orm-entity';

const ROLE_TO_DOMAIN: Record<UserRoleOrm, UserRole> = {
  [UserRoleOrm.ADMIN]: UserRole.ADMIN,
  [UserRoleOrm.CLIENT]: UserRole.CLIENT,
};

const ROLE_TO_ORM: Record<UserRole, UserRoleOrm> = {
  [UserRole.ADMIN]: UserRoleOrm.ADMIN,
  [UserRole.CLIENT]: UserRoleOrm.CLIENT,
};

class UserMapper {
  static toDomain(orm: UserOrmEntity): User {
    return new User({
      id: orm.id,
      email: orm.email,
      password: orm.password,
      role: ROLE_TO_DOMAIN[orm.role] ?? UserRole.CLIENT,
      isActive: orm.isActive,
      createdAt: orm.createdAt,
    });
  }

  static toPersistence(user: User): Partial<UserOrmEntity> {
    return {
      ...(user.id !== undefined && { id: user.id }),
      email: user.email,
      password: user.password,
      role: ROLE_TO_ORM[user.role],
      isActive: user.isActive,
      createdAt: user.createdAt,
    };
  }
}

@Injectable()
export class UserTypeOrmRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly repo: Repository<UserOrmEntity>,
  ) {}

  async save(user: User): Promise<User> {
    const orm = this.repo.create(UserMapper.toPersistence(user));
    const saved = await this.repo.save(orm);
    return UserMapper.toDomain(saved);
  }

  async findByEmail(email: string): Promise<User | null> {
    const orm = await this.repo.findOne({ where: { email } });
    return orm ? UserMapper.toDomain(orm) : null;
  }

  async findById(id: number): Promise<User | null> {
    const orm = await this.repo.findOne({ where: { id } });
    return orm ? UserMapper.toDomain(orm) : null;
  }

  async existsByEmail(email: string): Promise<boolean> {
    return this.repo.existsBy({ email });
  }

  async findAll(): Promise<User[]> {
    const orms = await this.repo.find({ order: { createdAt: 'DESC' } });
    return orms.map(UserMapper.toDomain);
  }
}
