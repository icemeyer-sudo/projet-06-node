import Logs from '../model/Logs.js';

export function createLog(dataLog) {
    const logs = new Logs({
        userId: dataLog.userId,
        bookId: dataLog.bookId,
        target: dataLog.target,
        action: dataLog.action,
        status: dataLog.status,
        content: dataLog.content,
    });
    return logs.save();
}