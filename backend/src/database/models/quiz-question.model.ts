import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from 'sequelize';
import { sequelize } from '../sequelize.js';

export class QuizQuestion extends Model<InferAttributes<QuizQuestion>, InferCreationAttributes<QuizQuestion>> {
  declare id: CreationOptional<number>;
  declare quizId: number;
  declare questionText: string;
  declare position: number;
  declare points: CreationOptional<number>;
  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;
}

QuizQuestion.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    quizId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    questionText: { type: DataTypes.TEXT, allowNull: false },
    position: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    points: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 1 },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, tableName: 'quiz_questions', indexes: [{ unique: true, fields: ['quiz_id', 'position'] }, { fields: ['quiz_id'] }] },
);
