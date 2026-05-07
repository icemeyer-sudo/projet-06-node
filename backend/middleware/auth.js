import 'dotenv/config';
import jwt from 'jsonwebtoken';

const auth = (req, res, next) => {
    try {
        if(!req.headers.authorization) {
            return res.status(401);
        }
        const token = req.headers.authorization.split(' ')[1];
        if(!token) {
            return res.status(401);
        }
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        req.auth = {
            userId: decodedToken.userId
        };
        next();
    } catch (error) {
        return res.status(401);
    }
};

export default auth;