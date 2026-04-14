import { describe, it, expect, vi, beforeEach } from 'vitest';
import validateBookYear from '../middleware/validateBookYear.js';

// Mock du service createLog pour ne pas toucher la BDD
vi.mock('../services/createLog.js', () => ({
    createLog: vi.fn().mockResolvedValue(undefined),
}));

function makeRes() {
    const res = {};
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res;
}

describe('middleware validateBookYear', () => {

    it('année valide dans req.body → appelle next()', async () => {
        const req = { body: { year: 2020 }, auth: { userId: 'user1' } };
        const res = makeRes();
        const next = vi.fn();

        await validateBookYear(req, res, next);

        expect(next).toHaveBeenCalledOnce();
        expect(res.status).not.toHaveBeenCalled();
    });

    it('année valide dans req.body.book (JSON stringifié) → appelle next()', async () => {
        const req = { body: { book: JSON.stringify({ year: 1995 }) }, auth: { userId: 'user1' } };
        const res = makeRes();
        const next = vi.fn();

        await validateBookYear(req, res, next);

        expect(next).toHaveBeenCalledOnce();
    });

    it('année décimale → 400', async () => {
        const req = { body: { year: 2020.5 }, auth: { userId: 'user1' } };
        const res = makeRes();
        const next = vi.fn();

        await validateBookYear(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(next).not.toHaveBeenCalled();
    });

    it('année en string non numérique → 400', async () => {
        const req = { body: { year: 'abc' }, auth: { userId: 'user1' } };
        const res = makeRes();
        const next = vi.fn();

        await validateBookYear(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(next).not.toHaveBeenCalled();
    });

    it('année décimale avec fichier uploadé → 400 et log créé', async () => {
        const { createLog } = await import('../services/createLog.js');
        const req = {
            body: { year: 2020.5 },
            auth: { userId: 'user1' },
            file: { filename: 'image123.webp' },
        };
        const res = makeRes();
        const next = vi.fn();

        await validateBookYear(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(createLog).toHaveBeenCalledWith(expect.objectContaining({
            action: 'deleted',
            status: 'fail',
            content: { filename: 'image123.webp' },
        }));
    });

});