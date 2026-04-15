import { Test, TestingModule } from '@nestjs/testing';
import { UpdateOverdueInvoicesUseCase } from './update-overdue-invoices.use-case';
import { IInvoiceRepository } from '../../domain/ports/out/IInvoiceRepository';
import { Invoice } from '../../domain/entities/Invoice';

describe('UpdateOverdueInvoicesUseCase', () => {
  let useCase: UpdateOverdueInvoicesUseCase;
  let mockInvoiceRepository: jest.Mocked<IInvoiceRepository>;

  beforeEach(async () => {
    mockInvoiceRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByUserId: jest.fn(),
      save: jest.fn(),
    } as any;

    useCase = new UpdateOverdueInvoicesUseCase(mockInvoiceRepository);
  });

  describe('execute - Caso feliz: Actualización correcta de vencidas', () => {
    it('marca factura como VENCIDA si la fecha de pago ha pasado', async () => {
      // Arrange
      const ayer = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const facturas: Invoice[] = [
        {
          id: 1,
          userId: 1,
          subscriptionId: 1,
          amount: 100,
          status: 'PENDING',
          dueDate: ayer,
          paidAt: null,
          createdAt: new Date(),
        },
      ];

      mockInvoiceRepository.findAll.mockResolvedValue(facturas);
      mockInvoiceRepository.save.mockResolvedValue({
        ...facturas[0],
        status: 'OVERDUE',
      } as any);

      // Act
      await useCase.execute();

      // Assert
      expect(mockInvoiceRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'OVERDUE' }),
      );
    });

    it('no modifica facturas ya pagadas aunque tengan fecha vencida', async () => {
      // Arrange
      const ayer = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const facturas: Invoice[] = [
        {
          id: 1,
          userId: 1,
          subscriptionId: 1,
          amount: 100,
          status: 'PAID',
          dueDate: ayer,
          paidAt: new Date(),
          createdAt: new Date(),
        },
      ];

      mockInvoiceRepository.findAll.mockResolvedValue(facturas);

      // Act
      await useCase.execute();

      // Assert
      expect(mockInvoiceRepository.save).not.toHaveBeenCalled();
    });

    it('no modifica facturas PENDING con fecha futura', async () => {
      // Arrange
      const maniana = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const facturas: Invoice[] = [
        {
          id: 1,
          userId: 1,
          subscriptionId: 1,
          amount: 100,
          status: 'PENDING',
          dueDate: maniana,
          paidAt: null,
          createdAt: new Date(),
        },
      ];

      mockInvoiceRepository.findAll.mockResolvedValue(facturas);

      // Act
      await useCase.execute();

      // Assert
      expect(mockInvoiceRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('execute - Conflictos de negocio: Transiciones de estado inválidas', () => {
    it('no actualiza facturas que ya están en estado OVERDUE', async () => {
      // Arrange
      const facturas: Invoice[] = [
        {
          id: 1,
          userId: 1,
          subscriptionId: 1,
          amount: 100,
          status: 'OVERDUE',
          dueDate: new Date('2020-01-01'),
          paidAt: null,
          createdAt: new Date(),
        },
      ];

      mockInvoiceRepository.findAll.mockResolvedValue(facturas);

      // Act
      await useCase.execute();

      // Assert
      expect(mockInvoiceRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('execute - Edge cases: Límites y valores extremos', () => {
    it('procesa correctamente mixtura de estados (PENDING sin vencer, PENDING vencida, PAID, OVERDUE)', async () => {
      // Arrange
      const ayer = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const maniana = new Date(Date.now() + 24 * 60 * 60 * 1000);

      const facturas: Invoice[] = [
        {
          id: 1,
          userId: 1,
          subscriptionId: 1,
          amount: 100,
          status: 'PENDING',
          dueDate: ayer,
          paidAt: null,
          createdAt: new Date(),
        },
        {
          id: 2,
          userId: 2,
          subscriptionId: 2,
          amount: 100,
          status: 'PENDING',
          dueDate: maniana,
          paidAt: null,
          createdAt: new Date(),
        },
        {
          id: 3,
          userId: 3,
          subscriptionId: 3,
          amount: 100,
          status: 'PAID',
          dueDate: ayer,
          paidAt: new Date(),
          createdAt: new Date(),
        },
        {
          id: 4,
          userId: 4,
          subscriptionId: 4,
          amount: 100,
          status: 'OVERDUE',
          dueDate: ayer,
          paidAt: null,
          createdAt: new Date(),
        },
      ];

      mockInvoiceRepository.findAll.mockResolvedValue(facturas);
      mockInvoiceRepository.save.mockResolvedValue({} as any);

      // Act
      await useCase.execute();

      // Assert - Solo la factura #1 debe cambiar
      expect(mockInvoiceRepository.save).toHaveBeenCalledTimes(1);
      expect(mockInvoiceRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ id: 1 }),
      );
    });

    it('maneja correctamente facturas muy antiguas (años atrás)', async () => {
      // Arrange
      const facturas: Invoice[] = [
        {
          id: 1,
          userId: 1,
          subscriptionId: 1,
          amount: 100,
          status: 'PENDING',
          dueDate: new Date('2020-01-01'),
          paidAt: null,
          createdAt: new Date('2020-01-01'),
        },
      ];

      mockInvoiceRepository.findAll.mockResolvedValue(facturas);
      mockInvoiceRepository.save.mockResolvedValue({
        ...facturas[0],
        status: 'OVERDUE',
      } as any);

      // Act
      await useCase.execute();

      // Assert
      expect(mockInvoiceRepository.save).toHaveBeenCalled();
    });

    it('procesa correctamente lista vacía de facturas', async () => {
      // Arrange
      mockInvoiceRepository.findAll.mockResolvedValue([]);

      // Act
      const resultado = await useCase.execute();

      // Assert
      expect(mockInvoiceRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('Interacción con repositorio', () => {
    it('obtiene todas las facturas del repositorio', async () => {
      // Arrange
      mockInvoiceRepository.findAll.mockResolvedValue([]);

      // Act
      await useCase.execute();

      // Assert
      expect(mockInvoiceRepository.findAll).toHaveBeenCalled();
    });

    it('propaga errores del repositorio', async () => {
      // Arrange
      mockInvoiceRepository.findAll.mockRejectedValue(
        new Error('Error de base de datos'),
      );

      // Act & Assert
      await expect(useCase.execute()).rejects.toThrow('Error de base de datos');
    });
  });
});
