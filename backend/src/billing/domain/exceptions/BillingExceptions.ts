export class BillingException extends Error {
  readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
  }
}

export class InvoiceNotFoundException extends BillingException {
  constructor(id: number) {
    super(`No se encontró una factura con id ${id}.`, 404);
  }
}

export class InvoiceAlreadyPaidException extends BillingException {
  constructor(id: number) {
    super(`La factura con id ${id} ya fue pagada.`, 409);
  }
}

export class InvalidBillingStrategyException extends BillingException {
  constructor(planType: string) {
    super(`No existe una estrategia de facturación para el tipo de plan: ${planType}.`, 422);
  }
}
