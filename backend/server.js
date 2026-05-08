import express from 'express';
import userRoutes from './routes/user.js';
import bookRoutes from './routes/book.js';
import cors from 'cors';
import connect from './db/connect.js'
import path from 'path';
import { fileURLToPath } from 'url';
import { startCleanOrphanImagesCron } from './services/cleanOrphanImages.js';

const port = process.env.PORT || 4000;
const app = express();
connect(); // Connexion à la base de donnée

startCleanOrphanImagesCron();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use('/images', express.static(path.join(__dirname, '../images')));

app.use(express.json());
app.use(cors());
app.use('/api/auth', userRoutes);
app.use('/api/books', bookRoutes);

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); // modifier pour ne permettre que le frontend à se connecter
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

// Vérification test pour savoir si le serveur est en ligne et accessible
// À supprimer
app.get("/", (req, res) => {
    res.status(200).send("Hello World");
});

// Permet de gérer les erreurs pendant les middlewares
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(400).json({ error: err.message });
});

// Obligatoire, permet l'écoute des requêtes entrantes
app.listen(port, () => {
    console.log(`Serveur démarré sur le port ${port}`);
});