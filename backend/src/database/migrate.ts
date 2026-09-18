import { QueryInterface, QueryTypes } from 'sequelize';
import { sequelize } from './sequelize.js';
import * as usersMigration from './migrations/001-create-users.js';
import * as catalogMigration from './migrations/002-create-catalog.js';
import * as learningRecordsMigration from './migrations/003-create-learning-records.js';

type Migration = { name: string; up: (queryInterface: QueryInterface) => Promise<void>; down: (queryInterface: QueryInterface) => Promise<void> };
const migrations: Migration[] = [usersMigration, catalogMigration, learningRecordsMigration];

async function migrate(): Promise<void> {
  await sequelize.authenticate();
  const queryInterface = sequelize.getQueryInterface();
  await queryInterface.createTable('schema_migrations', {
    name: { type: 'VARCHAR(255)', allowNull: false, primaryKey: true },
    applied_at: { type: 'DATETIME', allowNull: false, defaultValue: sequelize.literal('CURRENT_TIMESTAMP') },
  }).catch((error: unknown) => {
    if (!(error instanceof Error) || !error.message.includes('already exists')) throw error;
  });

  const rows = await sequelize.query<{ name: string }>('SELECT name FROM schema_migrations ORDER BY name', { type: QueryTypes.SELECT });
  const applied = new Set(rows.map((row) => row.name));
  for (const migration of migrations) {
    if (applied.has(migration.name)) continue;
    await sequelize.transaction(async (transaction) => {
      await migration.up(queryInterface);
      await sequelize.query('INSERT INTO schema_migrations (name) VALUES (?)', { replacements: [migration.name], transaction });
    });
    console.log(`Applied ${migration.name}`);
  }
  await sequelize.close();
}

migrate().catch((error: unknown) => {
  console.error('Migration failed', error);
  process.exitCode = 1;
});
