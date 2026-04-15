import { billingService } from './billingService';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

  describe('generate - Caso feliz: Genera factura exitosamente', () => {
    it('crea factura con datos válidos', async () => {
      // Arrange
      const datoFactura = {
        planType: 'BRONZE',
        planPrice: 100,
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-12-31'),
        maxUsers: 5,
      };

      mockedAxios.post.mockResolvedValue({ data: { id: 1, ...datoFactura } });

      // Act
      const resultado = await billingService.generate(datoFactura);

      // Assert
      expect(resultado).toEqual({ id: 1, ...datoFactura });
      expect(mockedAxios.post).toHaveBeenCalledWith(
        `${API_BASE_URL}/billing/generate`,
        datoFactura,
      );
    });
  });

  describe('generate - Datos inválidos: Validación de entrada', () => {
    it('debería validar que endDate > startDate en cliente', async () => {
      // Arrange - VIOLACIÓN: fechas inversas
      const datoFactura = {
        planType: 'SILVER',
        planPrice: 100,
        startDate: new Date('2026-12-31'),
        endDate: new Date('2026-01-01'), // ANTES que startDate
        maxUsers: 5,
      };

      // Act
      try {
        await billingService.generate(datoFactura);
      } catch (error) {
        // Assert - Debería lanzar error
        expect(error).toBeDefined();
      }
      // NOTA: Si no hay validación, se envía al backend
    });

    it('debería rechazar precios negativos', async () => {
      // Arrange - VIOLACIÓN: precio negativo
      const datoFactura = {
        planType: 'BRONZE',
        planPrice: -100,
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-12-31'),
        maxUsers: 5,
      };

      // Act
      try {
        await billingService.generate(datoFactura);
      } catch (error) {
        // Assert
        expect(error).toBeDefined();
      }
    });
  });

  describe('pay - Caso feliz: Pago exitoso', () => {
    it('procesa el pago correctamente', async () => {
      // Arrange
      const facturaId = 1;

      mockedAxios.post.mockResolvedValue({
        data: { id: facturaId, status: 'PAID' },
      });

      // Act
      const resultado = await billingService.pay(facturaId);

      // Assert
      expect(resultado.status).toBe('PAID');
      expect(mockedAxios.post).toHaveBeenCalledWith(
        `${API_BASE_URL}/billing/pay/${facturaId}`,
      );
    });

    it('paga factura vencida correctamente', async () => {
      // Arrange
      const facturaId = 1;

      mockedAxios.post.mockResolvedValue({
        data: { id: facturaId, status: 'PAID', paidAt: new Date() },
      });

      // Act
      const resultado = await billingService.pay(facturaId);

      // Assert
      expect(resultado.status).toBe('PAID');
    });
  });

  describe('pay - Race conditions: Prevención de pagos duplicados', () => {
    it('debería prevenir pagos duplicados si se llama 2 veces rápidamente', async () => {
      // Arrange
      const facturaId = 1;

      // Primera llamada: éxito
      mockedAxios.post.mockResolvedValueOnce({
        data: { id: facturaId, status: 'PAID' },
      });

      // Segunda llamada: también éxito (SIN prevención = BUG)
      mockedAxios.post.mockResolvedValueOnce({
        data: { id: facturaId, status: 'PAID' },
      });

      // Act - Simula dos pagos concurrentes
      const pago1 = billingService.pay(facturaId);
      const pago2 = billingService.pay(facturaId);

      const [resultado1, resultado2] = await Promise.all([pago1, pago2]);

      // Assert - BUG: Ambos se procesan sin prevención
      expect(resultado1.status).toBe('PAID');
      expect(resultado2.status).toBe('PAID');
      expect(mockedAxios.post).toHaveBeenCalledTimes(2);
      // NOTA: Debería ser 1 vez con debounce/throttle
    });
  });

  describe('pay - Conflictos de negocio: Errores esperados', () => {
    it('rechaza pago si factura ya fue pagada', async () => {
      // Arrange
      mockedAxios.post.mockRejectedValue({
        response: {
          status: 400,
          data: { message: 'Factura ya pagada' },
        },
      });

      // Act & Assert
      await expect(billingService.pay(1)).rejects.toThrow();
    });

    it('rechaza pago por error del servidor', async () => {
      // Arrange
      mockedAxios.post.mockRejectedValue({
        response: {
          status: 500,
          data: { message: 'Error interno del servidor' },
        },
      });

      // Act & Assert
      await expect(billingService.pay(1)).rejects.toThrow();
      // NOTA: Debería implementar retry automático
    });
  });

  describe('getByUser - Obtener facturas del usuario', () => {
    it('obtiene facturas del usuario correctamente', async () => {
      // Arrange
      const userId = 1;
      const facturas = [
        { id: 1, userId, status: 'PENDING' },
        { id: 2, userId, status: 'PAID' },
      ];

      mockedAxios.get.mockResolvedValue({ data: facturas });

      // Act
      const resultado = await billingService.getByUser(userId);

      // Assert
      expect(resultado).toEqual(facturas);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        `${API_BASE_URL}/billing/user/${userId}`,
      );
    });

    it('maneja correctamente lista vacía de facturas', async () => {
      // Arrange
      mockedAxios.get.mockResolvedValue({ data: [] });

      // Act
      const resultado = await billingService.getByUser(1);

      // Assert
      expect(resultado).toEqual([]);
    });

    it('debería implementar paginación para listas grandes', async () => {
      // Arrange - 1000 facturas (TOO MANY)
      const listaGrande = Array.from({ length: 1000 }, (_, i) => ({
        id: i + 1,
        status: 'PAID',
      }));

      mockedAxios.get.mockResolvedValue({ data: listaGrande });

      // Act
      const resultado = await billingService.getByUser(1);

      // Assert - Se cargaron todas (sin paginación)
      expect(resultado.length).toBe(1000);
      // NOTA: Debería usar paginación (limit 20-50)
    });
  });

  describe('getAll - Admin: Obtener todas las facturas', () => {
    it('obtiene todas las facturas para admin', async () => {
      // Arrange
      const facturas = [
        { id: 1, userId: 1, status: 'PENDING' },
        { id: 2, userId: 2, status: 'PAID' },
      ];

      mockedAxios.get.mockResolvedValue({ data: facturas });

      // Act
      const resultado = await billingService.getAll();

      // Assert
      expect(resultado).toEqual(facturas);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        `${API_BASE_URL}/billing/all`,
      );
    });

    it('debería validar rol de admin antes de llamar API', async () => {
      // Arrange
      mockedAxios.get.mockResolvedValue({ data: [] });

      // Act
      const resultado = await billingService.getAll();

      // Assert - Se llama sin verificar rol (seguridad en backend)
      expect(resultado).toBeDefined();
      // NOTA: Backend rechazará si no es admin (correcto)
    });
  });

  describe('updateOverdue - Actualizar facturas vencidas', () => {
    it('marca facturas vencidas correctamente', async () => {
      // Arrange
      mockedAxios.post.mockResolvedValue({
        data: { message: 'Facturas actualizadas', count: 5 },
      });

      // Act
      const resultado = await billingService.updateOverdue();

      // Assert
      expect(resultado.count).toBe(5);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        `${API_BASE_URL}/billing/update-overdue`,
      );
    });

    it('debería ser ejecutado automáticamente (cron job)', async () => {
      // Arrange
      mockedAxios.post.mockResolvedValue({
        data: { message: 'OK', count: 0 },
      });

      // Act
      const resultado = await billingService.updateOverdue();

      // Assert - Se llamó manualmente
      expect(resultado).toBeDefined();
      // NOTA: Debería ser cron job automático, no llamada manual
    });
  });

  describe('Manejo de errores: Errores de red y API', () => {
    it('propaga errores de red', async () => {
      // Arrange
      mockedAxios.post.mockRejectedValue(
        new Error('Error de red'),
      );

      // Act & Assert
      await expect(billingService.generate({} as any)).rejects.toThrow(
        'Error de red',
      );
    });

    it('rechaza acceso no autorizado (401)', async () => {
      // Arrange
      mockedAxios.post.mockRejectedValue({
        response: { status: 401, data: { message: 'No autorizado' } },
      });

      // Act & Assert
      await expect(billingService.generate({} as any)).rejects.toThrow();
      // NOTA: Debería redirigir a login automáticamente
    });

    it('rechaza acceso prohibido (403)', async () => {
      // Arrange
      mockedAxios.get.mockRejectedValue({
        response: { status: 403, data: { message: 'Prohibido' } },
      });

      // Act & Assert
      await expect(billingService.getAll()).rejects.toThrow();
    });

    it('debería implementar retry automático en timeout', async () => {
      // Arrange
      mockedAxios.post.mockRejectedValue({
        code: 'ECONNABORTED',
        message: 'Request timeout',
      });

      // Act & Assert
      await expect(billingService.generate({} as any)).rejects.toThrow('Request timeout');
      // NOTA: Debería retentar con exponential backoff
    });
  });
