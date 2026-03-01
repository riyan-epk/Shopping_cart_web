import { Request, Response, NextFunction } from 'express';
import { productService } from '../services/productService';

export class ProductController {
    async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const params = {
                page: parseInt(req.query.page as string) || 1,
                limit: parseInt(req.query.limit as string) || 12,
                sort: req.query.sort as string,
                category: req.query.category as string,
                minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
                maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
                search: req.query.search as string,
                inStock: req.query.inStock === 'true',
            };

            const result = await productService.getAllProducts(params);
            res.json({
                success: true,
                data: { products: result.products },
                pagination: {
                    page: result.page,
                    limit: result.limit,
                    total: result.total,
                    pages: Math.ceil(result.total / result.limit),
                },
            });
        } catch (error) {
            next(error);
        }
    }

    async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const product = await productService.getProductById(req.params.id);
            res.json({ success: true, data: { product } });
        } catch (error) {
            next(error);
        }
    }

    async getBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const product = await productService.getProductBySlug(req.params.slug);
            res.json({ success: true, data: { product } });
        } catch (error) {
            next(error);
        }
    }

    async getFeatured(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const limit = parseInt(req.query.limit as string) || 8;
            const products = await productService.getFeaturedProducts(limit);
            res.json({ success: true, data: { products } });
        } catch (error) {
            next(error);
        }
    }

    async getRelated(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const products = await productService.getRelatedProducts(req.params.id);
            res.json({ success: true, data: { products } });
        } catch (error) {
            next(error);
        }
    }

    async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const files = req.files as Express.Multer.File[] | undefined;
            const product = await productService.createProduct(req.body, files);
            res.status(201).json({ success: true, data: { product } });
        } catch (error) {
            next(error);
        }
    }

    async update(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const files = req.files as Express.Multer.File[] | undefined;
            const product = await productService.updateProduct(req.params.id, req.body, files);
            res.json({ success: true, data: { product } });
        } catch (error) {
            next(error);
        }
    }

    async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            await productService.deleteProduct(req.params.id);
            res.json({ success: true, message: 'Product deleted successfully' });
        } catch (error) {
            next(error);
        }
    }

    async toggleActive(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const product = await productService.toggleActive(req.params.id);
            res.json({ success: true, data: { product } });
        } catch (error) {
            next(error);
        }
    }

    async getLowStock(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const threshold = parseInt(req.query.threshold as string) || 10;
            const products = await productService.getLowStockProducts(threshold);
            res.json({ success: true, data: { products } });
        } catch (error) {
            next(error);
        }
    }
}

export const productController = new ProductController();
