import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from 'sequelize';
import { sequelize } from '../sequelize.js';

export class LessonProgress extends Model<InferAttributes<LessonProgress>, InferCreationAttributes<LessonProgress>> {
  declare id: CreationOptional<number>;
  declare enrollmentId: number;
  declare lessonId: number;
  declare completed: CreationOptional<boolean>;
  declare completedAt: CreationOptional<Date | null>;
  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;
}

LessonProgress.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    enrollmentId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    lessonId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    completed: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    completedAt: { type: DataTypes.DATE, allowNull: true },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, tableName: 'lesson_progress', indexes: [{ unique: true, fields: ['enrollment_id', 'lesson_id'] }, { fields: ['enrollment_id', 'completed'] }] },
);
