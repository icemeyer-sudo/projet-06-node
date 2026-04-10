import Book from '../model/Book.js';
import Logs from '../model/Logs.js';
import fs from 'fs';

export async function updateBook(req, res, next) {
    const bookObject = extractBookData(req);
    let book;

    try {
        book = await Book.findOne({ _id: req.params.id });
    } catch(error) {
        return res.status(500).json({ message: 'Le serveur ne répond pas' });
    }

    if (!book) {
        return res.status(404).json({ message: 'Livre introuvable' });
    }

    if (book.userId != req.auth.userId) {
        return res.status(401).json({ message: 'Non autorisé'});
    }

    const oldFilename = book.imageUrl.split('/images/')[1];

    try {
        await Promise.all([
            updateBookInDb(req, bookObject),
            createLog(req, 'updated', 'done'),
        ]);
    } catch(error) {
        console.error(error);
        return res.status(500).json({ message: 'Fiche non modifiée, erreur BDD' });
    }

    if(req.file) {
        try {
            await fs.promises.unlink(`images/${oldFilename}`);
        } catch(error) {
            console.error(error);
            await createLog(req, 'deletedImage', 'fail', oldFilename);
        }
    }

    return res.status(200).json({ message: 'Fiche modifiée' });

}

function extractBookData(req) {
    let bookObject;
    if (req.file) {
        const bookData = JSON.parse(req.body.book);
        bookObject = {
            ...bookData,
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
        };
    } else {
        bookObject = { ...req.body };
    }
    delete bookObject._userId;
    return bookObject;
}

function updateBookInDb(req, bookObject) {
    return Book.updateOne(
        { _id: req.params.id },
        { $set: bookObject },
        { runValidators: true }
    )
}

function createLog(req, action, status) {
    const logs = new Logs({
        userId: req.auth.userId,
        bookId: req.params.id,
        action: action,
        status: status,
    });
    return logs.save();
}