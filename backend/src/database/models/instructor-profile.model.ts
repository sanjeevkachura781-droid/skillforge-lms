import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { User } from './user.model.js';

export enum InstructorApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export class InstructorProfile extends Model<InferAttributes<InstructorProfile>, InferCreationAttributes<InstructorProfile>> {
  declare id: CreationOptional<number>;
  declare userId: number;
  declare bio: CreationOptional<string | null>;
  declare approvalStatus: InstructorApprovalStatus;
  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;
}

InstructorProfile.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, unique: true },
    bio: { type: DataTypes.TEXT, allowNull: true },
    approvalStatus: { type: DataTypes.ENUM(...Object.values(InstructorApprovalStatus)), allowNull: false, defaultValue: InstructorApprovalStatus.PENDING },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, tableName: 'instructor_profiles', indexes: [{ unique: true, fields: ['user_id'] }, { fields: ['approval_status'] }] },
);

User.hasOne(InstructorProfile, { foreignKey: 'userId', as: 'instructorProfile', onDelete: 'CASCADE' });
InstructorProfile.belongsTo(User, { foreignKey: 'userId', as: 'user' });
