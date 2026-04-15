import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { ITokenService } from '../../domain/ports/out/ITokenService';

@Injectable()
export class JwtTokenService implements ITokenService {
  constructor(private readonly jwtService: JwtService) {}

  sign(payload: Record<string, unknown>): string {
    return this.jwtService.sign(payload);
  }
}
