import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from 'sequelize';
import { sequelize } from '../sequelize.js';

export class QuizOption extends Model<InferAttributes<QuizOption>, InferCreationAttributes<QuizOption>> {
  declare id: CreationOptional<number>;
  declare questionId: number;
  declare optionText: string;
  declare position: number;
  declare isCorrect: CreationOptional<boolean>;
  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;
}

QuizOption.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    questionId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    optionText: { type: DataTypes.STRING(500), allowNull: false },
    position: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    isCorrect: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, tableName: 'quiz_options', indexes: [{ unique: true, fields: ['question_id', 'position'] }, { fields: ['question_id'] }] },
);
