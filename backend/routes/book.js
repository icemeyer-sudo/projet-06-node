import express from 'express';
import { createBook, getBooks, getBookById, updateBook, deleteBook, updateRating, bestRating } from '../controller/book.js';
import auth from '../middleware/auth.js';
import multer from '../middleware/multer.js';
import optimizeImage from '../middleware/sharp.js';

const router = express.Router();

router.post('/', auth, multer, optimizeImage, createBook);
router.get('/', getBooks);
router.get('/bestrating', bestRating);
router.get('/:id', getBookById);
router.put('/:id', auth, multer, optimizeImage, updateBook);
router.delete('/:id', auth, deleteBook);
router.post('/:id/rating', auth, updateRating);

export default router;