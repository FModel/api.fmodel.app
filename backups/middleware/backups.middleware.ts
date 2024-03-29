﻿import express from 'express';
import backupsService from '../services/backups.service';

class BackupsMiddleware {
    async validateBackupExist(req: express.Request, res: express.Response, next: express.NextFunction) {
        const backup = await backupsService.getById(req.params.backupId);
        if (backup) {
            next();
        } else {
            res.status(400).send({ errors: [`Backup '${req.params.backupId}' doesn't exist yet, please POST it instead`] });
        }
    }
    
    async validateBackupDoesntAlreadyExist(req: express.Request, res: express.Response, next: express.NextFunction) {
        const backup = await backupsService.getBackupByFileName(req.body.fileName);
        if (backup) {
            res.status(400).send({ errors: [`Backup '${req.body.fileName}' already exists, please PATCH it instead`] });
        } else {
            next();
        }
    }
}

export default new BackupsMiddleware();