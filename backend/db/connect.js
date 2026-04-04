import mongoose from 'mongoose';

export default function connect() {
    mongoose.connect('mongodb://127.0.0.1:27017/mon-vieux-grimoire')
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(() => console.log('Connexion à MongoDB échouée !'));
}