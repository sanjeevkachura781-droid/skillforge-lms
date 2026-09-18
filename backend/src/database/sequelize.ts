import { Sequelize } from 'sequelize';
import { env } from '../config/env.js';

export const sequelize = new Sequelize(env.DATABASE_URL, {
  dialect: 'mysql',
  logging: env.NODE_ENV === 'development' ? false : false,
  define: {
    underscored: true,
    timestamps: true,
  },
});
