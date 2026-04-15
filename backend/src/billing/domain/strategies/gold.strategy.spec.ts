import { GoldStrategy } from './gold.strategy';

describe('GoldStrategy', () => {
  let strategy: GoldStrategy;

  beforeEach(() => {
    strategy = new GoldStrategy();
  });

  describe('calculateAmount - Descuento por volumen de usuarios', () => {
    describe('Caso feliz: Cálculos correctos de descuento', () => {
      it('aplica descuento del 15% para equipos pequeños (maxUsers ≤ 10)', () => {
        // Arrange
        const precio = 100;
        const maxUsuarios = 5;

        // Act
        const monto = strategy.calculateAmount(
          precio,
          undefined,
          undefined,
          maxUsuarios,
        );

        // Assert - 100 * (1 - 0.15) = 85
        expect(monto).toBe(85);
      });

      it('aplica descuento del 15% exactamente en el límite de 10 usuarios', () => {
        // Arrange
        const precio = 100;
        const maxUsuarios = 10; // Exactamente en el límite

        // Act
        const monto = strategy.calculateAmount(
          precio,
          undefined,
          undefined,
          maxUsuarios,
        );

        // Assert - 10 no es > 10, aplica solo 15%
        expect(monto).toBe(85);
      });

      it('aplica descuento del 20% para equipos grandes (maxUsers > 10)', () => {
        // Arrange
        const precio = 100;
        const maxUsuarios = 11; // Apenas sobre el límite

        // Act
        const monto = strategy.calculateAmount(
          precio,
          undefined,
          undefined,
          maxUsuarios,
        );

        // Assert - 100 * (1 - 0.20) = 80
        expect(monto).toBe(80);
      });

      it('calcula correctamente para equipos muy grandes (100+ usuarios)', () => {
        // Arrange
        const precio = 500;
        const maxUsuarios = 100;

        // Act
        const monto = strategy.calculateAmount(
          precio,
          undefined,
          undefined,
          maxUsuarios,
        );

        // Assert - 500 * (1 - 0.20) = 400
        expect(monto).toBe(400);
      });
    });

    describe('Edge cases: Límites y valores extremos', () => {
      it('maneja correctamente maxUsers = 0 (plan gratuito o sin usuarios)', () => {
        // Arrange
        const precio = 100;
        const maxUsuarios = 0;

        // Act
        const monto = strategy.calculateAmount(
          precio,
          undefined,
          undefined,
          maxUsuarios,
        );

        // Assert - 0 no es > 10, aplica descuento base
        expect(monto).toBe(85);
      });

      it('calcula con precisión decimal en descuentos grandes', () => {
        // Arrange
        const precioDecimal = 99.99;
        const maxUsuarios = 15; // Aplica 20%

        // Act
        const monto = strategy.calculateAmount(
          precioDecimal,
          undefined,
          undefined,
          maxUsuarios,
        );

        // Assert - 99.99 * 0.8 ≈ 79.992
        expect(monto).toBeCloseTo(99.99 * 0.8, 2);
      });

      it('precisa cálculos con precios muy altos', () => {
        // Arrange
        const precioAlto = 9999.99;
        const maxUsuarios = 15;

        // Act
        const monto = strategy.calculateAmount(
          precioAlto,
          undefined,
          undefined,
          maxUsuarios,
        );

        // Assert - 9999.99 * 0.8 ≈ 7999.992
        expect(monto).toBeCloseTo(9999.99 * 0.8, 2);
      });

      it('diferencia clara de precio en el punto de quiebre (10 vs 11 usuarios)', () => {
        // Arrange
        const precio = 1000;
        const usuariosPequenio = 10;
        const usuariosGrande = 11;

        // Act
        const montoPequenio = strategy.calculateAmount(
          precio,
          undefined,
          undefined,
          usuariosPequenio,
        );
        const montoGrande = strategy.calculateAmount(
          precio,
          undefined,
          undefined,
          usuariosGrande,
        );

        // Assert
        expect(montoPequenio).toBe(850); // 15% descuento
        expect(montoGrande).toBe(800); // 20% descuento
        expect(montoGrande).toBeLessThan(montoPequenio); // El volumen siempre cuesta menos
      });
    });

    describe('Conflictos de negocio: Casos que violarían reglas', () => {
      it('no aplica descuento adicional si exactamente tiene 10 usuarios', () => {
        // Arrange
        const precio = 1000;
        const usuariosEnLimite = 10;

        // Act
        const monto = strategy.calculateAmount(
          precio,
          undefined,
          undefined,
          usuariosEnLimite,
        );

        // Assert - Debe ser exactamente 15%, no 20%
        expect(monto).toBe(850);
        expect(monto).not.toBe(800);
      });
    });

    describe('Datos inválidos: Valores que no pasarían validación', () => {
      it('permite maxUsers negativo (debería rechazarse en DTO)', () => {
        // Arrange - VIOLACIÓN: usuarios negativos
        const precio = 100;
        const maxUsuariosNegativo = -5;

        // Act
        const monto = strategy.calculateAmount(
          precio,
          undefined,
          undefined,
          maxUsuariosNegativo,
        );

        // Assert - Calcula como si no cumpliera condición > 10
        expect(monto).toBe(85); // Aplica solo el descuento base
        // NOTA: Debe validarse en PlanDTO con @IsPositive()
      });

      it('permite precios negativos (debería rechazarse en DTO)', () => {
        // Arrange - VIOLACIÓN: precio negativo
        const precioNegativo = -100;
        const maxUsuarios = 15;

        // Act
        const monto = strategy.calculateAmount(
          precioNegativo,
          undefined,
          undefined,
          maxUsuarios,
        );

        // Assert - Calcula pero mantiene el negativo
        expect(monto).toBeLessThan(0);
        // NOTA: La validación debe ocurrir en GenerateInvoiceDTO
      });

      it('maneja cero como precio (plan gratuito)', () => {
        // Arrange
        const precioGratuito = 0;
        const maxUsuarios = 100;

        // Act
        const monto = strategy.calculateAmount(
          precioGratuito,
          undefined,
          undefined,
          maxUsuarios,
        );

        // Assert
        expect(monto).toBe(0);
      });
    });
  });

  describe('getPlanType', () => {
    it('devuelve el tipo de plan GOLD', () => {
      // Arrange & Act
      const tipo = strategy.getPlanType();

      // Assert
      expect(tipo).toBe('GOLD');
    });
  });
});
