# Subscription Manager

Sistema de gestión de suscripciones y facturación recurrente (SaaS). Permite administrar clientes, planes (Bronze, Silver, Gold), suscripciones y facturación con cálculo automático de montos según el plan contratado.

## Requisitos previos

- [Node.js](https://nodejs.org/) v18 o superior
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (para la base de datos)
- npm v9 o superior

---

## Instalación

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd "Sistema de Gestion Suscripciones y Facturacion_prueba tecnica"
```

### 2. Instalar dependencias raíz

```bash
npm install
```

### 3. Instalar dependencias del backend

```bash
cd backend
npm install
cd ..
```

### 4. Instalar dependencias del frontend

```bash
cd frontend
npm install
cd ..
```

### 5. Configurar variables de entorno del backend

Crea el archivo `backend/.env` con el siguiente contenido:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=subscrip-fact
JWT_SECRET=supersecret_cambiame_en_produccion
JWT_EXPIRES_IN=1d
PORT=3000
NODE_ENV=development
```

---

## Levantar el proyecto

### Base de datos (PostgreSQL en Docker)

```bash
docker-compose up -d
```

Verifica que el contenedor esté corriendo:

```bash
docker ps
# Debe aparecer: subscrip-fact_db
```

### Backend (NestJS — puerto 3000)

```bash
npm run dev:backend
```

O directamente desde la carpeta `backend/`:

```bash
cd backend
npm run start:dev
```

### Frontend (Vite — puerto 5173)

```bash
npm run dev:frontend
```

O directamente desde la carpeta `frontend/`:

```bash
cd frontend
npm run dev
```

### Todo en paralelo (recomendado)

```bash
npm run dev
```

Levanta backend y frontend simultáneamente usando `concurrently`.

---

## URLs de acceso

| Servicio | URL |
|----------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3000 |
| Base de datos | `localhost:5432` |

---

## Usuarios de prueba

Al registrarse por primera vez, todos los usuarios tienen rol `CLIENT` por defecto. Para tener un usuario `ADMIN`, crea uno directamente en la base de datos o modifica el rol vía SQL:

```sql
-- Conectarse al contenedor
docker exec -it subscrip-fact_db psql -U postgres -d subscrip-fact

-- Promover un usuario existente a ADMIN
UPDATE users SET role = 'ADMIN' WHERE email = 'tu@email.com';
```

---

## Comandos útiles

```bash
# Ejecutar tests del backend
npm run test

# Tests con cobertura
cd backend && npm run test:cov

# Tests del frontend
cd frontend && npx vitest run

# Ver logs de la base de datos
docker logs subscrip-fact_db

# Detener la base de datos
docker-compose down

# Detener y eliminar volumen (borra todos los datos)
docker-compose down -v
```

---

Consulta [`ARCHITECTURE.md`](./ARCHITECTURE.md) para la documentación completa de stack tecnológico, arquitectura y patrones de diseño implementados.
