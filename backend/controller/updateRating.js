import Book from '../model/Book.js';
import { createLog } from '../services/createLog.js';
import mongoose from 'mongoose';

export async function updateRating(req, res, next) {

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ message: 'ID invalide' });
    }

    try {
        const book = await Book.findOne({ _id: req.params.id });
        const isAlreadyRatingByUser = book.ratings.some(r => r.userId === req.auth.userId);

        if (isAlreadyRatingByUser) {
            return res.status(400).json({ message: 'Vous avez déjà noté ce livre' });
        }

        book.ratings.push({
            userId: req.auth.userId,
            grade: req.body.rating,
        })
        const total = book.ratings.reduce((acc, r) => acc + r.grade, 0);
        book.averageRating = Math.round((total / book.ratings.length) * 2) / 2;
        await book.save();

        const dataLog = {
            userId: req.auth.userId,
            bookId: book._id,
            target: 'book',
            action: 'updatedRating',
            status: 'done',
            content: null,
        };
        createLog(dataLog).catch(error => console.error(error));

        return res.status(200).json(book);

    } catch(error) {
        console.error(error);
        res.status(400).json({ message: 'Une erreur s\'est produite avec la mise à jour de la note' });
    }

}