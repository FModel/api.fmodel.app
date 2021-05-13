import express from 'express';
import designsService from '../services/designs.service';

class DesignsMiddleware {
    async validateDesignExists(req: express.Request, res: express.Response, next: express.NextFunction) {
        const design = await designsService.getById(req.params.designId);
        if (design) {
            next();
        } else {
            res.status(404).send({ errors: [`Design ${req.params.designId} doesn't exist yet, please POST it instead`] });
        }
    }

    async validateDesignDoesntAlreadyExist(req: express.Request, res: express.Response, next: express.NextFunction) {
        const design = await designsService.getDesignByName(req.body.name);
        if (design) {
            res.status(400).send({ errors: [`Design '${req.body.name}' already exists, please PATCH it instead`] });
        } else {
            next();
        }
    }
}

export default new DesignsMiddleware();