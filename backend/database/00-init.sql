-- ============================================================================
-- SISTEMAS DE GESTIÓN DE SUSCRIPCIONES Y FACTURACIÓN - SCHEMA
-- Database: PostgreSQL 16
-- Version: 1.0.0
-- ============================================================================

-- ============================================================================
-- 1. TABLA: users
-- Almacena información de usuarios (ADMIN o CLIENT)
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'CLIENT' CHECK (role IN ('ADMIN', 'CLIENT')),
  "isActive" BOOLEAN DEFAULT TRUE,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT users_email_uniqueness UNIQUE (email)
);

-- Índices para users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_isActive ON users("isActive");

-- ============================================================================
-- 2. TABLA: plans
-- Planes de suscripción: BRONZE, SILVER, GOLD
-- Estrategia de descuentos:
--   - BRONZE: Sin descuento (0%)
--   - SILVER: 10% si duración > 6 meses
--   - GOLD: 15% base + 5% adicional si maxUsers > 10 (total 20%)
-- ============================================================================
CREATE TABLE IF NOT EXISTS plans (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('BRONZE', 'SILVER', 'GOLD')),
  price DECIMAL(10, 2) NOT NULL CHECK (price > 0),
  description TEXT NOT NULL,
  "maxUsers" INTEGER NOT NULL CHECK ("maxUsers" > 0),
  "isActive" BOOLEAN DEFAULT TRUE,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT plans_name_uniqueness UNIQUE (name),
  CONSTRAINT plans_type_uniqueness UNIQUE (type)
);

-- Índices para plans
CREATE INDEX IF NOT EXISTS idx_plans_type ON plans(type);
CREATE INDEX IF NOT EXISTS idx_plans_isActive ON plans("isActive");

-- Insertar planes predefinidos
INSERT INTO plans (name, type, price, description, "maxUsers", "isActive")
VALUES
  ('Plan Bronze', 'BRONZE', 29.99, 'Plan básico sin descuentos', 5, TRUE),
  ('Plan Silver', 'SILVER', 59.99, 'Plan estándar con descuento por duración (>6 meses)', 15, TRUE),
  ('Plan Gold', 'GOLD', 119.99, 'Plan premium con descuento por duración y volumen de usuarios', 50, TRUE)
ON CONFLICT (type) DO NOTHING;

-- ============================================================================
-- 3. TABLA: subscriptions
-- Suscripciones de usuarios a planes
-- Estados: ACTIVE, EXPIRED, CANCELLED
-- ============================================================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL,
  "planId" INTEGER NOT NULL,
  "startDate" TIMESTAMP NOT NULL,
  "endDate" TIMESTAMP NOT NULL,
  status VARCHAR(50) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'EXPIRED', 'CANCELLED')),
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT subscriptions_user_fk FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT subscriptions_plan_fk FOREIGN KEY ("planId") REFERENCES plans(id) ON DELETE CASCADE,
  CONSTRAINT subscriptions_dates_check CHECK ("endDate" > "startDate")
);

-- Índices para subscriptions
CREATE INDEX IF NOT EXISTS idx_subscriptions_userId ON subscriptions("userId");
CREATE INDEX IF NOT EXISTS idx_subscriptions_planId ON subscriptions("planId");
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_startDate ON subscriptions("startDate");
CREATE INDEX IF NOT EXISTS idx_subscriptions_endDate ON subscriptions("endDate");
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_plan ON subscriptions("userId", "planId");

-- ============================================================================
-- 4. TABLA: invoices
-- Facturas generadas a partir de suscripciones
-- Estados: PENDING (pendiente), PAID (pagada), OVERDUE (vencida sin pagar)
-- ============================================================================
CREATE TABLE IF NOT EXISTS invoices (
  id SERIAL PRIMARY KEY,
  "subscriptionId" INTEGER NOT NULL,
  "userId" INTEGER NOT NULL,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  status VARCHAR(50) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PAID', 'OVERDUE')),
  "dueDate" TIMESTAMP NOT NULL,
  "paidAt" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT invoices_subscription_fk FOREIGN KEY ("subscriptionId") REFERENCES subscriptions(id) ON DELETE CASCADE,
  CONSTRAINT invoices_user_fk FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT invoices_paid_date_check CHECK (
    ("paidAt" IS NULL AND status IN ('PENDING', 'OVERDUE'))
    OR ("paidAt" IS NOT NULL AND status = 'PAID')
  )
);

-- Índices para invoices
CREATE INDEX IF NOT EXISTS idx_invoices_subscriptionId ON invoices("subscriptionId");
CREATE INDEX IF NOT EXISTS idx_invoices_userId ON invoices("userId");
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_dueDate ON invoices("dueDate");
CREATE INDEX IF NOT EXISTS idx_invoices_createdAt ON invoices("createdAt");
CREATE INDEX IF NOT EXISTS idx_invoices_status_dueDate ON invoices(status, "dueDate");
CREATE INDEX IF NOT EXISTS idx_invoices_user_status ON invoices("userId", status);

-- ============================================================================
-- COMENTARIOS SOBRE RESTRICCIONES Y VALIDACIONES
-- ============================================================================

-- USERS:
--   - email: UNIQUE, se utiliza para login
--   - password: Almacenado con bcrypt (nunca en texto plano)
--   - role: ENUM (ADMIN | CLIENT) para control de acceso
--   - isActive: Soft delete (no elimina registro, solo marca como inactivo)

-- PLANS:
--   - name: Identificador legible (Bronze, Silver, Gold)
--   - type: ENUM (BRONZE | SILVER | GOLD) para estrategia de descuentos
--   - price: Precio mensual base en USD, validado > 0
--   - maxUsers: Límite de usuarios por suscripción, validado > 0
--   - UNIQUE (type): No puede haber 2 planes del mismo tipo

-- SUBSCRIPTIONS:
--   - startDate y endDate: Definen período de la suscripción
--   - CHECK: endDate > startDate para asegurar período válido
--   - status: ACTIVE (vigente) | EXPIRED (pasada) | CANCELLED (cancelada)
--   - ON DELETE CASCADE: Si user/plan se elimina, también la suscripción

-- INVOICES:
--   - amount: Monto mensual calculado por estrategia (base - descuento)
--   - status: Transiciones permitidas: PENDING → PAID o PENDING → OVERDUE
--   - dueDate: Fecha de vencimiento para pago
--   - paidAt: NULL si pendiente/vencida, timestamp si pagada
--   - CHECK: Valida transiciones válidas (paidAt solo si PAID)

-- ============================================================================
-- RELACIONES Y CASCADAS
-- ============================================================================
-- users (1) ──→ (many) subscriptions
-- users (1) ──→ (many) invoices
-- plans (1) ──→ (many) subscriptions
-- subscriptions (1) ──→ (many) invoices
-- 
-- Si se elimina un user: Se elimina sus subscriptions e invoices (CASCADE)
-- Si se elimina un plan: Se elimina sus subscriptions e invoices (CASCADE)
