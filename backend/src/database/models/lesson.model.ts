import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from 'sequelize';
import { sequelize } from '../sequelize.js';

export class Lesson extends Model<InferAttributes<Lesson>, InferCreationAttributes<Lesson>> {
  declare id: CreationOptional<number>;
  declare moduleId: number;
  declare title: string;
  declare content: string;
  declare videoUrl: CreationOptional<string | null>;
  declare durationMinutes: CreationOptional<number | null>;
  declare position: number;
  declare isPreview: CreationOptional<boolean>;
  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;
}

Lesson.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    moduleId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    title: { type: DataTypes.STRING(180), allowNull: false },
    content: { type: DataTypes.TEXT('medium'), allowNull: false },
    videoUrl: { type: DataTypes.STRING(500), allowNull: true },
    durationMinutes: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
    position: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    isPreview: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, tableName: 'lessons', indexes: [{ unique: true, fields: ['module_id', 'position'] }, { fields: ['module_id'] }] },
);
