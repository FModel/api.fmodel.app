import express from 'express';
import infosService from '../services/infos.service';

class InfosMiddleware {
    async validateInfoDoesntExistAlready(req: express.Request, res: express.Response, next: express.NextFunction) {
        const infos = await infosService.list(5, 0);
        if (infos.length < 1) {
            next();
        } else {
            res.status(400).send({ errors: [`An info already exists, please PATCH it instead`] });
        }
    }

    async validateInfoExist(req: express.Request, res: express.Response, next: express.NextFunction) {
        const info = await infosService.getById(req.params.infoId);
        if (info) {
            next();
        } else {
            res.status(400).send({ errors: [`Info '${req.params.infoId}' doesn't exist yet, please POST it instead`] });
        }
    }
}

export default new InfosMiddleware();