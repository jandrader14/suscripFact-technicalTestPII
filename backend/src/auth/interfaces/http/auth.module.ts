import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

import { GetAllUsersUseCase } from '../../application/use-cases/get-all-users.use-case';
import { LoginUseCase } from '../../application/use-cases/login.use-case';
import { RegisterUseCase } from '../../application/use-cases/register.use-case';
import {
  IGetAllUsersUseCase,
  ILoginUseCase,
  IRegisterUseCase,
} from '../../domain/ports/in/IAuthUseCase';
import { ITokenService } from '../../domain/ports/out/ITokenService';
import { IUserRepository } from '../../domain/ports/out/IUserRepository';
import { UserOrmEntity } from '../../infrastructure/persistence/user.orm-entity';
import { UserTypeOrmRepository } from '../../infrastructure/persistence/user.typeorm.repository';
import { JwtTokenService } from '../../infrastructure/services/jwt-token.service';
import { JwtStrategy } from '../../infrastructure/strategies/jwt.strategy';
import { AuthController } from './auth.controller';

@Module({
  imports: [
    ConfigModule,
    PassportModule,
    TypeOrmModule.forFeature([UserOrmEntity]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.getOrThrow<string>(
            'JWT_EXPIRES_IN',
          ) as `${number}${'s' | 'm' | 'h' | 'd'}`,
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    JwtStrategy,
    {
      provide: IUserRepository,
      useClass: UserTypeOrmRepository,
    },
    {
      provide: ITokenService,
      useClass: JwtTokenService,
    },
    {
      provide: IRegisterUseCase,
      useClass: RegisterUseCase,
    },
    {
      provide: ILoginUseCase,
      useClass: LoginUseCase,
    },
    {
      provide: IGetAllUsersUseCase,
      useClass: GetAllUsersUseCase,
    },
  ],
  exports: [JwtModule, PassportModule],
})
export class AuthModule {}
