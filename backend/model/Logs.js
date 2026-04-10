import mongoose from 'mongoose';

const logsSchema = mongoose.Schema({
    userId: { type: String, required: true },
    bookId: { type: String, required: true },
    action: {
        type: String,
        enum: ['created', 'updated', 'deleted', 'deletedImage'],
        required: true
    },
    date: { type: Date, default: Date.now },
    status: {
        type: String,
        enum: ['done', 'fail'],
        required: true
    },
});

logsSchema.index({ date: 1 }, { expireAfterSeconds: 30*24*60*60 });

export default mongoose.model('Logs', logsSchema);