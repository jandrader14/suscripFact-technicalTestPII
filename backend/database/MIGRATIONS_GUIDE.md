# 🗄️ Migraciones de BD - Guía Rápida

**Created:** April 15, 2026

---

## 📋 Resumen

✅ **4 migraciones creadas:**
1. `1681000000000-CreateUsersTable.ts` - Tabla users (login, roles)
2. `1681000000001-CreatePlansTable.ts` - Tabla plans (BRONZE, SILVER, GOLD)
3. `1681000000002-CreateSubscriptionsTable.ts` - Tabla subscriptions (con FK)
4. `1681000000003-CreateInvoicesTable.ts` - Tabla invoices (con FK, transacciones)

✅ **Scripts agregados a package.json:**
```json
{
  "migration:run": "Aplica todas las migraciones",
  "migration:revert": "Deshace última migración",
  "migration:show": "Muestra estado de migraciones",
  "migration:generate": "Crea migración automática",
  "db:drop": "Elimina todo (⚠️ CUIDADO)",
  "db:reset": "Regenera BD desde cero"
}
```

---

## 🚀 Setup Inicial (Primera Vez)

### Paso 1: Levantar PostgreSQL
```bash
docker-compose up -d

# Verificar que la BD está corriendo
docker ps | grep subscrip-fact_db
```

### Paso 2: Instalar dependencias
```bash
cd backend
npm install
```

### Paso 3: Ejecutar migraciones
```bash
npm run migration:run

# Output esperado:
# ✅ CreateUsersTable1681000000000
# ✅ CreatePlansTable1681000000001
# ✅ CreateSubscriptionsTable1681000000002
# ✅ CreateInvoicesTable1681000000003
# ✅ Migraciones ejecutadas exitosamente
```

### Paso 4: Verificar estado
```bash
npm run migration:show

# Output esperado:
# ✅ CreateUsersTable1681000000000
# ✅ CreatePlansTable1681000000001
# ✅ CreateSubscriptionsTable1681000000002
# ✅ CreateInvoicesTable1681000000003
```

✅ **Listo!** La BD está inicializada con todas las tablas.

---

## 📊 Ver estructura actual

```bash
# Conectar a PostgreSQL desde terminal
psql -h localhost -U postgres -d subscrip-fact

# Listar tablas
\dt

# Ver estructura de tabla específica
\d users
\d plans
\d subscriptions
\d invoices

# Ver índices
\d users (muestra también índices)

# Salir
\q
```

---

## 🔄 Agregar Nueva Columna (Ejemplo)

### Caso: Agregar `phone` a users

#### Opción A: Migración automática (recomendada)

```bash
# 1. Modifica la entity
# src/auth/infrastructure/persistence/user.orm-entity.ts
@Column({ nullable: true })
phone: string;

# 2. TypeORM genera migración
npm run migration:generate -- "AddPhoneToUsers"

# 3. El archivo se crea automáticamente
# database/migrations/1681000000004-AddPhoneToUsers.ts

# 4. Revisar que se ve bien, luego aplicar
npm run migration:run

# 5. Commit a git
git add database/migrations/1681000000004-AddPhoneToUsers.ts
git commit -m "feat: add phone column to users"
```

#### Opción B: Migración manual

```typescript
// database/migrations/1681000000004-AddPhoneToUsers.ts
export class AddPhoneToUsers1681000000004 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'phone',
        type: 'varchar',
        length: '20',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('users', 'phone');
  }
}
```

---

## ⚠️ Problemas Comunes

### Problema: "migration:run no funciona"
```
Error: Cannot find module 'dist/database/data-source.js'

Solución:
1. npm run build (compilar TypeScript a JavaScript)
2. npm run migration:run
```

### Problema: "Port 5432 is already in use"
```
Solución:
docker ps  # Ver containers corriendo
docker kill <container_id>
docker-compose up -d
```

### Problema: "Database does not exist"
```
Solución:
docker-compose down -v  # Elimina volúmenes
docker-compose up -d    # Crea BD vacía
npm run migration:run   # Crea tablas
```

### Problema: "relation users does not exist"
```
Significa: Las migraciones no se ejecutaron aún

Solución:
npm run migration:show   # Ver cuáles están pendientes
npm run migration:run    # Ejecutar todas
```

---

## 🔐 En Producción

### ✅ Checklist Pre-Deployment

```bash
# 1. Backup
pg_dump -h $DB_HOST -U $DB_USER $DB_NAME > backup_$(date +%Y%m%d).sql

# 2. Verificar migraciones en desarrollo
npm run migration:show

# 3. Compilar
npm run build

# 4. Ejecutar migraciones
npm run migration:run

# 5. Verificar
npm run migration:show
npm run start  # Iniciar servidor
```

### 🚨 Rollback en Caso de Error

```bash
# Revertir último cambio
npm run migration:revert

# Restore desde backup
psql -h $DB_HOST -U $DB_USER $DB_NAME < backup_20260415.sql
```

---

## 📝 Scripts Principales

| Script | Propósito | Cuándo usar |
|--------|-----------|-----------|
| `migration:run` | Aplica todas pendientes | Setup inicial, deployment |
| `migration:show` | Lista estado | Verificación, diagnóstico |
| `migration:revert` | Deshace última | Errores en migración |
| `migration:generate` | Crea auto desde entity | Agregar columnas/tablas |
| `db:drop` | Elimina todo | ⚠️ Desarrollo SOLO |
| `db:reset` | Drop + recrear | ⚠️ Desarrollo SOLO |

---

## 🎓 Referencia Rápida

```bash
# Ver migraciones pendientes
npm run migration:show

# Aplicar todas
npm run migration:run

# Deshacer última
npm run migration:revert

# Generar nueva (desde entity)
npm run migration:generate -- "NombreCambio"

# Ver BD (PostgreSQL CLI)
psql -h localhost -U postgres -d subscrip-fact
```

---

## 📚 Lectura Recomendada

- [DATABASE.md](./DATABASE.md) - Explicación completa de PostgreSQL + TypeORM
- [TypeORM Migrations Docs](https://typeorm.io/migrations)
- [PostgreSQL Best Practices](https://wiki.postgresql.org/wiki/Performance_Optimization)

---

**Status:** ✅ Migraciones listas para ejecutar

Siguiente: `npm run migration:run` 🚀
