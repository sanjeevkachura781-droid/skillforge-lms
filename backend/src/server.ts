import { app } from './app.js';
import { env } from './config/env.js';
import './database/models/index.js';
import { sequelize } from './database/sequelize.js';

async function start(): Promise<void> {
  await sequelize.authenticate();
  app.listen(env.PORT, () => {
    console.log(`SkillForge API listening on port ${env.PORT}`);
  });
}

start().catch((error: unknown) => {
  console.error('Unable to start SkillForge API', error);
  process.exitCode = 1;
});
