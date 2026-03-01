import { categoryRepository } from '../repositories/categoryRepository';
import { productRepository } from '../repositories/productRepository';
import { ICategory } from '../types';
import { generateSlug } from '../utils/helpers';
import { BadRequestError, NotFoundError } from '../utils/AppError';

export class CategoryService {
    async getAllCategories(activeOnly: boolean = false): Promise<ICategory[]> {
        return categoryRepository.findAll(activeOnly);
    }

    async getCategoryById(id: string): Promise<ICategory> {
        const category = await categoryRepository.findById(id);
        if (!category) throw new NotFoundError('Category not found');
        return category;
    }

    async getCategoryBySlug(slug: string): Promise<ICategory> {
        const category = await categoryRepository.findBySlug(slug);
        if (!category) throw new NotFoundError('Category not found');
        return category;
    }

    async createCategory(data: { name: string; description?: string; image?: string }): Promise<ICategory> {
        const slug = generateSlug(data.name);

        const existing = await categoryRepository.findBySlug(slug);
        if (existing) throw new BadRequestError('Category with this name already exists');

        return categoryRepository.create({ ...data, slug });
    }

    async updateCategory(id: string, data: Partial<ICategory>): Promise<ICategory> {
        const category = await categoryRepository.findById(id);
        if (!category) throw new NotFoundError('Category not found');

        if (data.name) {
            data.slug = generateSlug(data.name);
        }

        const updated = await categoryRepository.updateById(id, data);
        if (!updated) throw new NotFoundError('Category not found');
        return updated;
    }

    async deleteCategory(id: string): Promise<void> {
        const category = await categoryRepository.findById(id);
        if (!category) throw new NotFoundError('Category not found');

        const productCount = await productRepository.countByCategory(id);
        if (productCount > 0) {
            throw new BadRequestError(
                `Cannot delete category with ${productCount} existing products. Remove or reassign products first.`
            );
        }

        await categoryRepository.deleteById(id);
    }

    async toggleActive(id: string): Promise<ICategory> {
        const category = await categoryRepository.findById(id);
        if (!category) throw new NotFoundError('Category not found');

        const updated = await categoryRepository.updateById(id, {
            isActive: !category.isActive,
        });
        if (!updated) throw new NotFoundError('Category not found');
        return updated;
    }
}

export const categoryService = new CategoryService();
