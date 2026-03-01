import app from './app';
import { connectDB } from './config/db';
import { env } from './config/env';
import User from './models/User';
import { UserRole } from './types';

const initializeAdmin = async () => {
    try {
        const adminEmail = 'admin@gmail.com';
        const existingAdmin = await User.findOne({ email: adminEmail });
        if (!existingAdmin) {
            await User.create({
                name: 'Super Admin',
                email: adminEmail,
                password: 'admin123',
                role: UserRole.SUPER_ADMIN,
                isActive: true
            });
            console.log('✅ Default superadmin created (admin@gmail.com)');
        }
    } catch (error) {
        console.error('Failed to initialize default admin:', error);
    }
};

const start = async (): Promise<void> => {
    try {
        await connectDB();
        await initializeAdmin();

        app.listen(env.PORT, () => {
            console.log(`\n🚀 Server running on port ${env.PORT}`);
            console.log(`📦 Environment: ${env.NODE_ENV}`);
            console.log(`🌐 Client URL: ${env.CLIENT_URL}`);
            console.log(`💾 Database: Connected\n`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

start();
