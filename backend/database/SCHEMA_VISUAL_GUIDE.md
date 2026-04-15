# 📊 Diagrama de Base de Datos - Referencia Visual

**Proyecto:** SaaS - Gestión de Suscripciones y Facturación  
**Base de Datos:** PostgreSQL 16  
**Última actualización:** April 15, 2026

---

## 🏗️ Diagrama E-R (Entidad-Relación)

```
                                RELACIONES (1:N)
                                ╔═════════════════════════╗
                                ║  1 User ──→ N Invoices  ║
                                ║  1 User ──→ N Subs      ║
                                ║  1 Plan ──→ N Subs      ║
                                ║  1 Sub ──→ N Invoices   ║
                                ╚═════════════════════════╝

┌──────────────────────────────┐
│         USERS                │          Tabla de clientes
├──────────────────────────────┤
│ id (PK)          ├─ SERIAL   │          Clave primaria
│ email            ├─ UNIQUE   │          Para login único
│ password         ├─ HASH     │          bcrypt (nunca plain)
│ role             ├─ ENUM     │          ADMIN | CLIENT
│ isActive         ├─ BOOL     │          Soft delete flag
│ createdAt        ├─ TIMESTAMP│          Auto-generado
└──────────────────────────────┘
           │
           │ FK: userId
           │ (1 → N)
           │
           ▼
┌──────────────────────────────┐
│    SUBSCRIPTIONS             │          Suscripciones activas
├──────────────────────────────┤
│ id (PK)          ├─ SERIAL   │
│ userId (FK)      ├─ CASCADE  │──→ Si elimina user: delete subs
│ planId (FK)      ├─ CASCADE  │──→ Si elimina plan: delete subs
│ startDate        ├─ TIMESTAMP│          Inicio de periodo
│ endDate          ├─ TIMESTAMP│          Fin de periodo (>startDate)
│ status           ├─ ENUM     │          ACTIVE | EXPIRED | CANCELLED
│ createdAt        ├─ TIMESTAMP│
└──────────────────────────────┘
           │
           │ FK: subscriptionId
           │ (1 → N)
           │
           ▼
┌──────────────────────────────┐
│       INVOICES               │          Facturas por pagar
├──────────────────────────────┤
│ id (PK)          ├─ SERIAL   │
│ subscriptionId   ├─ FK       │──→ Vinculación a suscripción
│ userId (FK)      ├─ CASCADE  │──→ Para queries rápidas por user
│ amount           ├─ DECIMAL  │          Monto = base - descuento
│ status           ├─ ENUM     │          PENDING | PAID | OVERDUE
│ dueDate          ├─ TIMESTAMP│          Fecha de vencimiento
│ paidAt           ├─ TIMESTAMP│          NULL si no pagada
│ createdAt        ├─ TIMESTAMP│
└──────────────────────────────┘

┌──────────────────────────────┐
│         PLANS                │          Catálogo de planes
├──────────────────────────────┤
│ id (PK)          ├─ SERIAL   │          3 planes fijos
│ name             ├─ VARCHAR  │          "Plan Bronze", etc.
│ type             ├─ ENUM     │          BRONZE | SILVER | GOLD
│ price            ├─ DECIMAL  │          Precio mensual base
│ description      ├─ TEXT     │          Para UI
│ maxUsers         ├─ INTEGER  │          Límite de usuarios
│ isActive         ├─ BOOL     │          Si está en venta
│ createdAt        ├─ TIMESTAMP│
└──────────────────────────────┘
           │
           │ FK: planId
           │ (1 → N)
           │
           └──→ SUBSCRIPTIONS (arriba)
```

---

## 📋 Vista de Índices

### Índices actuales (9 en users, plans: 2, subscriptions: 6, invoices: 7)

