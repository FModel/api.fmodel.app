import express from "express";
import newsService from '../services/news.service';

class NewsMiddleware {
    async validateVersionExist(req: express.Request, res: express.Response, next: express.NextFunction) {
        const news = await newsService.getNewsByVersion(req.params.version); // WATCH OUT, WE GRAB THE VERSION FROM THE PARAMS
        if (news) {
            next();
        } else {
            res.status(400).send({ errors: [`News '${req.params.version}' doesn't exists, please POST it instead`] });
        }
    }
    
    async validateVersionDoesntAlreadyExist(req: express.Request, res: express.Response, next: express.NextFunction) {
        const news = await newsService.getNewsByVersion(req.body.version);
        if (news) {
            res.status(400).send({ errors: ['News already exists, please PUT it instead'] });
        } else {
            next();
        }
    }
    
    async validateNewsIsComplete(req: express.Request, res: express.Response, next: express.NextFunction) {
        if (req.body.messages.length === req.body.colors.length && req.body.colors.length === req.body.newLines.length) {
            next();
        }
        else {
            res.status(400).send({ errors: ['News is corrupted'] });
        }
    }
}


export default new NewsMiddleware();