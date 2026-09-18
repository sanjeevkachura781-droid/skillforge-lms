import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from 'sequelize';
import { sequelize } from '../sequelize.js';

export class QuizAttempt extends Model<InferAttributes<QuizAttempt>, InferCreationAttributes<QuizAttempt>> {
  declare id: CreationOptional<number>;
  declare quizId: number;
  declare studentId: number;
  declare scorePercentage: number;
  declare passed: boolean;
  declare answers: Record<string, number>;
  declare submittedAt: CreationOptional<Date>;
  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;
}

QuizAttempt.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    quizId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    studentId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    scorePercentage: { type: DataTypes.DECIMAL(5, 2), allowNull: false },
    passed: { type: DataTypes.BOOLEAN, allowNull: false },
    answers: { type: DataTypes.JSON, allowNull: false },
    submittedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, tableName: 'quiz_attempts', indexes: [{ fields: ['quiz_id', 'student_id'] }, { fields: ['student_id', 'submitted_at'] }] },
);
