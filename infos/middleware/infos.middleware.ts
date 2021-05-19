import express from 'express';
import infosService from '../services/infos.service';

class InfosMiddleware {
    async validateInfoDoesntAlreadyExist(req: express.Request, res: express.Response, next: express.NextFunction) {
        const info = await infosService.getByMode(req.body.mode);
        if (info) {
            res.status(400).send({ errors: [`An info in '${req.body.mode}' mode already exists, please PATCH it instead`] });
        } else {
            next();
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