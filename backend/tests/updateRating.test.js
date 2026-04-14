import { describe, it, expect, vi, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import { updateRating } from '../controller/updateRating.js';

// Mock du modèle Book et du service createLog
vi.mock('../model/Book.js', () => ({
    default: {
        findOne: vi.fn(),
    },
}));

vi.mock('../services/createLog.js', () => ({
    createLog: vi.fn().mockResolvedValue(undefined),
}));

import Book from '../model/Book.js';

function makeRes() {
    const res = {};
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res;
}

function makeValidId() {
    return new mongoose.Types.ObjectId().toString();
}

beforeEach(() => {
    vi.clearAllMocks();
});

describe('updateRating', () => {

    it('ID invalide → 400', async () => {
        const req = { params: { id: 'id_invalide' }, auth: { userId: 'user1' }, body: { rating: 4 } };
        const res = makeRes();

        await updateRating(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'ID invalide' }));
    });

    it('utilisateur a déjà noté → 400', async () => {
        const userId = 'user1';
        const bookId = makeValidId();
        const fakeBook = {
            _id: bookId,
            ratings: [{ userId, grade: 3 }],
            averageRating: 3,
            save: vi.fn(),
        };
        Book.findOne.mockResolvedValue(fakeBook);

        const req = { params: { id: bookId }, auth: { userId }, body: { rating: 4 } };
        const res = makeRes();

        await updateRating(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Vous avez déjà noté ce livre' }));
        expect(fakeBook.save).not.toHaveBeenCalled();
    });

    it('première note → note ajoutée, averageRating recalculé, 200', async () => {
        const bookId = makeValidId();
        const fakeBook = {
            _id: bookId,
            ratings: [{ userId: 'autreUser', grade: 4 }],
            averageRating: 4,
            save: vi.fn().mockResolvedValue(undefined),
            push: undefined,
        };
        // push doit fonctionner sur le tableau ratings
        Book.findOne.mockResolvedValue(fakeBook);

        const req = { params: { id: bookId }, auth: { userId: 'user1' }, body: { rating: 2 } };
        const res = makeRes();

        await updateRating(req, res);

        expect(fakeBook.save).toHaveBeenCalledOnce();
        expect(fakeBook.averageRating).toBe(3); // (4 + 2) / 2 = 3
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('calcul de la moyenne arrondi à 0.5 près', async () => {
        const bookId = makeValidId();
        const fakeBook = {
            _id: bookId,
            ratings: [
                { userId: 'user2', grade: 4 },
                { userId: 'user3', grade: 3 },
            ],
            averageRating: 3.5,
            save: vi.fn().mockResolvedValue(undefined),
        };
        Book.findOne.mockResolvedValue(fakeBook);

        const req = { params: { id: bookId }, auth: { userId: 'user1' }, body: { rating: 2 } };
        const res = makeRes();

        await updateRating(req, res);

        // (4 + 3 + 2) / 3 = 3 → arrondi à 0.5 près = 3
        expect(fakeBook.averageRating).toBe(3);
    });

    it('erreur BDD → 400', async () => {
        const bookId = makeValidId();
        Book.findOne.mockRejectedValue(new Error('Erreur BDD'));

        const req = { params: { id: bookId }, auth: { userId: 'user1' }, body: { rating: 4 } };
        const res = makeRes();

        await updateRating(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });

});