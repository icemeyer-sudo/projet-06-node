import { describe, it, expect, vi, beforeEach } from 'vitest';
import { signup, login } from '../controller/user.js';

// vi.hoisted garantit que mockSave est disponible dans le factory vi.mock
const mockSave = vi.hoisted(() => vi.fn());

vi.mock('../model/User.js', () => ({
    default: vi.fn().mockImplementation(function() {
        this.save = mockSave;
    }),
}));

vi.mock('bcrypt', () => ({
    default: {
        hash: vi.fn(),
        compare: vi.fn(),
    },
}));

vi.mock('jsonwebtoken', () => ({
    default: {
        sign: vi.fn().mockReturnValue('fake_token'),
    },
}));

import User from '../model/User.js';
import bcrypt from 'bcrypt';

function makeRes() {
    const res = {};
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res;
}

beforeEach(() => {
    vi.clearAllMocks();
    process.env.JWT_SECRET = 'secret_de_test';
});

// ───── SIGNUP ─────────────────────────────────────────────

describe('signup', () => {

    it('inscription réussie → 201', async () => {
        bcrypt.hash.mockResolvedValue('hash_mdp');
        mockSave.mockResolvedValue(undefined); // contrôle ici, plus besoin de User.mockImplementation

        const req = { body: { email: 'test@test.com', password: 'motdepasse' } };
        const res = makeRes();

        await signup(req, res);

        expect(bcrypt.hash).toHaveBeenCalledWith('motdepasse', 10);
        expect(mockSave).toHaveBeenCalledOnce();
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({ message: 'Utilisateur créé' });
    });

    it('email déjà existant (save échoue) → 400', async () => {
        bcrypt.hash.mockResolvedValue('hash_mdp');
        mockSave.mockRejectedValue(new Error('duplicate key'));

        const req = { body: { email: 'existe@test.com', password: 'motdepasse' } };
        const res = makeRes();

        await signup(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('erreur bcrypt → 500', async () => {
        bcrypt.hash.mockRejectedValue(new Error('erreur bcrypt'));

        const req = { body: { email: 'test@test.com', password: 'motdepasse' } };
        const res = makeRes();

        await signup(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });

});

// ───── LOGIN ──────────────────────────────────────────────

describe('login', () => {

    it('email introuvable → 401', async () => {
        User.findOne = vi.fn().mockResolvedValue(null);

        const req = { body: { email: 'inconnu@test.com', password: 'motdepasse' } };
        const res = makeRes();

        await login(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
    });

    it('mauvais mot de passe → 401', async () => {
        User.findOne = vi.fn().mockResolvedValue({ _id: 'user1', password: 'hash_mdp' });
        bcrypt.compare.mockResolvedValue(false);

        const req = { body: { email: 'test@test.com', password: 'mauvais' } };
        const res = makeRes();

        await login(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
    });

    it('login valide → retourne userId et token', async () => {
        User.findOne = vi.fn().mockResolvedValue({ _id: 'user1', password: 'hash_mdp' });
        bcrypt.compare.mockResolvedValue(true);

        const req = { body: { email: 'test@test.com', password: 'motdepasse' } };
        const res = makeRes();

        await login(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            userId: 'user1',
            token: 'fake_token',
        }));
    });

    it('erreur BDD → 500', async () => {
        User.findOne = vi.fn().mockRejectedValue(new Error('erreur BDD'));

        const req = { body: { email: 'test@test.com', password: 'motdepasse' } };
        const res = makeRes();

        await login(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });

});