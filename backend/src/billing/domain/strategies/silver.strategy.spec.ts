import { SilverStrategy } from './silver.strategy';

describe('SilverStrategy', () => {
  let strategy: SilverStrategy;

  beforeEach(() => {
    strategy = new SilverStrategy();
  });

  describe('calculateAmount - Descuento por duración', () => {
    describe('Caso feliz: Cálculos correctos de descuento', () => {
      it('no aplica descuento en períodos de 5 meses o menos', () => {
        // Arrange
        const precioMensual = 100;
        const fechaInicio = new Date('2026-01-01');
        const fechaFin = new Date('2026-05-31'); // 5 meses

        // Act
        const monto = strategy.calculateAmount(precioMensual, fechaInicio, fechaFin);

        // Assert
        expect(monto).toBe(100);
      });

      it('aplica descuento del 10% en períodos mayores a 6 meses', () => {
        // Arrange
        const precioMensual = 100;
        const fechaInicio = new Date('2026-01-01');
        const fechaFin = new Date('2026-08-01'); // 7 meses

        // Act
        const monto = strategy.calculateAmount(precioMensual, fechaInicio, fechaFin);

        // Assert - 100 * 0.9 = 90
        expect(monto).toBe(90);
      });

      it('aplica descuento en exactamente 6 meses + 1 día', () => {
        // Arrange
        const precioMensual = 100;
        const fechaInicio = new Date('2026-01-01');
        const fechaFin = new Date('2026-07-02'); // 6 meses + 1 día

        // Act
        const monto = strategy.calculateAmount(precioMensual, fechaInicio, fechaFin);

        // Assert
        expect(monto).toBe(90);
      });

      it('calcula correctamente para 12 meses (1 año)', () => {
        // Arrange
        const precioMensual = 500;
        const fechaInicio = new Date('2026-01-01');
        const fechaFin = new Date('2027-01-01');

        // Act
        const monto = strategy.calculateAmount(precioMensual, fechaInicio, fechaFin);

        // Assert - 500 * 0.9 = 450
        expect(monto).toBe(450);
      });
    });

    describe('Edge cases: Límites y valores extremos', () => {
      it('maneja correctamente fechas iguales (0 meses)', () => {
        // Arrange
        const precioMensual = 100;
        const fechaMisma = new Date('2026-01-01');

        // Act
        const monto = strategy.calculateAmount(precioMensual, fechaMisma, fechaMisma);

        // Assert - 0 meses no es > 6, sin descuento
        expect(monto).toBe(100);
      });

      it('precisa el cálculo con precios decimales', () => {
        // Arrange
        const precioDecimal = 99.99;
        const fechaInicio = new Date('2026-01-01');
        const fechaFin = new Date('2026-08-01'); // 7 meses, aplica 10%

        // Act
        const monto = strategy.calculateAmount(precioDecimal, fechaInicio, fechaFin);

        // Assert - 99.99 * 0.9 = 89.991
        expect(monto).toBeCloseTo(89.99 * 0.9, 2);
      });

      it('calcula correctamente períodos que cruzan años', () => {
        // Arrange
        const precioMensual = 100;
        const fechaInicio = new Date('2025-11-01');
        const fechaFin = new Date('2026-05-01'); // Exactamente 6 meses

        // Act
        const monto = strategy.calculateAmount(precioMensual, fechaInicio, fechaFin);

        // Assert - Exactamente 6 meses, no aplica descuento
        expect(monto).toBe(100);
      });

      it('maneja períodos muy largos (5+ años)', () => {
        // Arrange
        const precioMensual = 1000;
        const fechaInicio = new Date('2020-01-01');
        const fechaFin = new Date('2026-01-01');

        // Act
        const monto = strategy.calculateAmount(precioMensual, fechaInicio, fechaFin);

        // Assert - Más de 6 meses, aplica 10%
        expect(monto).toBe(900);
      });
    });

    describe('Conflictos de negocio: Casos que violarían reglas', () => {
      it('devuelve precio sin descuento si fecha fin es anterior a inicio', () => {
        // Arrange - VIOLACIÓN: endDate < startDate
        const precioMensual = 100;
        const fechaInicio = new Date('2026-12-31');
        const fechaFin = new Date('2026-01-01'); // ANTES que inicio

        // Act
        const monto = strategy.calculateAmount(precioMensual, fechaInicio, fechaFin);

        // Assert - Calcula meses negativos, no entra en descuento
        expect(monto).toBe(100);
        // NOTA: Esta lógica debe validarse en la capa DTO antes de llegar aquí
      });

      it('no aplica descuento cuando meses es exactamente 6', () => {
        // Arrange
        const precioMensual = 100;
        const fechaInicio = new Date('2026-01-01');
        const fechaFin = new Date('2026-06-30'); // Exactamente ~6 meses

        // Act
        const monto = strategy.calculateAmount(precioMensual, fechaInicio, fechaFin);

        // Assert - No cumple condición > 6
        expect(monto).toBeGreaterThanOrEqual(100);
      });
    });

    describe('Datos inválidos: Valores que no pasarían validación', () => {
      it('permite precios negativos (debería rechazarse en DTO)', () => {
        // Arrange - VIOLACIÓN: precio negativo
        const precioNegativo = -100;
        const fechaInicio = new Date('2026-01-01');
        const fechaFin = new Date('2026-08-01'); // 7 meses

        // Act
        const monto = strategy.calculateAmount(precioNegativo, fechaInicio, fechaFin);

        // Assert - Calcula pero con valor negativo
        expect(monto).toBeLessThan(0);
        // NOTA: La validación debe ocurrir en GenerateInvoiceDTO
      });

      it('maneja cero como precio base (plan gratuito)', () => {
        // Arrange
        const precioGratuito = 0;
        const fechaInicio = new Date('2026-01-01');
        const fechaFin = new Date('2026-08-01');

        // Act
        const monto = strategy.calculateAmount(precioGratuito, fechaInicio, fechaFin);

        // Assert
        expect(monto).toBe(0);
      });
    });
  });

  describe('getPlanType', () => {
    it('devuelve el tipo de plan SILVER', () => {
      // Arrange & Act
      const tipo = strategy.getPlanType();

      // Assert
      expect(tipo).toBe('SILVER');
    });
  });
});
