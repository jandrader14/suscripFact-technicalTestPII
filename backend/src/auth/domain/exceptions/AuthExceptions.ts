export class AuthException extends Error {
  readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
  }
}

export class InvalidCredentialsException extends AuthException {
  constructor() {
    super('Credenciales inválidas.', 401);
  }
}

export class UserAlreadyExistsException extends AuthException {
  constructor(email: string) {
    super(`El usuario con email ${email} ya existe.`, 409);
  }
}

export class UserNotFoundException extends AuthException {
  constructor(email: string) {
    super(`No se encontró un usuario con email ${email}.`, 404);
  }
}

export class InactiveUserException extends AuthException {
  constructor() {
    super('La cuenta de usuario está inactiva.', 403);
  }
}

export class UnauthorizedException extends AuthException {
  constructor() {
    super('No tienes permisos para realizar esta acción.', 403);
  }
}
