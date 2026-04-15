import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

/**
 * Valida que la fecha sea en el futuro (no en el pasado)
 * Útil para startDate de suscripciones
 *
 * En desarrollo (NODE_ENV === 'development'), permite cualquier fecha para testing
 * En producción, exige fechas futuras
 */
@ValidatorConstraint({ name: 'isFutureDate', async: false })
export class IsFutureDateValidator implements ValidatorConstraintInterface {
  validate(value: string | Date): boolean {
    // En desarrollo, permitir cualquier fecha para testing
    if (process.env.NODE_ENV === 'development') {
      return true;
    }

    if (!value) return false;
    const date = new Date(value);
    return date > new Date();
  }

  defaultMessage(args: ValidationArguments): string {
    return `${args.property} debe ser una fecha en el futuro`;
  }
}

/**
 * Valida que endDate sea posterior a startDate
 * Se usa solo en endDate del DTO
 */
@ValidatorConstraint({
  name: 'isEndDateAfterStartDate',
  async: false,
})
export class IsEndDateAfterStartDateValidator implements ValidatorConstraintInterface {
  validate(value: string | Date, args: ValidationArguments): boolean {
    if (!value) return false;

    const object = args.object as Record<string, unknown>;
    const startDate = object.startDate;

    if (!startDate) return false;

    const endDate = new Date(value);
    const start = new Date(startDate as string | Date);

    return endDate > start;
  }

  defaultMessage(args: ValidationArguments): string {
    return `${args.property} debe ser posterior a startDate`;
  }
}
