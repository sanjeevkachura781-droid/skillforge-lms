import { DataTypes, QueryInterface } from 'sequelize';

export const name = '002-create-catalog';

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.createTable('categories', {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(100), allowNull: false },
    slug: { type: DataTypes.STRING(120), allowNull: false, unique: true },
    description: { type: DataTypes.TEXT, allowNull: true },
    is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  });
  await queryInterface.addIndex('categories', ['is_active'], { name: 'categories_is_active_idx' });

  await queryInterface.createTable('courses', {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    instructor_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
    category_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, references: { model: 'categories', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
    title: { type: DataTypes.STRING(180), allowNull: false },
    slug: { type: DataTypes.STRING(200), allowNull: false, unique: true },
    short_description: { type: DataTypes.STRING(300), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    thumbnail_url: { type: DataTypes.STRING(500), allowNull: true },
    level: { type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'), allowNull: false, defaultValue: 'beginner' },
    status: { type: DataTypes.ENUM('draft', 'pending', 'published', 'rejected', 'archived'), allowNull: false, defaultValue: 'draft' },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  });
  await queryInterface.addIndex('courses', ['instructor_id'], { name: 'courses_instructor_id_idx' });
  await queryInterface.addIndex('courses', ['category_id'], { name: 'courses_category_id_idx' });
  await queryInterface.addIndex('courses', ['status'], { name: 'courses_status_idx' });

  await queryInterface.createTable('course_modules', {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    course_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, references: { model: 'courses', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
    title: { type: DataTypes.STRING(180), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    position: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  });
  await queryInterface.addIndex('course_modules', ['course_id', 'position'], { unique: true, name: 'course_modules_course_position_uq' });

  await queryInterface.createTable('lessons', {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    module_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, references: { model: 'course_modules', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
    title: { type: DataTypes.STRING(180), allowNull: false },
    content: { type: DataTypes.TEXT, allowNull: false },
    video_url: { type: DataTypes.STRING(500), allowNull: true },
    duration_minutes: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
    position: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    is_preview: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  });
  await queryInterface.addIndex('lessons', ['module_id', 'position'], { unique: true, name: 'lessons_module_position_uq' });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('lessons');
  await queryInterface.dropTable('course_modules');
  await queryInterface.dropTable('courses');
  await queryInterface.dropTable('categories');
}
