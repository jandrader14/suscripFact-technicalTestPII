# Arquitectura del Proyecto — Subscription Manager

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Backend runtime | Node.js v23 + TypeScript estricto |
| Backend framework | NestJS |
| ORM | TypeORM |
| Base de datos | PostgreSQL 16 (Docker) |
| Autenticación | JWT (RS256) con roles ADMIN / CLIENT |
| Validación | class-validator + class-transformer |
| Frontend framework | React 18 + TypeScript |
| Build | Vite |
| Estilos | Tailwind CSS v3 con design tokens personalizados |
| Routing | React Router DOM v6 |
| HTTP client | Axios |
| State management | Zustand |
| Gráficas | Recharts |
| Tests frontend | Vitest + React Testing Library |
| Tests backend | Jest |

---

## Backend — Arquitectura Hexagonal Modular

### Principio fundamental

El backend sigue la **arquitectura hexagonal (Ports & Adapters)**, también conocida como arquitectura de capas limpias. La regla de dependencias es estricta y unidireccional:

```
interfaces/ → application/ → domain/ ← infrastructure/
```

El dominio no conoce ni importa nada de NestJS, TypeORM ni ninguna librería externa.

### Capas por módulo

Cada módulo de negocio (`auth`, `plans`, `subscriptions`, `billing`) tiene esta estructura interna:

```
módulo/
├── domain/
│   ├── entities/        ← Entidades de dominio (TypeScript puro, sin decoradores)
│   ├── ports/
│   │   ├── in/          ← Interfaces de casos de uso (lo que la app ofrece)
│   │   └── out/         ← Interfaces de repositorios (lo que la app necesita)
│   └── exceptions/      ← Excepciones de negocio tipadas
├── application/
│   └── use-cases/       ← Un archivo por operación, cada uno con execute()
├── infrastructure/
│   └── persistence/     ← Entidades TypeORM + implementaciones de repositorios
└── interfaces/
    └── http/
        ├── dto/         ← Validación de entrada con class-validator
        ├── guards/      ← JwtAuthGuard, RolesGuard
        └── controller   ← Solo delega al use case, sin lógica de negocio
```

### Reglas de importación por capa

| Capa | Puede importar de | Nunca importa de |
|------|-------------------|-----------------|
| `domain/` | TypeScript nativo solamente | NestJS, TypeORM, cualquier librería |
| `application/` | `domain/` | `infrastructure/`, `interfaces/` |
| `infrastructure/` | `domain/`, TypeORM, librerías externas | `interfaces/` |
| `interfaces/` | `application/`, `common/`, DTOs | `infrastructure/` directamente |

### Módulos del backend

#### `auth/`
Gestiona registro, login y tokens JWT.

- **Entidad de dominio**: `User` con propiedades `readonly`, sin decoradores ORM
- **Puertos de entrada**: `IRegisterUseCase`, `ILoginUseCase` (interfaces separadas — ISP)
- **Puerto de salida**: `IUserRepository` (clase abstracta para DI en NestJS)
- **Casos de uso**: `RegisterUseCase` (hash bcrypt, verifica email único), `LoginUseCase` (verifica credenciales, emite JWT)
- **Infraestructura**: `UserOrmEntity` con decoradores TypeORM, `UserTypeOrmRepository` implementa `IUserRepository`
- **Guard**: `JwtAuthGuard` valida el token; `RolesGuard` verifica el rol del usuario

#### `plans/`
CRUD de planes de suscripción (Bronze, Silver, Gold).

- **Entidad de dominio**: `Plan` con método `toPublic()` para serializar la respuesta
- **Puertos de entrada**: interfaces individuales por operación (`ICreatePlanUseCase`, `IGetAllPlansUseCase`, etc.)
- **Endpoints**: `GET /plans`, `GET /plans/:id` públicos; `POST`, `PUT`, `PATCH`, `DELETE` protegidos con rol ADMIN

#### `subscriptions/`
Gestiona la suscripción de un usuario a un plan.

