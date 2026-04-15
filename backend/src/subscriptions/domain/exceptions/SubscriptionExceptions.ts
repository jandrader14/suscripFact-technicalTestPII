export class SubscriptionException extends Error {
  readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
  }
}

export class SubscriptionNotFoundException extends SubscriptionException {
  constructor(id: number) {
    super(`No se encontró una suscripción con id ${id}.`, 404);
  }
}

export class ActiveSubscriptionAlreadyExistsException extends SubscriptionException {
  constructor(userId: number) {
    super(`El usuario ${userId} ya tiene una suscripción activa.`, 409);
  }
}

export class SubscriptionExpiredException extends SubscriptionException {
  constructor() {
    super('La suscripción ha expirado.', 422);
  }
}
