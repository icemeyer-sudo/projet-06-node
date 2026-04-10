import Book from '../model/Book.js';
import Logs from '../model/Logs.js';

export async function createBook(req, res, next) {
    const book = extractBookData(req);

    try {
        await Promise.all([
            createBookInDb(book),
            createLog(book._id, req, 'created', 'done'),
        ]);
        return res.status(201).json({ message: 'Livre créé' });
    } catch(error) {
        return res.status(500).json({ message: 'Le serveur ne répond pas' });
    }
}

function extractBookData(req) {
    const bookObject = JSON.parse(req.body.book);
    delete bookObject._id;
    delete bookObject._userId;
    const book = new Book({
        ...bookObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
    return book;
}

function createBookInDb(book) {
    return book.save();
}

function createLog(bookId, req, action, status, oldImage = null) {
    const logs = new Logs({
        userId: req.auth.userId,
        bookId: bookId,
        oldImage: oldImage,
        action: action,
        status: status,
    });
    return logs.save();
}