```
USERS (3 índices)
├─ idx_users_email          → Para LOGIN (email único + rápido)
├─ idx_users_role           → Para filtrar ADMIN vs CLIENT
└─ idx_users_isActive       → Para usuarios activos

PLANS (2 índices)
├─ idx_plans_type           → Para seleccionar BRONZE/SILVER/GOLD
└─ idx_plans_isActive       → Para planes en venta

SUBSCRIPTIONS (6 índices)
├─ idx_subscriptions_userId         → Todas las suscripciones de un user
├─ idx_subscriptions_planId         → Todas las suscripciones de un plan
├─ idx_subscriptions_status         → Filtrar ACTIVE/EXPIRED/CANCELLED
├─ idx_subscriptions_startDate      → Rango de fechas de inicio
├─ idx_subscriptions_endDate        → Rango de fechas de fin
└─ idx_subscriptions_user_plan      → Busca específica (user + plan)

INVOICES (7 índices)
├─ idx_invoices_subscriptionId      → Facturas de una suscripción
├─ idx_invoices_userId              → Todas las facturas de un user
├─ idx_invoices_status              → Filtrar PENDING/PAID/OVERDUE
├─ idx_invoices_dueDate             → Buscar próximas a vencer
├─ idx_invoices_createdAt           → Histórico por fecha
├─ idx_invoices_status_dueDate      → Combo: facturas PENDING vencidas
└─ idx_invoices_user_status         → Combo: facturas del user por estado
```

---

## 🔄 Flujo de Datos - Caso Real

### Escenario: Un cliente se suscribe a Silver y paga

```
1. REGISTRO (Users table)
   ├─ Usuario: maria@example.com
   ├─ Password: bcrypt hash (nunca plain text)
   ├─ Role: CLIENT
   └─ isActive: true
   
   Result: users.id = 42

2. COMPRA PLAN (Subscriptions table)
   ├─ userId: 42 (FK → users.id)
   ├─ planId: 2 (FK → plans.id = SILVER)
   ├─ startDate: 2026-04-15
   ├─ endDate: 2026-05-15 (1 mes)
   ├─ status: ACTIVE
   
   Result: subscriptions.id = 128

3. GENERAR FACTURA (Invoices table)
   ├─ subscriptionId: 128 (FK → subscriptions.id)
   ├─ userId: 42 (FK → users.id)
   ├─ amount: 54.00 (59.99 sin descuento, <6 meses)
   ├─ status: PENDING
   ├─ dueDate: 2026-05-15
   ├─ paidAt: NULL
   
   Result: invoices.id = 5001

4. PAGO (Update INVOICE)
   ├─ UPDATE invoices SET status = 'PAID', paidAt = NOW()
   ├─ Transacción atómica: ambas columnas o ninguna
   ├─ BD valida: paidAt solo si status = PAID
   
   Result: Invoice 5001 PAID

5. VENCIMIENTO (Batch job)
   ├─ Busca: invoices WHERE dueDate < TODAY() AND status = 'PENDING'
   ├─ Usa índice: idx_invoices_status_dueDate
   ├─ UPDATE status = 'OVERDUE'
   
   Result: Facturas vencidas marcadas
```

---

## 📐 Modelos de Datos - Detalle

### USER

```typescript
{
  id: 42,
  email: "maria@example.com",
  password: "$2b$10$uXbhpCPKl3...", // bcrypt hash
  role: "CLIENT",
  isActive: true,
  createdAt: "2026-04-01T10:30:00Z"
}
```

**Validaciones:**
- ✅ email: UNIQUE (no dos cuentas mismo email)
- ✅ password: nunca en texto plano
- ✅ role: solo ADMIN o CLIENT
- ✅ isActive: para soft-delete (no elimina, solo marca)

---

### PLAN

```typescript
{
  id: 2,
  name: "Plan Silver",
  type: "SILVER",
  price: 59.99,
  description: "Plan estándar con descuento por duración (>6 meses)",
  maxUsers: 15,
  isActive: true,
  createdAt: "2026-01-01T00:00:00Z"
}
```

