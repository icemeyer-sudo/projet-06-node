# Projet 06 - Application de Gestion de Livres

Une API Node.js/Express pour gérer une bibliothèque de livres avec authentification utilisateur, notations et gestion d'images.

## 🚀 Fonctionnalités

- **Authentification** : Inscription et connexion utilisateurs
- **Gestion de livres** : Créer, lire, mettre à jour et supprimer des livres
- **Notations** : Permettre aux utilisateurs de noter les livres
- **Gestion d'images** : Upload et optimisation d'images pour les couvertures
- **Nettoyage automatique** : Suppression des images orphelines via cron job
- **Logs** : Enregistrement des actions importantes
- **CORS** : Support des requêtes cross-origin

## 📋 Prérequis

- Node.js (version 14+)
- npm
- Base de données (MongoDB ou autre selon votre configuration)

## 📦 Installation

```bash
npm install
```

## 🔧 Configuration

Créez un fichier `.env` à la racine du projet avec les variables nécessaires :

```
PORT=4000
MONGODB_URI=votre_uri_mongodb
JWT_SECRET=votre_secret_jwt
```

## ▶️ Démarrage

```bash
npm start
```

Le serveur démarre sur `http://localhost:4000`

## 📂 Structure du projet

```
backend/
├── controller/       # Logique métier
├── routes/          # Définition des routes
├── middleware/      # Middlewares (auth, validation, etc.)
├── model/           # Modèles de données
├── db/              # Connexion base de données
├── services/        # Services utilitaires
└── tests/           # Tests unitaires
images/              # Stockage des images
```

## 🔌 API Endpoints

### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion

### Livres
- `GET /api/books` - Récupérer tous les livres
- `GET /api/books/:id` - Récupérer un livre
- `POST /api/books` - Créer un livre
- `PUT /api/books/:id` - Mettre à jour un livre
- `DELETE /api/books/:id` - Supprimer un livre
- `PATCH /api/books/:id/rating` - Mettre à jour la note

## 🧪 Tests

```bash
npm test
```

## ⚙️ Middlewares

- **auth.js** : Authentification par token JWT
- **multer.js** : Gestion des uploads de fichiers
- **sharp.js** : Optimisation d'images
- **validateBookYear.js** : Validation de l'année des livres

## 🧹 Maintenance

Le projet inclut un service de nettoyage automatique qui supprime les images orphelines via un cron job.

## 📝 Licence

Projet éducatif - OpenClassroom
