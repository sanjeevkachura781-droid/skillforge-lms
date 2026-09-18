import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from 'sequelize';
import { sequelize } from '../sequelize.js';

export class CourseModule extends Model<InferAttributes<CourseModule>, InferCreationAttributes<CourseModule>> {
  declare id: CreationOptional<number>;
  declare courseId: number;
  declare title: string;
  declare description: CreationOptional<string | null>;
  declare position: number;
  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;
}

CourseModule.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    courseId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    title: { type: DataTypes.STRING(180), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    position: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, tableName: 'course_modules', indexes: [{ unique: true, fields: ['course_id', 'position'] }, { fields: ['course_id'] }] },
);
