import { Category } from '../../database/models/index.js';
import { AppError } from '../../utils/app-error.js';

export async function listCategories(includeInactive = false) {
  return Category.findAll({ where: includeInactive ? undefined : { isActive: true }, order: [['name', 'ASC']] });
}

export async function createCategory(input: { name: string; slug: string; description?: string | null; isActive?: boolean }) {
  return Category.create(input);
}

export async function updateCategory(id: number, input: Partial<{ name: string; slug: string; description: string | null; isActive: boolean }>) {
  const category = await Category.findByPk(id);
  if (!category) throw new AppError(404, 'Category not found', 'CATEGORY_NOT_FOUND');
  await category.update(input);
  return category;
}

export async function deactivateCategory(id: number) {
  return updateCategory(id, { isActive: false });
}
