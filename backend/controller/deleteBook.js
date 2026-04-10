import Book from '../model/Book.js';
import Logs from '../model/Logs.js';
import fs from 'fs';

export async function deleteBook(req, res, next) {
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

    if (book.userId != req.auth.userId) {
        return res.status(401).json({ message: 'Non autorisé'})
    }

    const filename = book.imageUrl.split('/images/')[1];

    try {
        await Promise.all([
            Book.deleteOne({ _id: req.params.id }),
            createLog(req, 'deleted', 'done'),
        ]);
    } catch(error) {
        console.error(error);
        return res.status(500).json({ message: 'Fiche non modifiée, erreur BDD' });
    }

    try {
        await fs.promises.unlink(`images/${filename}`)
    } catch(error) {
        console.error(error);
        await createLog(req, 'deletedImage', 'fail');
    }

    return res.status(200).json({ message: 'Livre supprimé' });
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