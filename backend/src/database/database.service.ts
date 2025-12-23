import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { Product, ProductDocument } from '../schemas/product.schema';
import { Order, OrderDocument } from '../schemas/order.schema';
import { Cart, CartDocument } from '../schemas/cart.schema';
import { Payment, PaymentDocument } from '../schemas/payment.schema';
import { sampleProducts } from './seed-data';

@Injectable()
export class DatabaseService {
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        @InjectModel(Product.name) private productModel: Model<ProductDocument>,
        @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
        @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
        @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    ) { }

    async clearAllData() {
        try {
            // Clear in order to avoid dependency issues
            // 1. Clear carts first (depends on users and products)
            await this.cartModel.deleteMany({});

            // 2. Clear payments (depends on orders and users)
            await this.paymentModel.deleteMany({});

            // 3. Clear orders (depends on users and products)
            await this.orderModel.deleteMany({});

            // 4. Clear products
            await this.productModel.deleteMany({});

            // 5. Clear users (but keep admin users)
            await this.userModel.deleteMany({ isAdmin: { $ne: true } });

            return {
                success: true,
                message: 'All data cleared successfully (admin users preserved)',
                cleared: {
                    carts: true,
                    payments: true,
                    orders: true,
                    products: true,
                    users: 'non-admin users only',
                },
            };
        } catch (error) {
            throw new Error(`Failed to clear data: ${error.message}`);
        }
    }

    async clearAllDataIncludingAdmins() {
        try {
            // Clear everything including admin users
            await this.cartModel.deleteMany({});
            await this.paymentModel.deleteMany({});
            await this.orderModel.deleteMany({});
            await this.productModel.deleteMany({});
            await this.userModel.deleteMany({});

            return {
                success: true,
                message: 'All data cleared successfully (including admin users)',
                cleared: {
                    carts: true,
                    payments: true,
                    orders: true,
                    products: true,
                    users: true,
                },
            };
        } catch (error) {
            throw new Error(`Failed to clear data: ${error.message}`);
        }
    }

    async clearCollection(collection: string) {
        try {
            let result;

            switch (collection.toLowerCase()) {
                case 'carts':
                    result = await this.cartModel.deleteMany({});
                    break;
                case 'payments':
                    result = await this.paymentModel.deleteMany({});
                    break;
                case 'orders':
                    result = await this.orderModel.deleteMany({});
                    break;
                case 'products':
                    result = await this.productModel.deleteMany({});
                    break;
                case 'users':
                    result = await this.userModel.deleteMany({ isAdmin: { $ne: true } });
                    break;
                default:
                    throw new Error(`Unknown collection: ${collection}`);
            }

            return {
                success: true,
                message: `${collection} collection cleared successfully`,
                deletedCount: result.deletedCount,
            };
        } catch (error) {
            throw new Error(`Failed to clear ${collection}: ${error.message}`);
        }
    }

    async getDatabaseStats() {
        try {
            const [users, products, orders, carts, payments] = await Promise.all([
                this.userModel.countDocuments(),
                this.productModel.countDocuments(),
                this.orderModel.countDocuments(),
                this.cartModel.countDocuments(),
                this.paymentModel.countDocuments(),
            ]);

            const [adminUsers, regularUsers] = await Promise.all([
                this.userModel.countDocuments({ isAdmin: true }),
                this.userModel.countDocuments({ isAdmin: { $ne: true } }),
            ]);

            return {
                collections: {
                    users: {
                        total: users,
                        admin: adminUsers,
                        regular: regularUsers,
                    },
                    products,
                    orders,
                    carts,
                    payments,
                },
                totalDocuments: users + products + orders + carts + payments,
            };
        } catch (error) {
            throw new Error(`Failed to get database stats: ${error.message}`);
        }
    }

    async resetDatabase() {
        try {
            // Clear all data
            await this.clearAllData();

            return {
                success: true,
                message: 'Database reset successfully',
            };
        } catch (error) {
            throw new Error(`Failed to reset database: ${error.message}`);
        }
    }

    async seedSampleData() {
        try {
            // Seed sample products from external seed-data.ts file
            const products = await this.productModel.insertMany(sampleProducts);

            return {
                success: true,
                message: `Successfully seeded ${products.length} sample products`,
                seeded: {
                    products: products.length,
                },
            };
        } catch (error) {
            throw new Error(`Failed to seed sample data: ${error.message}`);
        }
    }

    async refactorDatabase() {
        try {
            // 1. Clear all data (preserving admin users)
            await this.clearAllData();

            // 2. Seed with fresh sample data
            const seedResult = await this.seedSampleData();

            // 3. Get updated stats
            const stats = await this.getDatabaseStats();

            return {
                success: true,
                message: 'Database refactored successfully',
                steps: {
                    cleared: true,
                    seeded: seedResult.seeded,
                },
                currentStats: stats,
            };
        } catch (error) {
            throw new Error(`Failed to refactor database: ${error.message}`);
        }
    }
}
