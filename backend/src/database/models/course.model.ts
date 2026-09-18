import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from 'sequelize';
import { sequelize } from '../sequelize.js';

export enum CourseStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  PUBLISHED = 'published',
  REJECTED = 'rejected',
  ARCHIVED = 'archived',
}

export enum CourseLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

export class Course extends Model<InferAttributes<Course>, InferCreationAttributes<Course>> {
  declare id: CreationOptional<number>;
  declare instructorId: number;
  declare categoryId: number;
  declare title: string;
  declare slug: string;
  declare shortDescription: string;
  declare description: string;
  declare thumbnailUrl: CreationOptional<string | null>;
  declare level: CreationOptional<CourseLevel>;
  declare status: CreationOptional<CourseStatus>;
  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;
}

Course.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    instructorId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    categoryId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    title: { type: DataTypes.STRING(180), allowNull: false },
    slug: { type: DataTypes.STRING(200), allowNull: false, unique: true },
    shortDescription: { type: DataTypes.STRING(300), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    thumbnailUrl: { type: DataTypes.STRING(500), allowNull: true },
    level: { type: DataTypes.ENUM(...Object.values(CourseLevel)), allowNull: false, defaultValue: CourseLevel.BEGINNER },
    status: { type: DataTypes.ENUM(...Object.values(CourseStatus)), allowNull: false, defaultValue: CourseStatus.DRAFT },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, tableName: 'courses', indexes: [{ unique: true, fields: ['slug'] }, { fields: ['instructor_id'] }, { fields: ['category_id'] }, { fields: ['status'] }] },
);
