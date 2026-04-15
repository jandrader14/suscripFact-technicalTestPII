import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreatePlansTable1681000000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'plans',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'type',
            type: 'enum',
            enum: ['BRONZE', 'SILVER', 'GOLD'],
            isNullable: false,
          },
          {
            name: 'price',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'maxUsers',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'isActive',
            type: 'boolean',
            default: true,
            isNullable: false,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    // Crear índices
    await queryRunner.createIndex(
      'plans',
      new TableIndex({
        name: 'idx_plans_type',
        columnNames: ['type'],
      }),
    );

    await queryRunner.createIndex(
      'plans',
      new TableIndex({
        name: 'idx_plans_isActive',
        columnNames: ['isActive'],
      }),
    );

    // Insertar planes predefinidos
    await queryRunner.query(
      `INSERT INTO plans (name, type, price, description, "maxUsers", "isActive")
       VALUES 
       ('Plan Bronze', 'BRONZE', 29.99, 'Plan básico sin descuentos', 5, TRUE),
       ('Plan Silver', 'SILVER', 59.99, 'Plan estándar con descuento por duración (>6 meses)', 15, TRUE),
       ('Plan Gold', 'GOLD', 119.99, 'Plan premium con descuento por duración y volumen de usuarios', 50, TRUE)
       ON CONFLICT DO NOTHING`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('plans', true);
  }
}
