import express from "express";
import gamesUtils from "../games.utils";
import gamesService from "../services/games.service";
import dictionariesService from "../../common/services/dictionaries.service";

class GamesMiddleware {
    async validateGameExist(req: express.Request, res: express.Response, next: express.NextFunction) {
        const game = await gamesService.getById(req.params.gameId);
        if (game) {
            next();
        } else {
            res.status(400).send({ errors: [`Game '${req.params.gameId}' doesn't exist yet, please POST it instead`] });
        }
    }

    async validateGameExistByName(req: express.Request, res: express.Response, next: express.NextFunction) {
        const game = await gamesService.getByGameName(req.params.gameName);
        if (game) {
            next();
        } else {
            res.status(400).send({ errors: [`Game '${req.params.gameName}' doesn't exist yet, please POST it instead`] });
        }
    }

    async validateGameDoesntAlreadyExist(req: express.Request, res: express.Response, next: express.NextFunction) {
        const game = await gamesService.getByGameName(req.body.gameName);
        if (game) {
            res.status(400).send({ errors: [`Game '${req.body.gameName}' already exist, please PATCH it instead`] });
        } else {
            next();
        }
    }

    async validateVersionExist(req: express.Request, res: express.Response, next: express.NextFunction) {
        const game = await gamesService.getByGameName(req.params.gameName);
        const versions = await gamesService.getVersionsByJoinId(game._id);
        const v = await versions.find((x: { gameVersion: string; }) => x.gameVersion == req.body.gameVersion);
        if (v) {
            next();
        } else {
            res.status(400).send({ errors: [`Game '${req.params.gameName}' doesn't have a '${req.body.gameVersion}' version yet, please POST it instead`] });
        }
    }

    async validateVersionDoesntAlreadyExist(req: express.Request, res: express.Response, next: express.NextFunction) {
        const game = await gamesService.getByGameName(req.params.gameName);
        const versions = await gamesService.getVersionsByJoinId(game._id);
        const v = await versions.find((x: { gameVersion: string; }) => x.gameVersion == req.body.gameVersion);
        if (v) {
            res.status(400).send({ errors: [`Game '${req.params.gameName}' already has a '${req.body.gameVersion}' version, please PATCH it instead`] });
        } else {
            next();
        }
    }

    async validateDictKeyExist(req: express.Request, res: express.Response, next: express.NextFunction) {
        const game = await gamesService.getByGameName(req.params.gameName);
        const versions = await gamesService.getVersionsByJoinId(game._id);
        const v = await versions.find((x: { gameVersion: string; }) => x.gameVersion == req.body.gameVersion);
        const index = gamesUtils.getFieldIndex(req.body.fieldName);
        
        const kvp = await dictionariesService.getByKey(`${v._id}_${index}`, req.body.key);
        if (kvp) {
            next();
        } else {
            res.status(400).send({ errors: [`Key '${req.body.key}' doesn't have a '${req.body.gameVersion}' version yet, please POST it instead`] });
        }
    }

    async validateDictKeyDoesntAlreadyExist(req: express.Request, res: express.Response, next: express.NextFunction) {
        const game = await gamesService.getByGameName(req.params.gameName);
        const versions = await gamesService.getVersionsByJoinId(game._id);
        const v = await versions.find((x: { gameVersion: string; }) => x.gameVersion == req.body.gameVersion);
        const index = gamesUtils.getFieldIndex(req.body.fieldName);
        
        const kvp = await dictionariesService.getByKey(`${v._id}_${index}`, req.body.key);
        if (kvp) {
            res.status(400).send({ errors: [`Key '${req.body.key}' already exist, please PATCH it instead`] });
        } else {
            next();
        }
    }
}

export default new GamesMiddleware();