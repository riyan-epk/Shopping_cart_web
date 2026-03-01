import { productRepository } from '../repositories/productRepository';
import { categoryRepository } from '../repositories/categoryRepository';
import { IProduct, ProductQueryParams } from '../types';
import { generateSlug, calculateFinalPrice } from '../utils/helpers';
import { NotFoundError, BadRequestError } from '../utils/AppError';
import cloudinary from '../config/cloudinary';

export class ProductService {
    async getAllProducts(
        params: ProductQueryParams
    ): Promise<{ products: IProduct[]; total: number; page: number; limit: number }> {
        const { products, total } = await productRepository.findAll(params);
        return {
            products,
            total,
            page: params.page || 1,
            limit: params.limit || 12,
        };
    }

    async getProductById(id: string): Promise<IProduct> {
        const product = await productRepository.findById(id);
        if (!product) throw new NotFoundError('Product not found');
        return product;
    }

    async getProductBySlug(slug: string): Promise<IProduct> {
        const product = await productRepository.findBySlug(slug);
        if (!product) throw new NotFoundError('Product not found');
        return product;
    }

    async getFeaturedProducts(limit: number = 8): Promise<IProduct[]> {
        return productRepository.findFeatured(limit);
    }

    async getRelatedProducts(productId: string, limit: number = 4): Promise<IProduct[]> {
        const product = await productRepository.findById(productId);
        if (!product) return [];
        const related = await productRepository.findByCategory(
            product.category.toString(),
            limit + 1
        );
        return related.filter((p) => p._id.toString() !== productId).slice(0, limit);
    }

    async createProduct(data: any, files?: Express.Multer.File[]): Promise<IProduct> {
        // Verify category exists
        const category = await categoryRepository.findById(data.category);
        if (!category) throw new BadRequestError('Invalid category');

        data.slug = generateSlug(data.name);
        data.finalPrice = calculateFinalPrice(
            data.originalPrice,
            data.discountPercentage || 0
        );

        // Upload images
        if (files && files.length > 0) {
            data.images = await this.uploadImages(files);
        }

        if (typeof data.isFeatured === 'string') data.isFeatured = data.isFeatured === 'true';
        if (typeof data.isNewArrival === 'string') data.isNewArrival = data.isNewArrival === 'true';

        const product = await productRepository.create(data);

        // Update category product count
        await categoryRepository.incrementProductCount(data.category, 1);

        return product;
    }

    async updateProduct(
        id: string,
        data: any,
        files?: Express.Multer.File[]
    ): Promise<IProduct> {
        const product = await productRepository.findById(id);
        if (!product) throw new NotFoundError('Product not found');

        if (data.name) {
            data.slug = generateSlug(data.name);
        }

        if (data.originalPrice !== undefined || data.discountPercentage !== undefined) {
            const price = data.originalPrice ?? product.originalPrice;
            const discount = data.discountPercentage ?? product.discountPercentage;
            data.finalPrice = calculateFinalPrice(price, discount);
        }

        if (files && files.length > 0) {
            const newImages = await this.uploadImages(files);
            data.images = [...(product.images || []), ...newImages].slice(0, 5);
        }

        if (typeof data.isFeatured === 'string') data.isFeatured = data.isFeatured === 'true';
        if (typeof data.isNewArrival === 'string') data.isNewArrival = data.isNewArrival === 'true';

        // Handle category change
        const oldCategoryId = (product.category as any)._id?.toString() || product.category.toString();
        if (data.category && data.category !== oldCategoryId) {
            await categoryRepository.incrementProductCount(
                oldCategoryId,
                -1
            );
            await categoryRepository.incrementProductCount(data.category, 1);
        }

        const updated = await productRepository.updateById(id, data);
        if (!updated) throw new NotFoundError('Product not found');
        return updated;
    }

    async deleteProduct(id: string): Promise<void> {
        const product = await productRepository.findById(id);
        if (!product) throw new NotFoundError('Product not found');

        await productRepository.softDelete(id);
        const categoryId = (product.category as any)._id?.toString() || product.category.toString();
        await categoryRepository.incrementProductCount(
            categoryId,
            -1
        );
    }

    async toggleActive(id: string): Promise<IProduct> {
        const product = await productRepository.findById(id);
        if (!product) throw new NotFoundError('Product not found');

        const updated = await productRepository.updateById(id, {
            isActive: !product.isActive,
        });
        if (!updated) throw new NotFoundError('Product not found');
        return updated;
    }

    async getLowStockProducts(threshold: number = 10): Promise<IProduct[]> {
        return productRepository.findLowStock(threshold);
    }

    private async uploadImages(files: Express.Multer.File[]): Promise<string[]> {
        if (!process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME === 'your_cloud_name') {
            console.warn('⚠️ Cloudinary is not configured in .env. Skipping image upload and using placeholders.');
            return files.map((_, i) => `https://via.placeholder.com/800?text=Product+Image+${i + 1}`);
        }

        const uploadPromises = files.map(
            (file) =>
                new Promise<string>((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        {
                            folder: 'shopping-cart/products',
                            transformation: [
                                { width: 800, height: 800, crop: 'limit' },
                                { quality: 'auto' },
                                { fetch_format: 'auto' },
                            ],
                        },
                        (error, result) => {
                            if (error) reject(error);
                            else resolve(result!.secure_url);
                        }
                    );
                    stream.end(file.buffer);
                })
        );

        return Promise.all(uploadPromises);
    }
}

export const productService = new ProductService();
