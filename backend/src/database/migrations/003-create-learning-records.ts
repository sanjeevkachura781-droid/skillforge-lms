import { DataTypes, QueryInterface } from 'sequelize';

export const name = '003-create-learning-records';

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.createTable('enrollments', {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    student_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
    course_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, references: { model: 'courses', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
    status: { type: DataTypes.ENUM('active', 'completed', 'cancelled'), allowNull: false, defaultValue: 'active' },
    enrolled_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    completed_at: { type: DataTypes.DATE, allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  });
  await queryInterface.addIndex('enrollments', ['student_id', 'course_id'], { unique: true, name: 'enrollments_student_course_uq' });
  await queryInterface.addIndex('enrollments', ['student_id', 'status'], { name: 'enrollments_student_status_idx' });

  await queryInterface.createTable('lesson_progress', {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    enrollment_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, references: { model: 'enrollments', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
    lesson_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, references: { model: 'lessons', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
    completed: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    completed_at: { type: DataTypes.DATE, allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  });
  await queryInterface.addIndex('lesson_progress', ['enrollment_id', 'lesson_id'], { unique: true, name: 'lesson_progress_enrollment_lesson_uq' });
  await queryInterface.addIndex('lesson_progress', ['enrollment_id', 'completed'], { name: 'lesson_progress_enrollment_completed_idx' });

  await queryInterface.createTable('quizzes', {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    course_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, references: { model: 'courses', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
    title: { type: DataTypes.STRING(180), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    passing_percentage: { type: DataTypes.DECIMAL(5, 2), allowNull: false, defaultValue: 70 },
    is_published: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  });
  await queryInterface.addIndex('quizzes', ['course_id'], { name: 'quizzes_course_id_idx' });

  await queryInterface.createTable('quiz_questions', {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    quiz_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, references: { model: 'quizzes', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
    question_text: { type: DataTypes.TEXT, allowNull: false },
    position: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    points: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 1 },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  });
  await queryInterface.addIndex('quiz_questions', ['quiz_id', 'position'], { unique: true, name: 'quiz_questions_quiz_position_uq' });

  await queryInterface.createTable('quiz_options', {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    question_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, references: { model: 'quiz_questions', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
    option_text: { type: DataTypes.STRING(500), allowNull: false },
    position: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    is_correct: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  });
  await queryInterface.addIndex('quiz_options', ['question_id', 'position'], { unique: true, name: 'quiz_options_question_position_uq' });

  await queryInterface.createTable('quiz_attempts', {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    quiz_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, references: { model: 'quizzes', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
    student_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
    score_percentage: { type: DataTypes.DECIMAL(5, 2), allowNull: false },
    passed: { type: DataTypes.BOOLEAN, allowNull: false },
    answers: { type: DataTypes.JSON, allowNull: false },
    submitted_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  });
  await queryInterface.addIndex('quiz_attempts', ['quiz_id', 'student_id'], { name: 'quiz_attempts_quiz_student_idx' });

  await queryInterface.createTable('certificates', {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    enrollment_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, unique: true, references: { model: 'enrollments', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
    student_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
    course_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, references: { model: 'courses', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
    certificate_number: { type: DataTypes.STRING(80), allowNull: false, unique: true },
    issued_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  });
  await queryInterface.addIndex('certificates', ['student_id'], { name: 'certificates_student_id_idx' });
  await queryInterface.addIndex('certificates', ['course_id'], { name: 'certificates_course_id_idx' });

  await queryInterface.createTable('reviews', {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    student_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
    course_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, references: { model: 'courses', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
    rating: { type: DataTypes.TINYINT.UNSIGNED, allowNull: false },
    comment: { type: DataTypes.TEXT, allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  });
  await queryInterface.addIndex('reviews', ['student_id', 'course_id'], { unique: true, name: 'reviews_student_course_uq' });
  await queryInterface.addIndex('reviews', ['course_id'], { name: 'reviews_course_id_idx' });

  await queryInterface.createTable('notifications', {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    user_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
    type: { type: DataTypes.ENUM('enrollment', 'quiz', 'certificate', 'review', 'system'), allowNull: false },
    title: { type: DataTypes.STRING(180), allowNull: false },
    message: { type: DataTypes.TEXT, allowNull: false },
    read_at: { type: DataTypes.DATE, allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  });
  await queryInterface.addIndex('notifications', ['user_id', 'read_at'], { name: 'notifications_user_read_idx' });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('notifications');
  await queryInterface.dropTable('reviews');
  await queryInterface.dropTable('certificates');
  await queryInterface.dropTable('quiz_attempts');
  await queryInterface.dropTable('quiz_options');
  await queryInterface.dropTable('quiz_questions');
  await queryInterface.dropTable('quizzes');
  await queryInterface.dropTable('lesson_progress');
  await queryInterface.dropTable('enrollments');
}
