import Book from '../model/Book.js';
import Logs from '../model/Logs.js';

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