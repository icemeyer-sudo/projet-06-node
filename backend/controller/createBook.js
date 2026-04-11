import Book from '../model/Book.js';
import { createLog } from '../services/createLog.js';

export async function createBook(req, res, next) {
    const book = extractBookData(req);
    try {
        await createBookInDb(book);
        const dataLog = {
            userId: req.auth.userId,
            bookId: book._id,
            action: 'created',
            status: 'done',
            content: null,
        };
        createLog(dataLog).catch(error => console.error(error));
        return res.status(201).json({ message: 'Livre créé' });
    } catch(error) {
        console.error(error);
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