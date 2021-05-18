import express from 'express';
import infosService from '../services/infos.service';
import debug from 'debug';

const log: debug.IDebugger = debug('app:infos-controllers');

class InfosController {
    async listInfos(req: express.Request, res: express.Response) {
        const info = await infosService.list(1, 0);
        res.status(200).send(info[0]);
    }

    async getInfoById(req: express.Request, res: express.Response) {
        const info = await infosService.getById(req.params.infoId);
        res.status(200).send(info);
    }

    async createInfo(req: express.Request, res: express.Response) {
        const infoId = await infosService.create(req.body);
        res.status(201).send({ id: infoId });
    }

    async patch(req: express.Request, res: express.Response) {
        log(await infosService.patchById(req.params.infoId, req.body));
        res.status(204).send();
    }

    async put(req: express.Request, res: express.Response) {
        log(await infosService.putById(req.params.infoId, req.body));
        res.status(204).send();
    }

    async removeInfo(req: express.Request, res: express.Response) {
        log(await infosService.deleteById(req.params.infoId));
        res.status(204).send();
    }
}

export default new InfosController();