- **Entidad de dominio**: `Subscription` con estados `ACTIVE`, `EXPIRED`, `CANCELLED`
- **Casos de uso**: crear suscripción (valida que no haya una activa), obtener suscripción del usuario, verificar estado
- **Regla de negocio**: un usuario solo puede tener una suscripción activa a la vez

#### `billing/`
Genera y paga facturas asociadas a suscripciones.

- **Entidad de dominio**: `Invoice` con estados `PENDING`, `PAID`, `OVERDUE`
- **Casos de uso**: `GenerateInvoiceUseCase`, `PayInvoiceUseCase`, `GetUserInvoicesUseCase`, `UpdateOverdueUseCase`
- **Strategy Pattern aplicado aquí** (ver sección de patrones más abajo)

#### `common/`
Utilidades transversales compartidas por todos los módulos:

- `GlobalExceptionFilter` — captura excepciones de dominio y devuelve JSON estandarizado
- `LoggingInterceptor` — registra entradas y salidas de las peticiones
- `@Roles()` decorator — define qué roles puede acceder al endpoint
- `@CurrentUser()` decorator — extrae el usuario del JWT del request

---

## Frontend — Atomic Design + Hooks Architecture

### Estructura de componentes (Atomic Design)

```
src/components/
├── atoms/        ← Unidades indivisibles: Button, Input, Label, Badge, Spinner
├── molecules/    ← Combinaciones de átomos: FormField, StatCard, InvoiceRow, PlanCard
├── organisms/    ← Secciones completas: AuthForm, MetricsDashboard, InvoiceTable, PlansTable
└── templates/    ← Layouts sin datos: AppLayout (sidebar + Outlet)
```

**Regla de composición:**
- Los átomos no dependen de otros componentes del proyecto
- Las moléculas combinan átomos, no tienen lógica de negocio
- Los organismos pueden orquestar moléculas y átomos
- Los templates definen la estructura de pantalla, sin lógica
- Las páginas conectan todo con datos reales a través de hooks y services

### Páginas

```
src/pages/
├── LoginPage/         ← Login + registro en un mismo componente con modo toggle
├── DashboardPage/     ← Métricas del usuario (facturas, estado de suscripción)
├── InvoicesPage/      ← Listado de facturas con acción de pago
├── PlansPage/         ← Listado de planes; vista de admin con edición inline
└── SubscriptionsPage/ ← Detalle de la suscripción activa
```

### State management — Zustand + Hooks

El estado global se gestiona en dos stores de Zustand:

```
src/store/
├── auth.store.ts         ← user, token, isAuthenticated, login(), logout()
└── subscription.store.ts ← subscription, isActive, loadStatus()
```

Los componentes **nunca acceden a Zustand directamente**. Existe una capa de hooks intermediaria que encapsula el store (Dependency Inversion):

```
src/hooks/
├── useAuth.ts          ← wraps auth.store, expone user, isAdmin, login, logout
└── useSubscription.ts  ← wraps subscription.store, expone subscription, isActive, loadStatus
```

### Servicios HTTP

```
src/services/
├── authService.ts          ← POST /auth/register, POST /auth/login
├── billingService.ts       ← GET /billing/user/:id, POST /billing/generate, PATCH /billing/:id/pay
├── plansService.ts         ← GET /plans, PUT /plans/:id
└── subscriptionsService.ts ← POST /subscriptions, GET /subscriptions/user/:id
```

Axios está configurado con un interceptor que adjunta el token JWT en cada petición autenticada.

### Guards de routing

```
src/guards/
├── PrivateRoute.tsx  ← Redirige a /login si no está autenticado
└── RoleRoute.tsx     ← Redirige a /dashboard si el rol no está permitido
```

Estructura de rutas en `App.tsx`:

```
/login                   → LoginPage (pública)
/ → PrivateRoute
    → AppLayout (template)
        /dashboard       → DashboardPage
        /invoices        → InvoicesPage
        /plans           → PlansPage
        /subscriptions   → SubscriptionsPage
```

---

## Patrones de diseño implementados

### 1. Strategy Pattern — Cálculo de facturas

**Dónde**: `backend/src/billing/domain/strategies/`

