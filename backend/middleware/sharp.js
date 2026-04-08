import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

const optimizeImage = (req, res, next) => {
    if (!req.file) { return next(); }

    const filename = req.file.filename; // Récupère le nom du fichier donné par multer en UUID
    const filepath = path.join(process.cwd(), 'images', filename); // Construit le chemin absolu
    const webpFilepath = filepath.replace(/\.[^.]+$/, '.webp'); // Construit le chemin vers la nouvelle image en .webp
    // webpFilepath n'est qu'un string qui contient le chemin de la future image que sharp va créer

    sharp(filepath) // Charge l'image
    .resize(800)
    .webp({ quality: 80 })
    .toFile(webpFilepath) // Sauvegarde le fichier à l'emplacement défini par webpFilepath
    .then(() => { // Une fois que c'est fait
        fs.unlink(filepath, () => {}); // Supprime l'ancien fichier
        req.file.filename = path.basename(webpFilepath); // Modifie req.file.filename avec le chemin du nouveau fichier
        next();
    })
    .catch((err) => { // Si ça échoue
        fs.unlink(filepath, () => {}); // Supprime le fichier si ce n'était pas une image
        next(err);
    });
}

export default optimizeImage;