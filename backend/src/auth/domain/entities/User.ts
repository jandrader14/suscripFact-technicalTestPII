export enum UserRole {
  ADMIN = 'ADMIN',
  CLIENT = 'CLIENT',
}

export interface UserProps {
  id?: number;
  email: string;
  password: string;
  role?: UserRole;
  createdAt?: Date;
  isActive?: boolean;
}

export interface PublicUser {
  id: number;
  email: string;
  role: UserRole;
  createdAt: Date;
  isActive: boolean;
}

export class User {
  readonly id: number | undefined;
  readonly email: string;
  readonly password: string;
  readonly role: UserRole;
  readonly createdAt: Date;
  readonly isActive: boolean;

  constructor(props: UserProps) {
    this.id = props.id;
    this.email = props.email;
    this.password = props.password;
    this.role = props.role ?? UserRole.CLIENT;
    this.createdAt = props.createdAt ?? new Date();
    this.isActive = props.isActive ?? true;
  }

  isAdmin(): boolean {
    return this.role === UserRole.ADMIN;
  }

  isClient(): boolean {
    return this.role === UserRole.CLIENT;
  }

  hasActiveAccount(): boolean {
    return this.isActive;
  }

  toPublic(): PublicUser {
    return {
      id: this.id ?? 0,
      email: this.email,
      role: this.role,
      createdAt: this.createdAt,
      isActive: this.isActive,
    };
  }
}
