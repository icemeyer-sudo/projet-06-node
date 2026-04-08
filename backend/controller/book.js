import Book from '../model/Book.js';
import Logs from '../model/Logs.js';
import fs from 'fs';

export const createBook = (req, res, next) => {
    const bookObject = JSON.parse(req.body.book);
    delete bookObject._id;
    delete bookObject._userId;
    const book = new Book({
        ...bookObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
    book.save()
    .then ((savedBook) => {
        const logs = new Logs({
            userId: req.auth.userId,
            oldImage: null,
            bookId: savedBook._id,
            action: 'created',
            status: 'in progress',
        });
        return logs.save();
    })
    .then((savedLog) => {
        res.status(201).json({ message: 'Livre créé'})
        Logs.updateOne(
            { _id: savedLog._id },
            { status: 'done' },
        )
        .catch(error => {
            console.log(error);
        })
    })
    .catch(error => {
        console.log(error);
        res.status(400).json({ error })
    });
}

export const getBooks = (req, res, next) => {
    Book.find()
    .then(book => res.status(200).json(book))
    .catch(error => {
        console.log(error);
        res.status(400).json({ error })
    });
};

export const getBookById = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
    .then(books => res.status(200).json(books))
    .catch(error => {
        console.log(error);
        res.status(400).json({ error })
    });
}

export const updateBook = (req, res, next) => {
    let bookObject;
    if (req.file) {
        // L'utilisateur a envoyé une nouvelle image
        const bookData = JSON.parse(req.body.book);
        bookObject = {
            ...bookData,
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
        };
    } else {
        // Pas de nouvelle image, on prend les données telles quelles
        bookObject = { ...req.body };
    }
    // Suppression de _userId pour éviter les actions malveillantes
    delete bookObject._userId;
    Book.findOne({ _id: req.params.id })
    .then((book) => {
        if (book.userId != req.auth.userId) {
            res.status(401).json({ message: 'Non autorisé'})
        } else {
            const oldFilename = book.imageUrl.split('/images/')[1];
            Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
            .then(() => {
                let oldImage = null;
                if (req.file) {
                    oldImage = oldFilename;
                }
                const logs = new Logs({
                    userId: req.auth.userId,
                    bookId: req.params.id,
                    action: 'updated',
                    oldImage: oldImage,
                    status: 'in progress',
                })
                return logs.save();
            })
            .then((savedLog) => {
                if (req.file) {
                    return fs.promises.unlink(`images/${oldFilename}`)
                    .then(() => {
                        res.status(200).json({ message: 'Fiche modifiée' });
                        return Logs.updateOne(
                            { _id: savedLog._id },
                            { status: 'done' }  // ✅ Succès
                        )
                    })
                    .catch(error => {
                        console.error('Erreur suppression ancienne image:', error);
                        res.status(200).json({ message: 'Fiche modifiée' });  // Client reçoit 200 quand même
                        return Logs.updateOne(
                            { _id: savedLog._id },
                            { status: 'fail' }  // ❌ Mais le log dit "fail"
                        )
                    });
                } else {
                    res.status(200).json({ message: 'Fiche modifiée' });
                    return Logs.updateOne(
                        { _id: savedLog._id },
                        { status: 'done' },
                    )
                }
            })
            .catch(() => {
                res.status(400).json({ message: 'Log non sauvegardé' });
            })
        }
    })
    .catch(() => {
        res.status(400).json({ message: 'Fiche non modifiée' });
    })
}

export const deleteBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id})
    .then((book) => {
        if (book.userId != req.auth.userId) {
            res.status(401).json({ message: 'Non autorisé'})
        } else {
            let savedLogId;
            const filename = book.imageUrl.split('/images/')[1];
            const logs = new Logs({
                userId: req.auth.userId,
                bookId: req.params.id,
                action: 'deleted',
                oldImage: filename,
                status: 'in progress',
            })
            logs.save()
            .then((savedLog) => {
                savedLogId = savedLog._id;
                return Book.deleteOne({ _id: req.params.id })
            })
            .then(() => {
                return fs.promises.unlink(`images/${filename}`)  // ← Changer ici
                .then(() => {
                    res.status(200).json({ message: 'Supprimé' });
                    return Logs.updateOne(
                        { _id: savedLogId },
                        { status: 'done' }
                    )
                })
                .catch(error => {
                    console.error('Erreur suppression ancienne image:', error);
                    res.status(200).json({ message: 'Supprimé' });
                    return Logs.updateOne(
                        { _id: savedLogId },
                        { status: 'fail' }
                    )
                });
            })
            .catch(error => res.status(400).json({ error }));
        }
    })
    .catch(error => res.status(400).json({ error }));
}

export const updateRating = (req, res, next) => {
    Book.findOne({ _id: req.params.id})
    .then((book) => {
        const dejaNote = book.ratings.some(r => r.userId === req.auth.userId);
        // Ici on utilise la méthode some qui retourne true si au moins un élément satisfait la condition
        if (dejaNote) {
            return res.status(400).json({ message: 'Vous avez déjà noté ce livre' });
        }
        book.ratings.push({ userId: req.auth.userId, grade: req.body.rating });

        const total = book.ratings.reduce((acc, r) => acc + r.grade, 0);
        book.averageRating = Math.round((total / book.ratings.length) * 2) / 2;

        return book.save();
    })
    .then((book) => {
        if(book) {
            res.status(200).json(book);
            Logs.updateOne(
                { _id: book._id },
                { status: 'done' },
            )
            .catch(error => {
                console.log(error);
            })
        }
    })
    .catch(error => res.status(400).json({ error }));
}

export const bestRating = (req, res, next) => {
    Book.find()
    .sort({ averageRating: -1 })
    .limit(3)
    .then(books => res.status(200).json(books))
    .catch(error => res.status(400).json({ error }));
}