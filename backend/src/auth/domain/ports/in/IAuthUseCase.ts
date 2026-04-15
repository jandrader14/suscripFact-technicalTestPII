import { User } from '../../entities/User';

export interface RegisterInput {
  email: string;
  password: string;
  role?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthTokenResponse {
  accessToken: string;
  user: {
    id: number;
    email: string;
    role: string;
  };
}

export abstract class IRegisterUseCase {
  abstract execute(input: RegisterInput): Promise<User>;
}

export abstract class ILoginUseCase {
  abstract execute(input: LoginInput): Promise<AuthTokenResponse>;
}
