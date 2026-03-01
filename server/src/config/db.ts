import mongoose from 'mongoose';
import { env } from './env';

export const connectDB = async (): Promise<void> => {
    try {
        console.log(`Connecting to: ${env.MONGODB_URI}...`);
        await mongoose.connect(env.MONGODB_URI);
        console.log(`✅ MongoDB Connected: ${mongoose.connection.host}`);
    } catch (error: any) {
        console.error('❌ Failed to connect to MongoDB:', error);
        process.exit(1);
    }
};
