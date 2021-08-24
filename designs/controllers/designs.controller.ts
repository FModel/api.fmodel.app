import express from 'express';
import designsService from '../services/designs.service';
import debug from 'debug';

const log: debug.IDebugger = debug('app:designs-controllers');

class DesignsController {
    async listDesigns(req: express.Request, res: express.Response) {
        const designs = await designsService.list();
        res.status(200).send(designs);
    }

    async getDesignById(req: express.Request, res: express.Response) {
        const design = await designsService.getById(req.params.designId);
        res.status(200).send(design);
    }

    async getDesignByName(req: express.Request, res: express.Response) {
        const design = await designsService.getDesignByName(req.params.designName);
        if (design) {
            res.status(200).send(design);
        } else {
            res.status(404).send({ errors: [`Design '${req.params.designName}' doesn't exist`] });
        }
    }

    async createDesign(req: express.Request, res: express.Response) {
        try {
            const designId = await designsService.create(req.body);
            res.status(201).send({ id: designId });
        } catch (err) {
            return res.status(500).send();
        }
    }

    async patch(req: express.Request, res: express.Response) {
        log(await designsService.patchById(req.params.designId, req.body));
        res.status(204).send();
    }

    async put(req: express.Request, res: express.Response) {
        log(await designsService.putById(req.params.designId, req.body));
        res.status(204).send();
    }

    async removeDesign(req: express.Request, res: express.Response) {
        log(await designsService.deleteById(req.params.designId));
        res.status(204).send();
    }
}

export default new DesignsController();