**Estrategia de descuentos:**
```
BRONZE:  59.99 → 59.99 * 1.00 = 59.99 (sin descuento)
SILVER:  59.99 → 59.99 * 0.90 = 53.99 (10% si duration > 6 meses)
GOLD:   119.99 → 119.99 * 0.85 = 101.99 (15% base)
         o si maxUsers > 10: 119.99 * 0.80 = 95.99 (20% total)
```

---

### SUBSCRIPTION

```typescript
{
  id: 128,
  userId: 42,           // Relacionado a users.id = 42
  planId: 2,            // Relacionado a plans.id = 2 (SILVER)
  startDate: "2026-04-15T00:00:00Z",
  endDate: "2026-05-15T00:00:00Z",
  status: "ACTIVE",
  createdAt: "2026-04-15T08:15:00Z",
  
  // Relaciones cargadas (si usas eager loading)
  user: { id: 42, email: "maria@example.com", ... },
  plan: { id: 2, name: "Plan Silver", type: "SILVER", ... }
}
```

**Estados:**
- `ACTIVE`: Período válido y en curso (startDate ≤ today ≤ endDate)
- `EXPIRED`: Período pasado (endDate < today)
- `CANCELLED`: Usuario canceló antes de fin

**Validación:**
- ✅ endDate > startDate (período válido)
- ✅ Ambas fechas: timestamp (incluye hora)

---

### INVOICE

```typescript
{
  id: 5001,
  subscriptionId: 128,      // Relacionado a subscriptions.id
  userId: 42,               // Relacionado a users.id (denormalizado para queries)
  amount: 54.00,            // Calculado: 59.99 (base) * 0.90 (descuento)
  status: "PAID",
  dueDate: "2026-05-15T23:59:59Z",
  paidAt: "2026-05-01T14:30:00Z",  // Timestamp del pago
  createdAt: "2026-04-15T08:15:00Z",
  
  // Relaciones cargadas
  subscription: { id: 128, ... },
  user: { id: 42, email: "maria@example.com", ... }
}
```

**Estados y transiciones:**
```
PENDING ←─ Inicial (factura creada, esperando pago)
   ├─ (si paga):  PENDING → PAID (paidAt = NOW())
   └─ (si vence): PENDING → OVERDUE (batch job)

PAID ←─ Usuario pagó dentro del plazo
   └─ (final, no cambia)

OVERDUE ←─ Vencida sin pagar (dueDate < today)
   └─ (puede ser PAID si paga después de vencer)
```

**Restricción CHECK:**
```sql
-- paidAt debe ser NULL si PENDING/OVERDUE
-- paidAt debe tener valor si PAID
CHECK (
  (paidAt IS NULL AND status IN ('PENDING', 'OVERDUE'))
  OR (paidAt IS NOT NULL AND status = 'PAID')
)
```

---

## 🔍 Queries Comunes y sus Optimizaciones

### 1. Login de Usuario

```sql
SELECT * FROM users WHERE email = 'maria@example.com' LIMIT 1;
-- Usa: idx_users_email (MUY RÁPIDO)
```

### 2. Listar Suscripciones de un Usuario

```sql
SELECT s.* FROM subscriptions s
WHERE s.userId = 42 AND s.status = 'ACTIVE'
ORDER BY s.endDate DESC;
-- Usa: idx_subscriptions_userId + filter status
```

### 3. Facturas Próximas a Vencer (para notificaciones)

```sql
SELECT i.* FROM invoices i
WHERE i.status = 'PENDING' 
  AND i.dueDate BETWEEN NOW() AND NOW() + INTERVAL '7 days'
ORDER BY i.dueDate ASC;
-- Usa: idx_invoices_status_dueDate (composite index)
```

### 4. Marcar Facturas como Vencidas (batch job)

```sql
UPDATE invoices
SET status = 'OVERDUE'
WHERE status = 'PENDING' AND dueDate < NOW();
-- Usa: idx_invoices_status_dueDate
```

### 5. Revenue Report (Ingresos por Plan)

