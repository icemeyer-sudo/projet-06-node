import express from 'express';
import { getBooks, getBookById, getBestRating } from '../controller/getbook.js';
import { updateBook } from '../controller/updateBook.js';
import { createBook } from '../controller/createBook.js';
import { deleteBook } from '../controller/deleteBook.js';
import { updateRating } from '../controller/updateRating.js';
import auth from '../middleware/auth.js';
import validateBookYear from '../middleware/validateBookYear.js'
import multer from '../middleware/multer.js';
import optimizeImage from '../middleware/sharp.js';

const router = express.Router();

router.post('/', auth, multer, validateBookYear, optimizeImage, createBook);
router.get('/', getBooks);
router.get('/bestrating', getBestRating);
router.get('/:id', getBookById);
router.put('/:id', auth, multer, validateBookYear, optimizeImage, updateBook);
router.delete('/:id', auth, deleteBook);
router.post('/:id/rating', auth, updateRating);

export default router;