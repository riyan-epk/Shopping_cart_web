import Product from '../models/Product';
import { IProduct, ProductQueryParams } from '../types';
import { parsePagination } from '../utils/helpers';

export class ProductRepository {
    async findAll(
        params: ProductQueryParams
    ): Promise<{ products: IProduct[]; total: number }> {
        const { page, limit, skip } = parsePagination(params.page, params.limit);

        const filter: any = { isDeleted: false };

        if (params.category) filter.category = params.category;
        if (params.inStock) filter.stock = { $gt: 0 };
        if (params.minPrice || params.maxPrice) {
            filter.finalPrice = {};
            if (params.minPrice) filter.finalPrice.$gte = params.minPrice;
            if (params.maxPrice) filter.finalPrice.$lte = params.maxPrice;
        }
        if (params.search) {
            filter.$text = { $search: params.search };
        }

        let sortOption: any = { createdAt: -1 };
        if (params.sort === 'price_asc') sortOption = { finalPrice: 1 };
        else if (params.sort === 'price_desc') sortOption = { finalPrice: -1 };
        else if (params.sort === 'newest') sortOption = { createdAt: -1 };
        else if (params.sort === 'popular') sortOption = { sold: -1 };
        else if (params.sort === 'rating') sortOption = { ratings: -1 };

        const [products, total] = await Promise.all([
            Product.find(filter)
                .populate('category', 'name slug')
                .sort(sortOption)
                .skip(skip)
                .limit(limit),
            Product.countDocuments(filter),
        ]);

        return { products, total };
    }

    async findById(id: string): Promise<IProduct | null> {
        return Product.findOne({ _id: id, isDeleted: false }).populate(
            'category',
            'name slug'
        );
    }

    async findBySlug(slug: string): Promise<IProduct | null> {
        return Product.findOne({ slug, isDeleted: false }).populate(
            'category',
            'name slug'
        );
    }

    async findByCategory(categoryId: string, limit: number = 8): Promise<IProduct[]> {
        return Product.find({
            category: categoryId,
            isDeleted: false,
            isActive: true,
        })
            .limit(limit)
            .sort({ sold: -1 });
    }

    async findFeatured(limit: number = 8): Promise<IProduct[]> {
        return Product.find({ isDeleted: false, isActive: true })
            .populate('category', 'name slug')
            .sort({ sold: -1, ratings: -1 })
            .limit(limit);
    }

    async create(data: Partial<IProduct>): Promise<IProduct> {
        return Product.create(data);
    }

    async updateById(id: string, data: Partial<IProduct>): Promise<IProduct | null> {
        return Product.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    }

    async softDelete(id: string): Promise<IProduct | null> {
        return Product.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
    }

    async reduceStock(id: string, quantity: number): Promise<IProduct | null> {
        return Product.findOneAndUpdate(
            { _id: id, stock: { $gte: quantity } },
            { $inc: { stock: -quantity } },
            { new: true }
        );
    }

    async countByCategory(categoryId: string): Promise<number> {
        return Product.countDocuments({ category: categoryId, isDeleted: false });
    }

    async countAll(): Promise<number> {
        return Product.countDocuments({ isDeleted: false });
    }

    async findLowStock(threshold: number = 10): Promise<IProduct[]> {
        return Product.find({
            isDeleted: false,
            stock: { $lte: threshold, $gt: 0 },
        }).sort({ stock: 1 });
    }
}

export const productRepository = new ProductRepository();
