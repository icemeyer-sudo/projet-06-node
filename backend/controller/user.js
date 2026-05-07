import 'dotenv/config';
import bcrypt from 'bcrypt';
import User from '../model/User.js';
import jwt from 'jsonwebtoken';

export const signup = (req, res, next) => {
    return bcrypt.hash(req.body.password, 10)
    .then(hash => {
        const user = new User({
            email: req.body.email,
            password: hash
        });
        return user.save()
        .then (() => {
            res.status(201).json({ message: 'Utilisateur créé'})}
        )
        .catch(error => res.status(400).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
};

export const login = (req, res, next) => {
    return User.findOne({email: req.body.email})
    .then(user => {
        if(user === null) {
            res.status(401).json({ message: 'Paire idenfiant/mdp incorrecte'});
        } else {
            return bcrypt.compare(req.body.password, user.password)
            .then(valid => {
                if(!valid) {
                    res.status(401).json({ message: 'Paire identifiant/mdp incorrecte'});
                } else {
                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign(
                            { userId: user._id },
                            process.env.JWT_SECRET,
                            { expiresIn: '24h' }
                        )
                    });
                }
            })
            .catch(error => {
                res.status(500).json({ error });
            })
        }
    })
    .catch(error => {
        res.status(500).json({ error });
    })
};