```sql
SELECT p.type, COUNT(i.id) as invoice_count, SUM(i.amount) as revenue
FROM invoices i
JOIN subscriptions s ON i.subscriptionId = s.id
JOIN plans p ON s.planId = p.id
WHERE i.status = 'PAID' AND EXTRACT(YEAR FROM i.paidAt) = 2026
GROUP BY p.type
ORDER BY revenue DESC;
-- Usa: FK relationships + índices de date
```

---

## 🚨 Restricciones de Integridad

### Foreign Keys (Referencial)

```sql
-- Imposible:
INSERT INTO invoices (subscriptionId, ...)
VALUES (999, ...)  -- subscription 999 no existe
-- ❌ ERROR: "violates foreign key constraint"

-- Si eliminas subscription:
DELETE FROM subscriptions WHERE id = 128
-- ✅ Automáticamente: DELETE FROM invoices WHERE subscriptionId = 128
```

### Check Constraints (Negocio)

```sql
-- Imposible:
INSERT INTO plans (price, ...) VALUES (-50, ...)
-- ❌ ERROR: price violates CHECK (price > 0)

-- Imposible:
INSERT INTO subscriptions (startDate, endDate) 
VALUES ('2026-05-15', '2026-04-15')
-- ❌ ERROR: endDate violates CHECK (endDate > startDate)

-- Imposible:
UPDATE invoices SET status = 'PAID', paidAt = NULL WHERE id = 5001
-- ❌ ERROR: violates CHECK (paidAt NOT NULL if PAID)
```

---

## 📈 Estimaciones de Tamaño

### Tabla Users
```
Campos: id (4B) + email (50B) + password (60B) + role (1B) + isActive (1B) + createdAt (8B)
Total por fila: ~130B

Escenarios:
• Micro:    1,000 usuarios   = 130 KB
• Pequeño:  10,000 usuarios  = 1.3 MB
• Mediano:  100,000 usuarios = 13 MB
• Grande:   1,000,000 usuarios = 130 MB  ← Aún pequeño para BD
```

### Tabla Invoices (crece más)
```
Campos: id (4B) + subscriptionId (4B) + userId (4B) + amount (10B) + status (1B) 
        + dueDate (8B) + paidAt (8B) + createdAt (8B)
Total por fila: ~50B

Escenarios (12 invoices/user/año):
• 1M invoices    = 50 MB   (típico para startup de 100k usuarios × 1 año)
• 10M invoices   = 500 MB  (100k usuarios × 10 años, o enorme base)
• 100M invoices  = 5 GB    (10M usuarios con datos de 10 años)
```

**Conclusión:** PostgreSQL maneja facilmente millones de invoices.

---

## 🔐 Seguridad Por Diseño

### Integridad de Datos
- ✅ Foreign Keys garantizan consistencia
- ✅ Check Constraints previenen datos inválidos
- ✅ ACID Transactions aseguran atomicidad

### Seguridad de Acceso
- ✅ Row-Level Security (RLS) para futuro
- ✅ Enum tipos previenen inyección
- ✅ TypeORM prepared statements previnen SQL injection

### Auditoria
- ✅ createdAt automático (cuándo se creó)
- ✅ paidAt registra cuándo se pagó
- ✅ status enum rastrea cambios

---

## ✅ Checklist

- ✅ 4 tablas con relaciones correctas
- ✅ Foreign Keys con CASCADE delete
- ✅ Índices optimizados
- ✅ Check constraints de negocio
- ✅ Enum types para estados
- ✅ Timestamps automáticos
- ✅ Datos iniciales (planes)
- ✅ Queries documentadas

**Status:** Ready para go-live 🚀

---

**Referencias:**
- [DATABASE.md](./DATABASE.md) - Explicación detallada
- [MIGRATIONS_GUIDE.md](./database/MIGRATIONS_GUIDE.md) - Cómo usar migraciones
- [WHY_POSTGRESQL_AND_TYPEORM.md](./WHY_POSTGRESQL_AND_TYPEORM.md) - Decisiones técnicas
