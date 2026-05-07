import cron from 'node-cron';
import fs from 'fs';
import Logs from '../model/Logs.js';

export function startCleanOrphanImagesCron() {

    // Mettre * * * * *  pour tester toutes les minutes
    // Mettre 0 2 * * * pour tous jours à 2h am
    cron.schedule('0 2 * * *', async () => {
        console.log('CRON : Nettoyage des images...');
        try {
            const logs = await failedLogs();
            for (const log of logs) {
                const success = await deleteImage(log.content.filename);
                if(success) {
                    log.status = 'done';
                    await updateLog(log);
                    console.log(log.content.filename + ' is deleted');
                }
            };
            console.log('CRON : Toutes les images ont été supprimées');
        } catch(error) {
            console.error('CRON interrompu :', error);
        }
    });
}

async function failedLogs() {
    try {
        const logs = await Logs.find({
            status: 'fail',
            'content.filename': { $exists: true },
        });
        return logs;
    } catch(error) {
        console.error(error);
        throw error;
    }
}

async function deleteImage(filename) {
    try {
        await fs.promises.unlink(`images/${filename}`)
        return true;
    } catch(error) {
        console.error(error);
        return false;
    }
}

async function updateLog(log) {
    try {
        await Logs.updateOne({ _id: log._id });
    } catch(error) {
        console.error(error);
    }
}