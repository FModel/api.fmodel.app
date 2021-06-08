import express from 'express';
import backupsService from '../services/backups.service';
import debug from "debug";

const log: debug.IDebugger = debug('app:backups-controllers');

class BackupsController {
    async listBackups(req: express.Request, res: express.Response) {
        const backups = await backupsService.list(25, 0);
        res.status(200).send(backups);
    }
    
    async listBackupsByGame(req: express.Request, res: express.Response) {
        const backups = await backupsService.listByGame(req.params.gameName, 5);
        res.status(200).send(backups);
    }
    
    async getBackupById(req: express.Request, res: express.Response) {
        const backup = await backupsService.getById(req.params.backupId);
        res.status(200).send(backup);
    }
    
    async createBackup(req: express.Request, res: express.Response) {
        const backupId = await backupsService.create(req.body);
        res.status(201).send({ id: backupId });
    }
    
    async patch(req: express.Request, res: express.Response) {
        log(await backupsService.patchById(req.params.backupId, req.body));
        res.status(204).send();
    }

    async put(req: express.Request, res: express.Response) {
        log(await backupsService.putById(req.params.backupId, req.body));
        res.status(204).send();
    }
    
    async removeBackup(req: express.Request, res: express.Response) {
        log(await backupsService.deleteById(req.params.backupId));
        res.status(204).send();
    }
}

export default new BackupsController();