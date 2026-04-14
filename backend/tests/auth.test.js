import { describe, it, expect, vi, beforeEach } from 'vitest';
import jwt from 'jsonwebtoken';
import auth from '../middleware/auth.js';

// Simule les objets Express req, res, next
function makeReq(authHeader) {
    return { headers: { authorization: authHeader } };
}

function makeRes() {
    const res = {};
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res;
}

const JWT_SECRET = 'secret_de_test';

beforeEach(() => {
    process.env.JWT_SECRET = JWT_SECRET;
});

describe('middleware auth', () => {

    it('token valide → appelle next() et définit req.auth.userId', () => {
        const token = jwt.sign({ userId: 'user123' }, JWT_SECRET);
        const req = makeReq(`Bearer ${token}`);
        const res = makeRes();
        const next = vi.fn();

        auth(req, res, next);

        expect(next).toHaveBeenCalledOnce();
        expect(req.auth.userId).toBe('user123');
    });

    it('token absent → 401', () => {
        const req = makeReq(undefined);
        const res = makeRes();
        const next = vi.fn();

        auth(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(next).not.toHaveBeenCalled();
    });

    it('token malformé → 401', () => {
        const req = makeReq('Bearer token_invalide');
        const res = makeRes();
        const next = vi.fn();

        auth(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(next).not.toHaveBeenCalled();
    });

    it('token signé avec un mauvais secret → 401', () => {
        const token = jwt.sign({ userId: 'user123' }, 'mauvais_secret');
        const req = makeReq(`Bearer ${token}`);
        const res = makeRes();
        const next = vi.fn();

        auth(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(next).not.toHaveBeenCalled();
    });

    it('token expiré → 401', () => {
        const token = jwt.sign({ userId: 'user123' }, JWT_SECRET, { expiresIn: '1ms' });
        // Attend que le token expire
        return new Promise(resolve => setTimeout(() => {
            const req = makeReq(`Bearer ${token}`);
            const res = makeRes();
            const next = vi.fn();

            auth(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(next).not.toHaveBeenCalled();
            resolve();
        }, 10));
    });

});