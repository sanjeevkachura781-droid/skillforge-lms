import { DataTypes, QueryInterface } from 'sequelize';

export const name = '004-expand-course-content';

export async function up(queryInterface: QueryInterface): Promise<void> {
  // TEXT holds only 65,535 bytes; validated lesson content can exceed that even
  // with ASCII, and course descriptions can exceed it when written in Unicode.
  await queryInterface.changeColumn('courses', 'description', { type: DataTypes.TEXT('medium'), allowNull: false });
  await queryInterface.changeColumn('lessons', 'content', { type: DataTypes.TEXT('medium'), allowNull: false });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.changeColumn('lessons', 'content', { type: DataTypes.TEXT, allowNull: false });
  await queryInterface.changeColumn('courses', 'description', { type: DataTypes.TEXT, allowNull: false });
}
