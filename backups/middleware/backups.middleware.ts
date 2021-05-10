import express from 'express';
import backupService from '../services/backups.service';

class BackupsMiddleware {
    async validateBackupExist(req: express.Request, res: express.Response, next: express.NextFunction) {
        const backup = await backupService.getById(req.params.backupId);
        if (backup) {
            next();
        } else {
            res.status(400).send({ errors: [`Backup '${req.params.backupId}' doesn't exist yet, please POST it instead`] });
        }
    }
    
    async validateBackupDoesntAlreadyExist(req: express.Request, res: express.Response, next: express.NextFunction) {
        const backup = await backupService.getBackupByFileNameAndSize(req.body.fileName, req.body.fileSize);
        if (backup) {
            res.status(400).send({ errors: [`Backup '${req.body.fileName}' already exists, please PATCH it instead`] });
        } else {
            next();
        }
    }
}

export default new BackupsMiddleware();