**Propósito**: Calcular el monto de una factura según el tipo de plan sin condicionales en el servicio.

**Estructura**:
```
IBillingStrategy (interfaz)
├── BronzeStrategy  → aplica precio base sin descuento
├── SilverStrategy  → aplica descuento fijo
└── GoldStrategy    → aplica descuento mayor + beneficios adicionales
```

**Cómo funciona**:
```typescript
// GenerateInvoiceUseCase recibe todas las estrategias inyectadas
@Inject('BILLING_STRATEGIES') private strategies: IBillingStrategy[]

// Selecciona la estrategia por tipo de plan en tiempo de ejecución
const strategy = this.strategies.find(s => s.supports(dto.planType));
const amount = strategy.calculateAmount(dto.planPrice);
```

**Principio SOLID aplicado**: Open/Closed — agregar un nuevo tipo de plan (ej. Platinum) solo requiere crear `PlatinumStrategy` sin modificar `GenerateInvoiceUseCase`.

---

### 2. Repository Pattern — Abstracción de persistencia

**Dónde**: `*/domain/ports/out/` + `*/infrastructure/persistence/`

**Propósito**: El dominio define el contrato de persistencia; la infraestructura lo implementa con TypeORM. El dominio nunca sabe cómo ni dónde se persiste.

**Estructura por módulo**:
```
domain/ports/out/IUserRepository.ts       ← contrato (clase abstracta)
infrastructure/persistence/
  user.orm-entity.ts                       ← entidad TypeORM con decoradores
  user.typeorm.repository.ts               ← implementación del contrato
```

**Por qué clase abstracta y no interfaz**: Las interfaces TypeScript son borradas en tiempo de ejecución. NestJS necesita un token de inyección concreto, así que los repositorios se definen como clases abstractas.

---

### 3. Use Case Pattern — Encapsulación de lógica de negocio

**Dónde**: `*/application/use-cases/`

**Propósito**: Cada operación de negocio tiene su propia clase con un único método `execute()`. Los controllers solo orquestan, nunca contienen lógica.

**Ejemplo**:
```typescript
// RegisterUseCase
async execute(dto: RegisterDto): Promise<User> {
  const exists = await this.userRepository.findByEmail(dto.email);
  if (exists) throw new EmailAlreadyExistsException();          // Guard Clause
  const hashed = await bcrypt.hash(dto.password, 10);
  const user = User.create({ email: dto.email, password: hashed });
  return this.userRepository.save(user);
}
```

---

### 4. Guard Clauses + Fail Fast

**Dónde**: Todos los use cases

**Propósito**: Validar precondiciones al inicio de cada caso de uso y lanzar excepciones tipadas antes de ejecutar operaciones costosas (consultas a BD, hashing, etc.).

**Patrón**:
```typescript
// ✅ Fail fast: validar primero, operar después
if (!user) throw new UserNotFoundException();
if (user.status === 'INACTIVE') throw new InactiveUserException();
// ... lógica principal
```

---

### 5. Mapper Pattern — Conversión entre capas

**Dónde**: Dentro de cada `*.typeorm.repository.ts`

**Propósito**: Convertir entre la entidad de persistencia (con decoradores TypeORM) y la entidad de dominio (TypeScript puro). Las dos representaciones del mismo dato son independientes y cada capa solo conoce la suya.

**Ejemplo**:
```typescript
// En UserTypeOrmRepository
private toDomain(orm: UserOrmEntity): User {
  return new User({ id: orm.id, email: orm.email, role: orm.role, ... });
}

private toOrm(domain: User): UserOrmEntity {
  const entity = new UserOrmEntity();
  entity.email = domain.email;
  // ...
  return entity;
}
```

---

### 6. Duck Typing en GlobalExceptionFilter

**Dónde**: `backend/src/common/filters/global-exception.filter.ts`

**Propósito**: Distinguir excepciones de dominio (con `statusCode`) de excepciones genéricas de JavaScript sin usar `instanceof` (que fallaría con la herencia de clases en TypeScript compilado).

**Implementación**:
```typescript
private isDomainException(exception: unknown): exception is DomainException {
  return typeof exception === 'object' && exception !== null && 'statusCode' in exception;
}
```

