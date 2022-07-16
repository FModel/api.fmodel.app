import express from "express";
import newsService from '../services/news.service';

class NewsMiddleware {
    async validateVersionExist(req: express.Request, res: express.Response, next: express.NextFunction) {
        const news = await newsService.getNewsByVersionAndGame(req.params.version, req.body.game); // WATCH OUT, WE GRAB THE VERSION FROM THE PARAMS
        if (news) {
            next();
        } else {
            res.status(400).send({ errors: [`News '${req.params.version}' for game '${req.body.game}' doesn't exists, please POST it instead`] });
        }
    }
    
    async validateVersionDoesntAlreadyExist(req: express.Request, res: express.Response, next: express.NextFunction) {
        const news = await newsService.getNewsByVersionAndGame(req.body.version, req.body.game);
        if (news) {
            res.status(400).send({ errors: [`News '${req.body.version}' for game '${req.body.game}' already exists, please PUT it instead`] });
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