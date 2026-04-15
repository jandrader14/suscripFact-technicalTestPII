export class PlanException extends Error {
  readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
  }
}

export class PlanNotFoundException extends PlanException {
  constructor(id: number) {
    super(`No se encontró un plan con id ${id}.`, 404);
  }
}

export class PlanAlreadyExistsException extends PlanException {
  constructor(name: string) {
    super(`Ya existe un plan con el tipo ${name}.`, 409);
  }
}

export class PlanNotAvailableException extends PlanException {
  constructor() {
    super('El plan no está disponible.', 422);
  }
}
