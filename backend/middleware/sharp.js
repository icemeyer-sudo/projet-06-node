import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const optimizeImage = (req, res, next) => {
    if (!req.file) return next();

    const filename = req.file.filename;
    const filepath = path.join(__dirname, '../../images', filename);
    const webpFilepath = filepath.replace(/\.[^.]+$/, '.webp');

    sharp(filepath)
    .resize(800)
    .webp({ quality: 80 })
    .toFile(webpFilepath)
    .then(() => {
        fs.unlink(filepath, () => {});
        req.file.filename = filename.replace(/\.[^.]+$/, '.webp');
        next();
    })
    .catch((err) => next(err));
};

export default optimizeImage;