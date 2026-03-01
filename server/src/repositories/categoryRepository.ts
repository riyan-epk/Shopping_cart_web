import Category from '../models/Category';
import { ICategory } from '../types';

export class CategoryRepository {
    async findAll(activeOnly: boolean = false): Promise<ICategory[]> {
        const filter = activeOnly ? { isActive: true } : {};
        return Category.find(filter).sort({ name: 1 });
    }

    async findById(id: string): Promise<ICategory | null> {
        return Category.findById(id);
    }

    async findBySlug(slug: string): Promise<ICategory | null> {
        return Category.findOne({ slug });
    }

    async create(data: Partial<ICategory>): Promise<ICategory> {
        return Category.create(data);
    }

    async updateById(id: string, data: Partial<ICategory>): Promise<ICategory | null> {
        return Category.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    }

    async deleteById(id: string): Promise<ICategory | null> {
        return Category.findByIdAndDelete(id);
    }

    async incrementProductCount(id: string, value: number = 1): Promise<void> {
        await Category.findByIdAndUpdate(id, { $inc: { productCount: value } });
    }
}

export const categoryRepository = new CategoryRepository();
