import mongoose from 'mongoose';

const logsSchema = mongoose.Schema({
    userId: { type: String, required: true },
    bookId: { type: String },
    target: {
        type: String,
        enum: ['book', 'image'],
        required: true,
    },
    action: {
        type: String,
        enum: ['created', 'updated', 'updatedRating', 'deleted'],
        required: true
    },
    date: { type: Date, default: Date.now },
    status: {
        type: String,
        enum: ['done', 'fail'],
        required: true
    },
    content: { type: Object },
});

// ---- Supprime les logs vieux de 30 jours ---- //
// ---- Effectué toutes les 60 secondes     ---- //
logsSchema.index({ date: 1 }, { expireAfterSeconds: 30*24*60*60 });

export default mongoose.model('Logs', logsSchema);