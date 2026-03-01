import { Request, Response, NextFunction } from 'express';
import { categoryService } from '../services/categoryService';

export class CategoryController {
    async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const activeOnly = req.query.active === 'true';
            const categories = await categoryService.getAllCategories(activeOnly);
            res.json({ success: true, data: { categories } });
        } catch (error) {
            next(error);
        }
    }

    async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const category = await categoryService.getCategoryById(req.params.id);
            res.json({ success: true, data: { category } });
        } catch (error) {
            next(error);
        }
    }

    async getBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const category = await categoryService.getCategoryBySlug(req.params.slug);
            res.json({ success: true, data: { category } });
        } catch (error) {
            next(error);
        }
    }

    async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const category = await categoryService.createCategory(req.body);
            res.status(201).json({ success: true, data: { category } });
        } catch (error) {
            next(error);
        }
    }

    async update(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const category = await categoryService.updateCategory(req.params.id, req.body);
            res.json({ success: true, data: { category } });
        } catch (error) {
            next(error);
        }
    }

    async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            await categoryService.deleteCategory(req.params.id);
            res.json({ success: true, message: 'Category deleted successfully' });
        } catch (error) {
            next(error);
        }
    }

    async toggleActive(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const category = await categoryService.toggleActive(req.params.id);
            res.json({ success: true, data: { category } });
        } catch (error) {
            next(error);
        }
    }
}

export const categoryController = new CategoryController();
