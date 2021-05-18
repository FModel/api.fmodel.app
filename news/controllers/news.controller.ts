import express from 'express';
import newsService from '../services/news.service';
import debug from "debug";

const log: debug.IDebugger = debug('app:news-controllers');

class NewsController {
    async listNews(req: express.Request, res: express.Response) {
        const news = await newsService.list(10, 0);
        res.status(200).send(news);
    }

    async listVersions(req: express.Request, res: express.Response) {
        const versions = await newsService.listVersions();
        let send = [];
        for (const v of versions) {
            send.push(v.version);
        }
        
        res.status(200).send(send);
    }

    async getNewsById(req: express.Request, res: express.Response) {
        const news = await newsService.getById(req.params.newsId);
        res.status(200).send(news);
    }

    async getNewsByVersion(req: express.Request, res: express.Response) {
        const news = await newsService.getNewsByVersion(req.params.version);
        if (news) {
            res.status(200).send({
                messages: news.messages.split(';'),
                colors: news.colors.split(';'),
                newLines: news.newLines.split(';'),
            });
        } else {
            res.status(400).send();
        }
    }

    async createNews(req: express.Request, res: express.Response) {
        const newsId = await newsService.create(req.body);
        res.status(201).send({ id: newsId });
    }

    async patch(req: express.Request, res: express.Response) {
        log(await newsService.patchById(req.params.newsId, req.body));
        res.status(204).send();
    }

    async put(req: express.Request, res: express.Response) {
        log(await newsService.putById(req.params.newsId, req.body));
        res.status(204).send();
    }
    
    async putByVersion(req: express.Request, res: express.Response) {
        log(await newsService.putByVersion(req.params.version, req.body));
        res.status(204).send();
    }

    async removeNews(req: express.Request, res: express.Response) {
        log(await newsService.deleteById(req.params.newsId));
        res.status(204).send();
    }
}

export default new NewsController();