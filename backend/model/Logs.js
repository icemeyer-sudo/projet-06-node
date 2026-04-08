import mongoose from 'mongoose';

const logsSchema = mongoose.Schema({
    userId: { type: String, required: true }, // Id de l'utilisateur
    oldImage: { type: String }, // Nom du fichier remplacé si existe
    bookId: { type: String, required: true },
    action: {
        type: String,
        enum: ['created', 'updated', 'deleted'],
        required: true
    },
    date: { type: Date, default: Date.now },
    status: {
        type: String,
        enum: ['in progress', 'done', 'fail'],
        required: true
    },
});

logsSchema.index({ date: 1 }, { expireAfterSeconds: 30*24*60*60 });

export default mongoose.model('Logs', logsSchema);