---

### 7. Hooks como capa de abstracción (DIP en frontend)

**Dónde**: `src/hooks/useAuth.ts`, `src/hooks/useSubscription.ts`

**Propósito**: Los componentes dependen de la abstracción que provee el hook, no de la implementación concreta del store de Zustand. Si el día de mañana Zustand se reemplaza por Redux o Context API, ningún componente cambia.

```
Componente → useAuth() → auth.store (Zustand)
                ↑ solo conoce esta interfaz
```

---

### 8. Stable Ref Pattern (useRef para dependencias inestables)

**Dónde**: `DashboardPage`, `PlansPage`, `InvoicesPage`, `SubscriptionsPage`

**Propósito**: Funciones como `loadStatus` se recrean en cada render de Zustand. Usarlas directamente en `useEffect([loadStatus])` causa bucles infinitos. El patrón `useRef` captura siempre la versión más reciente sin convertirla en dependencia del efecto.

```typescript
const loadStatusRef = useRef(loadStatus);
loadStatusRef.current = loadStatus; // se sincroniza en cada render

useEffect(() => {
  void loadStatusRef.current(userId); // siempre llama a la versión actual
}, []); // [] → solo se ejecuta al montar
```

---

## Principios SOLID aplicados

| Principio | Ejemplo concreto en el proyecto |
|-----------|--------------------------------|
| **S** — Single Responsibility | Cada use case tiene exactamente un método `execute()` y una sola razón para cambiar |
| **O** — Open/Closed | Agregar `PlatinumStrategy` no modifica `GenerateInvoiceUseCase` ni `BillingModule` |
| **L** — Liskov Substitution | `UserTypeOrmRepository` cumple el contrato de `IUserRepository` y es intercambiable |
| **I** — Interface Segregation | `IRegisterUseCase` e `ILoginUseCase` son interfaces separadas, no una sola `IAuthUseCase` con todo |
| **D** — Dependency Inversion | Use cases reciben repositorios como `IUserRepository` (abstracción), no como `UserTypeOrmRepository` (concreción) |

---

## Esquema de base de datos

```
users
  id          SERIAL PK
  email       VARCHAR UNIQUE NOT NULL
  password    VARCHAR NOT NULL         ← bcrypt hash
  role        ENUM(ADMIN, CLIENT)
  isActive    BOOLEAN DEFAULT true
  createdAt   TIMESTAMP

plans
  id          SERIAL PK
  name        VARCHAR NOT NULL
  type        ENUM(BRONZE, SILVER, GOLD)
  price       DECIMAL NOT NULL
  description TEXT
  maxUsers    INT
  isActive    BOOLEAN DEFAULT true
  createdAt   TIMESTAMP

subscriptions
  id          SERIAL PK
  userId      FK → users.id
  planId      FK → plans.id
  startDate   DATE
  endDate     DATE
  status      ENUM(ACTIVE, EXPIRED, CANCELLED)
  createdAt   TIMESTAMP

invoices
  id             SERIAL PK
  subscriptionId FK → subscriptions.id
  userId         FK → users.id
  amount         DECIMAL NOT NULL
  status         ENUM(PENDING, PAID, OVERDUE)
  dueDate        DATE
  paidAt         TIMESTAMP NULL
  createdAt      TIMESTAMP
```

---

## Flujo de una petición típica (end-to-end)

```
React (PlansPage)
  │  plansService.getAll()
  │  axios.get('/plans')
  ▼
NestJS PlansController.findAll()
  │  getAllPlansUseCase.execute()
  ▼
GetAllPlansUseCase
  │  planRepository.findAll()
  ▼
PlanTypeOrmRepository
  │  TypeORM → PostgreSQL
  │  toOrm → Mapper → toDomain
  ▼
GetAllPlansUseCase
  │  retorna Plan[] (dominio)
  ▼
PlansController
  │  plan.toPublic() — serializa a objeto plano
  ▼
React
  │  setPlans(data)
  ▼
PlansTable renderiza PlanCard[] 
```
