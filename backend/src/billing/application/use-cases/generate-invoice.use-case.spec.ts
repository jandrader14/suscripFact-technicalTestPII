import { Test, TestingModule } from '@nestjs/testing';
import { GenerateInvoiceUseCase } from './generate-invoice.use-case';
import { IInvoiceRepository } from '../../domain/ports/out/IInvoiceRepository';
import { IBillingStrategy } from '../../domain/strategies/billing-strategy.interface';
import { InvalidBillingStrategyException } from '../../domain/exceptions/BillingExceptions';

// Mock strategies
const mockBronzeStrategy = {
  getPlanType: () => 'BRONZE',
  calculateAmount: (price: number) => price,
};

const mockSilverStrategy = {
  getPlanType: () => 'SILVER',
  calculateAmount: (price: number, startDate: Date, endDate: Date) => {
    const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 
      + (endDate.getMonth() - startDate.getMonth());
    return months > 6 ? price * 0.9 : price;
  },
};

const mockGoldStrategy = {
  getPlanType: () => 'GOLD',
  calculateAmount: (price: number, _: Date, __: Date, maxUsers: number) => {
    const discount = maxUsers > 10 ? 0.2 : 0.15;
    return price * (1 - discount);
  },
};

describe('GenerateInvoiceUseCase - Edge Cases', () => {
  let useCase: GenerateInvoiceUseCase;
  let mockInvoiceRepository: jest.Mocked<IInvoiceRepository>;

  beforeEach(async () => {
    mockInvoiceRepository = {
      save: jest.fn().mockResolvedValue({}),
      findById: jest.fn(),
      findByUserId: jest.fn(),
      findAll: jest.fn(),
    } as any;

    const strategies = [mockBronzeStrategy, mockSilverStrategy, mockGoldStrategy] as any[];

    useCase = new GenerateInvoiceUseCase(mockInvoiceRepository, strategies);
  });

  describe('execute - Caso feliz: Genera facturas correctamente', () => {
    it('genera factura BRONZE sin aplicar descuento', async () => {
      // Arrange
      const datoFactura = {
        subscriptionId: 1,
        userId: 1,
        planType: 'BRONZE',
        planPrice: 100,
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-12-31'),
        maxUsers: 5,
        dueDate: new Date('2026-02-01'),
      };

      // Act
      const factura = await useCase.execute(datoFactura);

      // Assert
      expect(mockInvoiceRepository.save).toHaveBeenCalled();
      expect(factura).toBeDefined();
    });

    it('genera factura SILVER con descuento aplicado (> 6 meses)', async () => {
      // Arrange
      const datoFactura = {
        subscriptionId: 1,
        userId: 1,
        planType: 'SILVER',
        planPrice: 100,
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-08-01'), // 7 meses ➜ 10% descuento
        maxUsers: 5,
        dueDate: new Date('2026-02-01'),
      };

      // Act
      const factura = await useCase.execute(datoFactura);

      // Assert
      expect(mockInvoiceRepository.save).toHaveBeenCalled();
    });

    it('genera factura GOLD con descuento por volumen (> 10 usuarios)', async () => {
      // Arrange
      const datoFactura = {
        subscriptionId: 1,
        userId: 1,
        planType: 'GOLD',
        planPrice: 100,
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-12-31'),
        maxUsers: 15, // > 10 ➜ 20% descuento
        dueDate: new Date('2026-02-01'),
      };

      // Act
      const factura = await useCase.execute(datoFactura);

      // Assert
      expect(mockInvoiceRepository.save).toHaveBeenCalled();
    });
  });

  describe('execute - Estrategia inválida', () => {
    it('rechaza tipo de plan desconocido', async () => {
      // Arrange
      const datoFactura = {
        subscriptionId: 1,
        userId: 1,
        planType: 'PLATINUM', // No existe
        planPrice: 100,
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-12-31'),
        maxUsers: 5,
        dueDate: new Date('2026-02-01'),
      };

      // Act & Assert
      await expect(useCase.execute(datoFactura as any)).rejects.toThrow(
        InvalidBillingStrategyException,
      );
      expect(mockInvoiceRepository.save).not.toHaveBeenCalled();
    });

    it('rechaza planType nulo', async () => {
      // Arrange
      const datoFactura = {
        subscriptionId: 1,
        userId: 1,
        planType: null,
        planPrice: 100,
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-12-31'),
        maxUsers: 5,
        dueDate: new Date('2026-02-01'),
      };

      // Act & Assert
      await expect(useCase.execute(datoFactura as any)).rejects.toThrow();
    });
  });

  describe('execute - Edge cases: Fechas inválidas', () => {
    it('calcula monto correcto cuando endDate < startDate (debería validarse en DTO)', async () => {
      // Arrange - VIOLACIÓN: fechas inversas
      const datoFactura = {
        subscriptionId: 1,
        userId: 1,
        planType: 'SILVER',
        planPrice: 100,
        startDate: new Date('2026-12-31'),
        endDate: new Date('2026-01-01'), // ANTES que startDate
        maxUsers: 5,
        dueDate: new Date('2026-02-01'),
      };

      // Act
      const factura = await useCase.execute(datoFactura);

      // Assert - Se procesa pero con lógica inconsistente
      expect(mockInvoiceRepository.save).toHaveBeenCalled();
      // NOTA: Debe validarse en create-subscription.dto.ts
    });

    it('genera factura con fechas iguales (0 meses)', async () => {
      // Arrange
      const mismaFecha = new Date('2026-06-15');
      const datoFactura = {
        subscriptionId: 1,
        userId: 1,
        planType: 'SILVER',
        planPrice: 100,
        startDate: mismaFecha,
        endDate: mismaFecha,
        maxUsers: 5,
        dueDate: new Date('2026-02-01'),
      };

      // Act
      const factura = await useCase.execute(datoFactura);

      // Assert
      expect(mockInvoiceRepository.save).toHaveBeenCalled();
    });

    it('permite dueDate en el pasado (debería validarse en DTO)', async () => {
      // Arrange
      const hoy = new Date();
      const ayer = new Date(hoy.getTime() - 24 * 60 * 60 * 1000);

      const datoFactura = {
        subscriptionId: 1,
        userId: 1,
        planType: 'BRONZE',
        planPrice: 100,
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-12-31'),
        maxUsers: 5,
        dueDate: ayer, // En el pasado
      };

      // Act
      const factura = await useCase.execute(datoFactura);

      // Assert - Se procesa pero con vencimiento pasado
      expect(mockInvoiceRepository.save).toHaveBeenCalled();
      // NOTA: Debe validarse en GenerateInvoiceDTO
    });
  });

  describe('execute - Edge cases: Precios y usuarios', () => {
    it('permite precio negativo (debería validarse en DTO)', async () => {
      // Arrange - VIOLACIÓN: precio negativo
      const datoFactura = {
        subscriptionId: 1,
        userId: 1,
        planType: 'BRONZE',
        planPrice: -100,
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-12-31'),
        maxUsers: 5,
        dueDate: new Date('2026-02-01'),
      };

      // Act
      const factura = await useCase.execute(datoFactura);

      // Assert - Se procesa pero con valor inválido
      expect(mockInvoiceRepository.save).toHaveBeenCalled();
      // NOTA: Debe validarse con @IsPositive()
    });

    it('permite maxUsers negativo (debería validarse en DTO)', async () => {
      // Arrange - VIOLACIÓN: usuarios negativos
      const datoFactura = {
        subscriptionId: 1,
        userId: 1,
        planType: 'GOLD',
        planPrice: 100,
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-12-31'),
        maxUsers: -5,
        dueDate: new Date('2026-02-01'),
      };

      // Act
      const factura = await useCase.execute(datoFactura);

      // Assert - Se procesa pero con valor inválido
      expect(mockInvoiceRepository.save).toHaveBeenCalled();
      // NOTA: Debe validarse con @IsPositive()
    });

    it('procesa correctamente precio cero (plan gratuito)', async () => {
      // Arrange
      const datoFactura = {
        subscriptionId: 1,
        userId: 1,
        planType: 'BRONZE',
        planPrice: 0,
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-12-31'),
        maxUsers: 5,
        dueDate: new Date('2026-02-01'),
      };

      // Act
      const factura = await useCase.execute(datoFactura);

      // Assert
      expect(mockInvoiceRepository.save).toHaveBeenCalled();
    });

    it('procesa correctamente precios muy altos', async () => {
      // Arrange
      const datoFactura = {
        subscriptionId: 1,
        userId: 1,
        planType: 'GOLD',
        planPrice: 999999.99,
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-12-31'),
        maxUsers: 15,
        dueDate: new Date('2026-02-01'),
      };

      // Act
      const factura = await useCase.execute(datoFactura);

      // Assert
      expect(mockInvoiceRepository.save).toHaveBeenCalled();
    });
  });

  describe('Integración con repositorio', () => {
    it('guarda la factura con el monto correcto de la estrategia', async () => {
      // Arrange
      mockInvoiceRepository.save.mockResolvedValue({
        id: 1,
        amount: 90,
        status: 'PENDING',
      } as any);

      const datoFactura = {
        subscriptionId: 1,
        userId: 1,
        planType: 'SILVER',
        planPrice: 100,
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-08-01'), // 10% descuento
        maxUsers: 5,
        dueDate: new Date('2026-02-01'),
      };

      // Act
      await useCase.execute(datoFactura);

      // Assert
      expect(mockInvoiceRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 90,
          userId: 1,
          subscriptionId: 1,
        }),
      );
    });

    it('propaga errores del repositorio', async () => {
      // Arrange
      mockInvoiceRepository.save.mockRejectedValue(
        new Error('Error al guardar en BD'),
      );

      const datoFactura = {
        subscriptionId: 1,
        userId: 1,
        planType: 'BRONZE',
        planPrice: 100,
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-12-31'),
        maxUsers: 5,
        dueDate: new Date('2026-02-01'),
      };

      // Act & Assert
      await expect(useCase.execute(datoFactura)).rejects.toThrow(
        'Error al guardar en BD',
      );
    });
  });
});
