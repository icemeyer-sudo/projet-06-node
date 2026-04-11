import Book from '../model/Book.js';
import { createLog } from '../services/createLog.js';
import fs from 'fs';
import mongoose from 'mongoose';

export async function deleteBook(req, res, next) {

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ message: 'ID invalide' });
    }

    let book;

    try {
        book = await Book.findOne({ _id: req.params.id});
    } catch(error) {
        console.error(error);
        return res.status(500).json({ message: 'Le serveur ne répond pas' });
    }

    if (!book) {
        return res.status(404).json({ message: 'Livre introuvable' });
    }

    if (book.userId !== req.auth.userId) {
        return res.status(401).json({ message: 'Non autorisé'})
    }

    const filename = book.imageUrl.split('/images/')[1];

    try {
        await Book.deleteOne({ _id: req.params.id });
        const dataLog = {
            userId: req.auth.userId,
            bookId: book._id,
            action: 'deleted',
            status: 'done',
            content: null,
        };
        createLog(dataLog).catch(error => console.error(error));
    } catch(error) {
        console.error(error);
        return res.status(500).json({ message: 'Fiche non modifiée, erreur BDD' });
    }

    try {
        await fs.promises.unlink(`images/${filename}`)
    } catch(error) {
        console.error(error);
        const dataLog = {
            userId: req.auth.userId,
            bookId: book._id,
            action: 'deleted',
            status: 'fail',
            content: {
                'filename': filename,
                'error': error.message,
            },
        };
        createLog(dataLog).catch(error => console.error(error));
    }

    return res.status(200).json({ message: 'Livre supprimé' });
}