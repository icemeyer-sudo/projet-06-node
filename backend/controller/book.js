import Book from '../model/Book.js';
import fs from 'fs';

export const createBook = (req, res, next) => {
    const bookObject = JSON.parse(req.body.book);

    // Suppression de _id et _userId en cas d'action malveillante
    delete bookObject._id;
    delete bookObject._userId;

    const book = new Book({
        ...bookObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });

    book.save()
    .then (() => res.status(201).json({ message: 'Livre créé'}))
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
    // Suppression de _userId en cas d'action malveillante
    delete bookObject._userId;

    Book.findOne({ _id: req.params.id })
    .then((book) => {
        if (book.userId != req.auth.userId) {
            res.status(401).json({ message: 'Non autorisé'})
        } else {
            const oldFilename = book.imageUrl.split('/images/')[1];
            Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
            .then(() => {
                if (req.file) {
                    fs.unlink(`images/${oldFilename}`, (err) => {
                        if (err) console.error('Erreur suppression ancienne image:', err);
                    });
                }
                res.status(200).json({ message: 'Fiche modifiée' });
            })
            .catch(error => {
                res.status(400).json({ error });
            })
        }
    })
    .catch(error => {
        res.status(400).json({ error });
    })
}

export const deleteBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id})
    .then((book) => {
        if (book.userId != req.auth.userId) {
        res.status(401).json({ message: 'Non autorisé'})
        } else {
            const filename = book.imageUrl.split('/images/')[1];
            Book.deleteOne({ _id: req.params.id })
            .then(() => {
                fs.unlink(`images/${filename}`, (err) => {
                    if (err) console.error('Erreur suppression ancienne image:', err);
                });
                res.status(200).json({ message: 'Supprimé' });
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
        if(book) res.status(200).json(book);
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