# Base de Datos - Migraciones y Documentación

**Proyecto:** SaaS - Gestión de Suscripciones y Facturación  
**Base de Datos:** PostgreSQL 16  
**ORM:** TypeORM 0.3.28  
**Última actualización:** April 15, 2026  

---

## 📋 Tabla de Contenidos

1. [¿Por qué PostgreSQL?](#por-qué-postgresql)
2. [¿Por qué TypeORM?](#por-qué-typeorm)
3. [Estructura de la Base de Datos](#estructura-de-la-base-de-datos)
4. [Migraciones](#migraciones)
5. [Cómo usar las Migraciones](#cómo-usar-las-migraciones)
6. [Modelos de Datos](#modelos-de-datos)
7. [Relaciones y Restricciones](#relaciones-y-restricciones)
8. [Índices y Optimización](#índices-y-optimización)

---

## 🐘 ¿Por qué PostgreSQL?

### 1. **Soporte Completo de ACID Transactions**
```
PostgreSQL garantiza:
✅ Atomicity:    Operación completa o nada
✅ Consistency:  Integridad referencial siempre
✅ Isolation:    Transacciones concurrentes sin conflictos
✅ Durability:   Una vez commit, persiste aunque falle el servidor
```

**Aplicación en nuestro proyecto:**
- Cuando pagan una factura: Actualizar invoice.status = 'PAID' + guardar invoice.paidAt
- Si falla una operación: Rollback automático (no cobrar dos veces)
- Rate: Todas mis operaciones billing son transaccionales

### 2. **Integridad Referencial con Foreign Keys (FK)**
```sql
-- subscription siempre vinculada a un user real
FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE

-- No permite crear subscription para user que no existe
INSERT INTO subscriptions (userId, planId, ...) 
-- ❌ ERROR si userId no existe en users
```

**Aplicación:**
- No hay orfandad de datos (subscription sin user)
- Si eliminas user: Automáticamente se eliminan sus subscriptions e invoices
- Integridad garantizada a nivel BD (no depende de código)

### 3. **Enums Tipados**
```sql
-- PostgreSQL soporta ENUM como tipo nativo
role VARCHAR CHECK (role IN ('ADMIN', 'CLIENT'))  ❌ Débil
role ENUM ('ADMIN', 'CLIENT')                     ✅ Fuerte

-- PostgreSQL rechaza inserciones inválidas a nivel BD
INSERT INTO users (role) VALUES ('SUPERADMIN')  ❌ ERROR
```

**Aplicación:**
- `UserRole`: ADMIN | CLIENT
- `PlanType`: BRONZE | SILVER | GOLD
- `SubscriptionStatus`: ACTIVE | EXPIRED | CANCELLED
- `InvoiceStatus`: PENDING | PAID | OVERDUE
- Imposible tener estado inválido en la BD

### 4. **JSON Native (Future-Proof)**
```sql
-- Si necesitamos extender con datos complejos
metadata JSONB,
billing_history JSONB
```

**Aplicación:**
- Auditoría de pagos (historia de cambios de status)
- Extensión futura sin alterar schema
- Almacenar logs de operaciones en la BD

### 5. **Full-Text Search Ready**
```sql
-- Para futuro: buscar facturas por descripción, usuario, etc.
CREATE INDEX idx_invoices_description_ft ON invoices 
  USING GIN(to_tsvector('spanish', description))
```

### 6. **Escalabilidad**
- ✅ Réplicas (master-slave replication)
- ✅ Sharding horizontal
- ✅ Particionamiento de tablas grandes
- ✅ Connection pooling (PgBouncer)

### 7. **Seguridad**
- ✅ Row-level security (RLS)
- ✅ Column-level encryption
- ✅ Audit logging built-in
- ✅ SSL/TLS connections

---

## 🔧 ¿Por qué TypeORM?

### 1. **TypeScript First + Type Safety**
```typescript
// CON TypeORM
const user = await userRepository.findOne({
  where: { id: 1 },
  relations: ['subscriptions'],
});
// ✅ TypeScript sabe que user.subscriptions es Subscription[]
// ✅ IDE autocomplete funciona
// ✅ Errores de tipo en tiempo de compilación

// SIN TypeORM (raw queries)
const user = await pool.query('SELECT * FROM users WHERE id = $1', [1]);
// ❌ user es any
// ❌ No hay autocomplete
// ❌ Errores en runtime
```

### 2. **Active Record + Query Builder Patterns**
```typescript
// Active Record (para queries simples)
const invoices = await Invoice.find({
  where: { status: 'PENDING', userId: 5 },
  relations: ['subscription', 'user'],
});

// Query Builder (para queries complejas)
const invoices = await invoiceRepository
  .createQueryBuilder('invoice')
  .leftJoinAndSelect('invoice.subscription', 'subscription')
  .leftJoinAndSelect('invoice.user', 'user')
  .where('invoice.status = :status', { status: 'PENDING' })
  .andWhere('invoice.dueDate <= :now', { now: new Date() })
  .orderBy('invoice.dueDate', 'ASC')
  .getMany();
```

### 3. **Migraciones Versionadas**
```typescript
// Cada migración es un archivo con version (timestamp)
1681000000000-CreateUsersTable.ts
1681000000001-CreatePlansTable.ts
1681000000002-CreateSubscriptionsTable.ts
1681000000003-CreateInvoicesTable.ts

// Rastrearabilidad:
// - Quién hizo qué cambio
// - Cuándo se hizo
// - Qué se puede deshacer (rollback)
```

### 4. **Relaciones Automáticas**
```typescript
// Define en la entidad
@OneToMany(() => Subscription, sub => sub.user)
subscriptions: Subscription[];

// TypeORM automáticamente:
// ✅ Genera joins en queries
// ✅ Carga relaciones con eager:true si necesario
// ✅ Valida integridad referencial
// ✅ Maneja cascade deletes
```

### 5. **Sincronización Automática (Development)**
```typescript
// En app.module.ts
synchronize: true  // Automáticamente altera BD según entities

// ≠ Migraciones (production):
// Las migraciones son archivo de cambios versionados y reversibles
// synchronize es solo para desarrollo rápido
```

### 6. **Inyección de Dependencias en NestJS**
```typescript
// En NestJS, TypeORM se integra perfectamente
@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(UserOrmEntity)
    private repo: Repository<UserOrmEntity>,
  ) {}
}

// ✅ Testing fácil (mock repositories)
// ✅ Inyección automática
// ✅ Lifecycle management
```

### 7. **Múltiples Bases de Datos**
```typescript
// Si necesitas PostgreSQL + MongoDB + Redis simultáneamente
TypeOrmModule.forFeature([UserEntity], 'postgres'),
TypeOrmModule.forFeature([LogEntity], 'mongodb'),
```

---

## 📊 Estructura de la Base de Datos

```
┌─────────────────────────────────────────────────────────────┐
│                    DIAGRAMA E-R                              │
└─────────────────────────────────────────────────────────────┘

  ┌──────────────┐
  │    USERS     │
  ├──────────────┤
  │ id (PK)      │◄────────┐
  │ email        │         │
  │ password     │         │
  │ role         │         │ 1:N
  │ isActive     │         │
  │ createdAt    │         │
  └──────────────┘         │
         ▲                  │
         │ 1:N              │
         │                  │
         │ ┌─────────────────────────────┐
         │ │   SUBSCRIPTIONS             │
         │ ├─────────────────────────────┤
         │ │ id (PK)                     │
         └─├─userId (FK → users)         │
           │ planId (FK → plans)         │
           │ startDate                   │
           │ endDate                     │
           │ status                      │
           │ createdAt                   │
           └────────────┬────────────────┘
                        │
                        │ 1:N
                        │
         ┌──────────────────────────────┐
         │     INVOICES                 │
         ├──────────────────────────────┤
         │ id (PK)                      │
         │ subscriptionId (FK)          │
         │ userId (FK)                  │
         │ amount                       │
         │ status                       │
         │ dueDate                      │
         │ paidAt                       │
         │ createdAt                    │
         └──────────────────────────────┘

  ┌──────────────┐
  │    PLANS     │
  ├──────────────┤
  │ id (PK)      │◄────────┐
  │ name         │         │
  │ type         │         │ 1:N
  │ price        │         │
  │ description  │         │
  │ maxUsers     │         │
  │ isActive     │         │
  │ createdAt    │         │
  └──────────────┘         │
         │                  │
         └──────────────────┘
              (FK en subscriptions)
```

### Textura de Datos

```
Users: 1k - 100k registros (clientes activos)
Plans: 3 registros (BRONZE, SILVER, GOLD) - estático
Subscriptions: 10k - 1M registros (una por user) - crece con usuarios
Invoices: 100k - 10M registros (12+ por subscription/año) - crece muchísimo
```

---

## 🚀 Migraciones

### ¿Qué es una Migración?

Una **migración** es un archivo de código que describe cambios en el schema de la BD de forma **versionada y reversible**.

```typescript
export class CreateUsersTable1681000000000 implements MigrationInterface {
  // ✅ UP: Aplicar cambio (crear tabla)
  async up(queryRunner) {
    await queryRunner.createTable(...)
  }

  // ✅ DOWN: Deshacer cambio (eliminar tabla)
  async down(queryRunner) {
    await queryRunner.dropTable(...)
  }
}
```

### Migraciones en nuestro proyecto

| # | Archivo | Cambio | Orden |
|---|---------|--------|-------|
| 1 | `1681000000000-CreateUsersTable.ts` | Tabla `users` | 1º (sin dependencias) |
| 2 | `1681000000001-CreatePlansTable.ts` | Tabla `plans` | 2º (sin dependencias) |
| 3 | `1681000000002-CreateSubscriptionsTable.ts` | Tabla `subscriptions` | 3º (depende de users, plans) |
| 4 | `1681000000003-CreateInvoicesTable.ts` | Tabla `invoices` | 4º (depende de subscriptions, users) |

**Order crítico:**
```
users, plans ──→ subscriptions ──→ invoices
   (sin FK)        (con FK a users, plans)    (con FK a users, subscriptions)
```

---

## 📖 Cómo usar las Migraciones

### 1. **Setup Inicial (Primera vez)**

```bash
# Instalar dependencias
npm install

# Crear BD desde Docker
docker-compose up -d

# Aplicar todas las migraciones
npm run migration:run
```

### 2. **Crear Nueva Migración**

```bash
# TypeORM genera automáticamente según cambios en entities
npm run migration:generate -- src/database/migrations/NombreCambio

# O crear manualmente
npm run migration:create -- src/database/migrations/1681000000004-AddCreatedAtToPlans
```

### 3. **Ver Estado de Migraciones**

```bash
# Listar migraciones ejecutadas
npm run migration:show

# Output esperado:
# ✅ CreateUsersTable1681000000000
# ✅ CreatePlansTable1681000000001
# ✅ CreateSubscriptionsTable1681000000002
# ✅ CreateInvoicesTable1681000000003
```

### 4. **Revertir Última Migración**

```bash
# Deshace la última migración ejecutada
npm run migration:revert

# Vuelve a aplicar
npm run migration:run
```

### 5. **Revertir Todo y Empezar Desde Cero**

```bash
# ⚠️ PELIGROSO en producción
npm run migration:revert -- --connection=default --step=4

# O simplemente drop + recrear con compose
docker-compose down -v  # Elimina volúmenes
docker-compose up -d     # Crea BD vacía
npm run migration:run    # Aplica todas las migraciones
```

---

## Scripts a Agregar a package.json

```json
{
  "scripts": {
    "migration:generate": "typeorm migration:generate",
    "migration:create": "typeorm migration:create",
    "migration:run": "typeorm migration:run",
    "migration:revert": "typeorm migration:revert",
    "migration:show": "typeorm migration:show",
    "db:drop": "typeorm schema:drop",
    "db:reset": "npm run db:drop && npm run migration:run"
  }
}
```

Para agregar estos scripts, ejecuta:
```bash
npm install typeorm --save
```

---

## 📐 Modelos de Datos

### 1. USER
```typescript
interface User {
  id: number;                    // PK, auto-increment
  email: string;                 // UNIQUE para login
  password: string;              // bcrypt hash (nunca plain text)
  role: 'ADMIN' | 'CLIENT';     // ENUM
  isActive: boolean;             // Soft delete flag
  createdAt: Date;               // Timestamp auto
}
```

**Casos de uso:**
- Login/Register
- Listar suscripciones del usuario
- Ver sus facturas
- Admin: ver todos los usuarios

---

### 2. PLAN
```typescript
interface Plan {
  id: number;                    // PK
  name: string;                  // "Plan Bronze", "Plan Silver", etc.
  type: 'BRONZE' | 'SILVER' | 'GOLD';  // ENUM
  price: Decimal;                // Precio mensual base (29.99, 59.99, 119.99)
  description: string;           // Descripción para UI
  maxUsers: number;              // Límite de usuarios suscripción
  isActive: boolean;             // Si está disponible para compra
  createdAt: Date;
}
```

**Descuentos por Plan (Strategy Pattern):**
```
BRONZE:  0% descuento (precio = base)
SILVER:  10% si duration > 6 meses
GOLD:    15% base + 5% adicional si maxUsers > 10 (total 20%)
```

**Datos iniciales:**
```sql
INSERT INTO plans VALUES
  (1, 'Plan Bronze', 'BRONZE', 29.99, '...', 5, true),
  (2, 'Plan Silver', 'SILVER', 59.99, '...', 15, true),
  (3, 'Plan Gold', 'GOLD', 119.99, '...', 50, true)
```

---

### 3. SUBSCRIPTION
```typescript
interface Subscription {
  id: number;
  userId: number;                 // FK → User
  planId: number;                 // FK → Plan
  startDate: Date;               // Inicio de suscripción
  endDate: Date;                 // Fin de suscripción
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
  createdAt: Date;
}
```

**Validaciones:**
- `endDate > startDate` (período válido)
- `startDate <= today` (no puedes suscribirse al futuro)
- Si `status = EXPIRED`: `endDate < today`

**Relaciones:**
- N subscriptions ← → 1 user
- N subscriptions ← → 1 plan

---

### 4. INVOICE
```typescript
interface Invoice {
  id: number;
  subscriptionId: number;         // FK → Subscription
  userId: number;                 // FK → User
  amount: Decimal;               // Monto calculado por estrategia
  status: 'PENDING' | 'PAID' | 'OVERDUE';
  dueDate: Date;                 // Fecha de vencimiento
  paidAt: Date | null;           // NULL si no pagada, timestamp si PAID
  createdAt: Date;               // Fecha de generación de factura
}
```

**Transiciones de Estado:**
```
PENDING ──(pagar)──→ PAID                    (dueDate <= today)
PENDING ──(vencer)──→ OVERDUE                (quando dueDate < today)
   ↓
 (no puede ser OVERDUE si ya está PAID)
```

**Ejemplo de flujo:**
```
Hoy: April 15
↓
1. Generar Invoice: dueDate = May 15, status = PENDING
   (factura se envía, espera pago)

2. May 1: Usuario paga
   status = PAID, paidAt = May 1 ✅

3. May 16: Si no pagó aún
   status = OVERDUE (triggereado por update-overdue-invoices)
```

---

## 🔗 Relaciones y Restricciones

### Foreign Keys (Integridad Referencial)

| Tabla | Columna | Referencia | Acción |
|-------|---------|-----------|--------|
| subscriptions | userId | users.id | CASCADE |
| subscriptions | planId | plans.id | CASCADE |
| invoices | subscriptionId | subscriptions.id | CASCADE |
| invoices | userId | users.id | CASCADE |

**Qué significa CASCADE:**
```sql
-- Si DELETE users WHERE id = 5:
-- 1. Automáticamente DELETE subscriptions WHERE userId = 5
-- 2. Automáticamente DELETE invoices WHERE userId = 5

-- Sin CASCADE, daría ERROR:
-- ❌ "Cannot delete user 5, invoices depend on it"
```

### Check Constraints

```sql
-- PLANS.price > 0 (no negativos)
CHECK (price > 0)

-- SUBSCRIPTIONS.endDate > startDate
CHECK ("endDate" > "startDate")

-- INVOICES.amount > 0
CHECK (amount > 0)

-- INVOICES.paidAt consistency
CHECK (
  ("paidAt" IS NULL AND status IN ('PENDING', 'OVERDUE'))
  OR ("paidAt" IS NOT NULL AND status = 'PAID')
)
```

---

## ⚡ Índices y Optimización

### Índices Creados

#### Users
```sql
idx_users_email       -- Búsqueda rápida por email (login)
idx_users_role        -- Filtro por rol (ADMIN/CLIENT)
idx_users_isActive    -- Filtro de usuarios activos
```

#### Subscriptions
```sql
idx_subscriptions_userId        -- Todas las suscripciones de un user
idx_subscriptions_planId        -- Todas suscripciones de un plan
idx_subscriptions_status        -- Filtro por estado (ACTIVE, EXPIRED)
idx_subscriptions_startDate     -- Rango de fechas de inicio
idx_subscriptions_endDate       -- Rango de fechas de fin
idx_subscriptions_user_plan     -- Suscripción específica del user
```

#### Invoices
```sql
idx_invoices_subscriptionId         -- Todas las facturas de una suscripción
idx_invoices_userId                 -- Todas las facturas de un usuario
idx_invoices_status                 -- Filtro por PENDING/PAID/OVERDUE
idx_invoices_dueDate                -- Búsqueda de próximas a vencer
idx_invoices_createdAt              -- Histórico por fecha
idx_invoices_status_dueDate         -- Combo: "PENDING de vencer hoy"
idx_invoices_user_status            -- Combo: facturas PENDING del user 5
```

### Queries Optimizados

```sql
-- Obtener facturas vencidas de un usuario
SELECT * FROM invoices
WHERE userId = $1 AND status = 'PENDING' AND dueDate < NOW()
-- ✅ Usa: idx_invoices_user_status + idx_invoices_dueDate

-- Obtener próximas a vencer en 7 días
SELECT * FROM invoices
WHERE status = 'PENDING' AND dueDate BETWEEN NOW() AND NOW() + INTERVAL '7 days'
ORDER BY dueDate ASC
-- ✅ Usa: idx_invoices_status_dueDate

-- Listar todas las suscripciones activas de un usuario
SELECT s.* FROM subscriptions s
WHERE s.userId = $1 AND s.status = 'ACTIVE'
-- ✅ Usa: idx_subscriptions_user_plan + idx_subscriptions_status
```

---

## 🔐 Seguridad en la BD

### 1. **Prepared Statements (TypeORM lo hace automáticamente)**
```typescript
// ✅ SEGURO (TypeORM)
await userRepository.find({ where: { email } });

// ❌ INSEGURO (SQL injection)
const query = `SELECT * FROM users WHERE email = '${email}'`
```

### 2. **Password Hashing**
```typescript
// En app.module.ts o bootstrap:
password = bcrypt.hash(password, 10)  // Hash con 10 rounds
// Nunca almacenar password en texto plano
```

### 3. **JWT Tokens en Memoria**
```typescript
// Login:
const token = jwt.sign({ id, email, role }, JWT_SECRET)
// No almacenar password en cliente
```

### 4. **Role-Based Access Control (RBAC)**
```typescript
// Guards en NestJS
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
getAllUsers() { ... }
```

---

## 📞 FAQ

**P: ¿Por qué synchronize:true en desarrollo pero migraciones en producción?**
```
R:
- synchronize:true es rápido para desarrollo (altera BD automáticamente)
- Las migraciones son auditables, reversibles y controladas por git
- En producción NUNCA usar synchronize (puede romper datos)
```

**P: ¿Puedo cambiar la BD después de migrada?**
```
R: SÍ, pero crea una NUEVA migración:

1. Modifica la entity (User.ts)
2. npm run migration:generate (crea migración automática)
3. npm run migration:run (aplica cambio)
4. Commit a git
```

**P: ¿Qué pasa si ejecuto migration:revert en producción?**
```
R: DESASTRE:
- down() se ejecuta: DROP TABLE invoices, DROP TABLE subscriptions, etc.
- TODOS los datos se pierden
- Usa SOLO en desarrollo
```

**P: ¿Cómo backupear antes de una migración?**
```bash
# Backup:
pg_dump -h localhost -U postgres subscrip-fact > backup.sql

# Restore:
psql -h localhost -U postgres < backup.sql
```

---

## ✅ Checklist Implementación

- ✅ PostgreSQL 16 en Docker
- ✅ TypeORM 0.3.28 en NestJS
- ✅ 4 ORM Entities (User, Plan, Subscription, Invoice)
- ✅ 4 Migraciones versionadas
- ✅ Foreign Keys con CASCADE
- ✅ Índices optimizados
- ✅ Check Constraints
- ✅ Datos iniciales de planes
- ⏳ Scripts agregados a package.json

---

**Próximo paso:** Agregar los scripts de migración a package.json y ejecutar `npm run migration:run` 🚀
