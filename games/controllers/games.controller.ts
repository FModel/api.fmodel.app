import express from 'express';
import gamesService from '../services/games.service';
import debug from "debug";

const log: debug.IDebugger = debug('app:games-controllers');

class GamesController {
    async listVersionsByGame(req: express.Request, res: express.Response) {
        const versions = await gamesService.listByGame(req.params.gameName);
        if (versions) {
            res.status(200).send(versions);
        } else {
            res.status(404).send({ errors: [`Game '${req.params.gameName}' doesn't exist`] });
        }
    }

    async createGameAndVersions(req: express.Request, res: express.Response) {
        try {
            const gameId = await gamesService.create(req.body);
            res.status(201).send({ id: gameId });
        } catch (err) {
            return res.status(500).send();
        }
    }

    async createVersion(req: express.Request, res: express.Response) {
        try {
            const versionId = await gamesService.createVersion(req.params.gameName, req.body);
            res.status(201).send({ id: versionId });
        } catch (err) {
            return res.status(500).send();
        }
    }

    async createDictKey(req: express.Request, res: express.Response) {
        try {
            const customVersionId = await gamesService.createDictKey(req.params.gameName, req.body);
            res.status(201).send({ id: customVersionId });
        } catch (err) {
            return res.status(500).send();
        }
    }
    async editVersion(req: express.Request, res: express.Response) {
        log(await gamesService.editVersion(req.params.gameName, req.body));
        res.status(204).send();
    }

    async editDictKey(req: express.Request, res: express.Response) {
        log(await gamesService.editDictKey(req.params.gameName, req.body));
        res.status(204).send();
    }

    async removeGame(req: express.Request, res: express.Response) {
        log(await gamesService.deleteById(req.params.gameId));
        res.status(204).send();
    }

    async removeVersion(req: express.Request, res: express.Response) {
        log(await gamesService.deleteVersion(req.params.gameName, req.body.gameVersion));
        res.status(204).send();
    }

    async removeDictKey(req: express.Request, res: express.Response) {
        log(await gamesService.deleteDictKey(req.params.gameName, req.body));
        res.status(204).send();
    }
}

export default new GamesController();