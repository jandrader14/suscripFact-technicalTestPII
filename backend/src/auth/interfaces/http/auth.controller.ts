import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import {
  IGetAllUsersUseCase,
  ILoginUseCase,
  IRegisterUseCase,
} from '../../domain/ports/in/IAuthUseCase';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUseCase: IRegisterUseCase,
    private readonly loginUseCase: ILoginUseCase,
    private readonly getAllUsersUseCase: IGetAllUsersUseCase,
  ) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    const user = await this.registerUseCase.execute(dto);
    return user.toPublic();
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    return this.loginUseCase.execute(dto);
  }

  @Get('users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async findAllUsers() {
    const users = await this.getAllUsersUseCase.execute();
    return users.map((u) => u.toPublic());
  }
}
