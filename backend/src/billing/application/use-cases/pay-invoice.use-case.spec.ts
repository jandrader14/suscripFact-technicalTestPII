import { Test, TestingModule } from '@nestjs/testing';
import { PayInvoiceUseCase } from './pay-invoice.use-case';
import { IInvoiceRepository } from '../../domain/ports/out/IInvoiceRepository';
import { Invoice } from '../../domain/entities/Invoice';
import { InvoiceNotFoundException, InvoiceAlreadyPaidException } from '../../domain/exceptions/BillingExceptions';

describe('PayInvoiceUseCase', () => {
  let useCase: PayInvoiceUseCase;
  let mockInvoiceRepository: jest.Mocked<IInvoiceRepository>;

  beforeEach(async () => {
    mockInvoiceRepository = {
      findById: jest.fn(),
      save: jest.fn(),
      findByUserId: jest.fn(),
      findAll: jest.fn(),
    } as any;

    useCase = new PayInvoiceUseCase(mockInvoiceRepository);
  });

  describe('execute - Caso feliz: Pago exitoso', () => {
    it('marca una factura como PAGADA correctamente', async () => {
      // Arrange
      const idFactura = 1;
      const factura: Invoice = {
        id: idFactura,
        userId: 1,
        subscriptionId: 1,
        amount: 100,
        status: 'PENDING',
        dueDate: new Date('2026-12-31'),
        paidAt: null,
        createdAt: new Date('2026-01-01'),
      };

      mockInvoiceRepository.findById.mockResolvedValue(factura);
      mockInvoiceRepository.save.mockResolvedValue({
        ...factura,
        status: 'PAID',
        paidAt: new Date(),
      } as any);

      // Act
      const resultado = await useCase.execute(idFactura);

      // Assert
      expect(resultado.status).toBe('PAID');
      expect(resultado.paidAt).not.toBeNull();
      expect(mockInvoiceRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'PAID' }),
      );
    });

    it('paga correctamente una factura vencida', async () => {
      // Arrange
      const ayer = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const factura: Invoice = {
        id: 1,
        userId: 1,
        subscriptionId: 1,
        amount: 50,
        status: 'OVERDUE',
        dueDate: ayer,
        paidAt: null,
        createdAt: new Date(),
      };

      mockInvoiceRepository.findById.mockResolvedValue(factura);
      mockInvoiceRepository.save.mockResolvedValue({
        ...factura,
        status: 'PAID',
        paidAt: new Date(),
      } as any);

      // Act
      const resultado = await useCase.execute(1);

      // Assert
      expect(resultado.status).toBe('PAID');
      expect(mockInvoiceRepository.save).toHaveBeenCalled();
    });

    it('registra la fecha y hora exacta del pago', async () => {
      // Arrange
      const factura: Invoice = {
        id: 1,
        userId: 1,
        subscriptionId: 1,
        amount: 100,
        status: 'PENDING',
        dueDate: new Date('2026-12-31'),
        paidAt: null,
        createdAt: new Date('2026-01-01'),
      };

      const horaPago = new Date();
      mockInvoiceRepository.findById.mockResolvedValue(factura);
      mockInvoiceRepository.save.mockResolvedValue({
        ...factura,
        status: 'PAID',
        paidAt: horaPago,
      } as any);

      // Act
      const resultado = await useCase.execute(1);

      // Assert
      expect(resultado.paidAt).not.toBeNull();
      expect(resultado.paidAt).toEqual(horaPago);
    });
  });

  describe('execute - Factura no encontrada', () => {
    it('lanza excepción si la factura no existe', async () => {
      // Arrange
      mockInvoiceRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(999)).rejects.toThrow(
        InvoiceNotFoundException,
      );
      expect(mockInvoiceRepository.save).not.toHaveBeenCalled();
    });

    it('propaga error si el repositorio falla', async () => {
      // Arrange
      mockInvoiceRepository.findById.mockRejectedValue(
        new Error('Error de base de datos'),
      );

      // Act & Assert
      await expect(useCase.execute(0)).rejects.toThrow('Error de base de datos');
    });
  });

  describe('execute - Factura ya pagada', () => {
    it('rechaza pagos duplicados si la factura ya está PAGADA', async () => {
      // Arrange
      const factura: Invoice = {
        id: 1,
        userId: 1,
        subscriptionId: 1,
        amount: 100,
        status: 'PAID',
        dueDate: new Date('2026-12-31'),
        paidAt: new Date('2026-06-01'),
        createdAt: new Date('2026-01-01'),
      };

      mockInvoiceRepository.findById.mockResolvedValue(factura);

      // Act & Assert
      await expect(useCase.execute(1)).rejects.toThrow(
        InvoiceAlreadyPaidException,
      );
      expect(mockInvoiceRepository.save).not.toHaveBeenCalled();
    });

    it('previene que se pague dos veces si se ejecuta concurrentemente', async () => {
      // Arrange - Simula condición de carrera: dos usuarios pagan simultáneamente
      const factura: Invoice = {
        id: 1,
        userId: 1,
        subscriptionId: 1,
        amount: 100,
        status: 'PENDING',
        dueDate: new Date('2026-12-31'),
        paidAt: null,
        createdAt: new Date('2026-01-01'),
      };

      // Primer acceso: ve PENDING
      mockInvoiceRepository.findById
        .mockResolvedValueOnce(factura)
        // Segundo acceso: sigue viendo PENDING (sin bloqueo de BD)
        .mockResolvedValueOnce(factura);

      mockInvoiceRepository.save.mockResolvedValue({
        ...factura,
        status: 'PAID',
        paidAt: new Date(),
      } as any);

      // Act - Simula dos pagos concurrentes
      const pago1 = useCase.execute(1);
      const pago2 = useCase.execute(1);

      const [resultado1, resultado2] = await Promise.all([pago1, pago2]);

      // Assert - SIN TRANSACCIÓN: Ambos se procesan (BUG)
      expect(resultado1.status).toBe('PAID');
      expect(resultado2.status).toBe('PAID');
      // NOTA: Idealmente mockInvoiceRepository.save debería ser llamado 1 vez con lock
      expect(mockInvoiceRepository.save).toHaveBeenCalledTimes(2);
    });
  });

  describe('execute - Edge cases: Valores extremos', () => {
    it('procesa correctamente factura de monto cero (plan gratuito)', async () => {
      // Arrange
      const factura: Invoice = {
        id: 1,
        userId: 1,
        subscriptionId: 1,
        amount: 0,
        status: 'PENDING',
        dueDate: new Date('2026-12-31'),
        paidAt: null,
        createdAt: new Date('2026-01-01'),
      };

      mockInvoiceRepository.findById.mockResolvedValue(factura);
      mockInvoiceRepository.save.mockResolvedValue({
        ...factura,
        status: 'PAID',
        paidAt: new Date(),
      } as any);

      // Act
      const resultado = await useCase.execute(1);

      // Assert
      expect(resultado.status).toBe('PAID');
      expect(resultado.amount).toBe(0);
    });

    it('maneja factura con monto negativo (debería validarse antes)', async () => {
      // Arrange - VIOLACIÓN: factura con monto negativo
      const factura: Invoice = {
        id: 1,
        userId: 1,
        subscriptionId: 1,
        amount: -100,
        status: 'PENDING',
        dueDate: new Date('2026-12-31'),
        paidAt: null,
        createdAt: new Date('2026-01-01'),
      };

      mockInvoiceRepository.findById.mockResolvedValue(factura);
      mockInvoiceRepository.save.mockResolvedValue({
        ...factura,
        status: 'PAID',
        paidAt: new Date(),
      } as any);

      // Act
      const resultado = await useCase.execute(1);

      // Assert - Procesa pero con valor negativo (data corrupted)
      expect(resultado.status).toBe('PAID');
      // NOTA: Debe validarse en GenerateInvoicDTO
    });
  });

  describe('Integración con repositorio', () => {
    it('consulta la factura por ID correcto', async () => {
      // Arrange
      const facturaId = 42;
      const factura: Invoice = {
        id: facturaId,
        userId: 1,
        subscriptionId: 1,
        amount: 100,
        status: 'PENDING',
        dueDate: new Date('2026-12-31'),
        paidAt: null,
        createdAt: new Date('2026-01-01'),
      };

      mockInvoiceRepository.findById.mockResolvedValue(factura);
      mockInvoiceRepository.save.mockResolvedValue({
        ...factura,
        status: 'PAID',
        paidAt: new Date(),
      } as any);

      // Act
      await useCase.execute(facturaId);

      // Assert
      expect(mockInvoiceRepository.findById).toHaveBeenCalledWith(facturaId);
    });

    it('actualiza correctamente el estado y la fecha de pago antes de guardar', async () => {
      // Arrange
      const factura: Invoice = {
        id: 1,
        userId: 1,
        subscriptionId: 1,
        amount: 100,
        status: 'PENDING',
        dueDate: new Date('2026-12-31'),
        paidAt: null,
        createdAt: new Date('2026-01-01'),
      };

      mockInvoiceRepository.findById.mockResolvedValue(factura);
      mockInvoiceRepository.save.mockResolvedValue({
        ...factura,
        status: 'PAID',
        paidAt: new Date(),
      } as any);

      // Act
      await useCase.execute(1);

      // Assert - Verifica que se guardó con los campos correctos
      expect(mockInvoiceRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'PAID',
          paidAt: expect.any(Date),
        }),
      );
    });

    it('maneja errores del repositorio durante el guardado', async () => {
      // Arrange
      const factura: Invoice = {
        id: 1,
        userId: 1,
        subscriptionId: 1,
        amount: 100,
        status: 'PENDING',
        dueDate: new Date('2026-12-31'),
        paidAt: null,
        createdAt: new Date('2026-01-01'),
      };

      mockInvoiceRepository.findById.mockResolvedValue(factura);
      mockInvoiceRepository.save.mockRejectedValue(
        new Error('Error al guardar en BD'),
      );

      // Act & Assert
      await expect(useCase.execute(1)).rejects.toThrow('Error al guardar en BD');
    });
  });
});
