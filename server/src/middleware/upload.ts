import multer from 'multer';
import path from 'path';
import { BadRequestError } from '../utils/AppError';

const storage = multer.memoryStorage();

const fileFilter = (
    _req: any,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
): void => {
    const allowedTypes = /jpeg|jpg|png|webp|gif/;
    const extname = allowedTypes.test(
        path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        cb(null, true);
    } else {
        cb(new BadRequestError('Only image files (jpeg, jpg, png, webp, gif) are allowed'));
    }
};

export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
        files: 5,
    },
});
