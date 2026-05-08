import { createLog } from '../services/createLog.js';

async function validateBookYear(req, res, next) {
    let bookData;
    if(req.body.book) {
        bookData = JSON.parse(req.body.book);
    } else {
        bookData = req.body;
    }
    const year = Number(bookData.year);
    if (!Number.isInteger(year)) {
        if (req.file) {
            const dataLog = {
                userId: req.auth.userId,
                action: 'deleted',
                status: 'fail',
                content: {filename: req.file.filename },
                target: 'book',
            };
            await createLog(dataLog);
        }
        return res.status(400).json({ message: 'L\'année doit être un nombre entier' });
    }
    next();
}

export default validateBookYear;