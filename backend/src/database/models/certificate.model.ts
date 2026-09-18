import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from 'sequelize';
import { sequelize } from '../sequelize.js';

export class Certificate extends Model<InferAttributes<Certificate>, InferCreationAttributes<Certificate>> {
  declare id: CreationOptional<number>;
  declare enrollmentId: number;
  declare studentId: number;
  declare courseId: number;
  declare certificateNumber: string;
  declare issuedAt: CreationOptional<Date>;
  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;
}

Certificate.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    enrollmentId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, unique: true },
    studentId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    courseId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    certificateNumber: { type: DataTypes.STRING(80), allowNull: false, unique: true },
    issuedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, tableName: 'certificates', indexes: [{ unique: true, fields: ['certificate_number'] }, { fields: ['student_id'] }, { fields: ['course_id'] }] },
);
