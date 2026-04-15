import { BronzeStrategy } from './bronze.strategy';

describe('BronzeStrategy', () => {
  let strategy: BronzeStrategy;

  beforeEach(() => {
    strategy = new BronzeStrategy();
  });

  describe('calculateAmount - Sin descuento', () => {
    describe('Caso feliz: Calcula precio sin modificación', () => {
      it('devuelve el precio exacto sin aplicar descuento', () => {
        // Arrange
        const precio = 100;

        // Act
        const monto = strategy.calculateAmount(precio, undefined, undefined, undefined);

        // Assert
        expect(monto).toBe(100);
      });

      it('maneja precios decimales correctamente', () => {
        // Arrange
        const precioDecimal = 99.99;

        // Act
        const monto = strategy.calculateAmount(precioDecimal, undefined, undefined, undefined);

        // Assert
        expect(monto).toBe(99.99);
      });

      it('procesa precios muy grandes sin error', () => {
        // Arrange
        const precioAlto = 999999.99;

        // Act
        const monto = strategy.calculateAmount(precioAlto, undefined, undefined, undefined);

        // Assert
        expect(monto).toBe(999999.99);
      });
    });

    describe('Edge cases: Valores extremos', () => {
      it('maneja cero como precio (plan gratuito)', () => {
        // Arrange
        const precioGratuito = 0;

        // Act
        const monto = strategy.calculateAmount(precioGratuito, undefined, undefined, undefined);

        // Assert
        expect(monto).toBe(0);
      });

      it('permite precios negativos (debería validarse en DTO)', () => {
        // Arrange - VIOLACIÓN: precio negativo
        const precioNegativo = -100;

        // Act
        const monto = strategy.calculateAmount(precioNegativo, undefined, undefined, undefined);

        // Assert - Devuelve el valor tal cual
        expect(monto).toBe(-100);
        // NOTA: Debe validarse en GenerateInvoiceDTO con @IsPositive()
      });
    });
  });

  describe('getPlanType', () => {
    it('devuelve el tipo de plan BRONZE', () => {
      // Arrange & Act
      const tipo = strategy.getPlanType();

      // Assert
      expect(tipo).toBe('BRONZE');
    });
  });
});
