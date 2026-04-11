import Book from '../model/Book.js';

export async function getBooks(req, res, next) {
    try {
        const books = await Book.find();
        res.status(200).json(books);
    } catch(error) {
        console.log(error);
        res.status(400).json({ message: 'Erreur dans la récupération des données' });
    }
}

export async function getBookById(req,res, next) {
    try {
        const book = await Book.findOne({ _id: req.params.id });
        res.status(200).json(book);
    } catch(error) {
        console.log(error);
        res.status(400).json({ message: 'Erreur dans la récupération des données' });
    }
}

export async function getBestRating(req, res, next) {
    try {
        const books = await Book.find()
        .sort({ averageRating: -1 }) // Trie par ordre décroissant
        .limit(3);
        res.status(200).json(books);
    } catch(error) {
        console.log(error);
        res.status(400).json({ message: 'Erreur dans la récupération des données' });
    }

}