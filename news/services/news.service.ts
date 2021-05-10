import NewsDao from '../daos/news.dao';
import { CRUD } from "../../common/interfaces/crud.interface";
import { CreateNewsDto } from '../dto/create.news.dto';
import { PutNewsDto } from '../dto/put.news.dto';
import { PatchNewsDto } from '../dto/patch.news.dto';

class NewsService implements CRUD {
    async list(limit: number, page: number) {
        return NewsDao.getNews(limit, page);
    }

    async listVersions() {
        return NewsDao.getAllVersions();
    }

    async create(resource: CreateNewsDto) {
        return NewsDao.addNews(resource);
    }

    async getById(newsId: string) {
        return NewsDao.getNewsById(newsId);
    }

    async getNewsByVersion(version: string) {
        return NewsDao.getNewsByVersion(version);
    }

    async putById(newsId: string, resource: PutNewsDto): Promise<any> {
        return NewsDao.updateNewsById(newsId, resource);
    }

    async putByVersion(version: string, resource: PutNewsDto): Promise<any> {
        return NewsDao.updateNewsByVersion(version, resource);
    }

    async patchById(newsId: string, resource: PatchNewsDto): Promise<any> {
        return NewsDao.updateNewsById(newsId, resource);
    }

    async deleteById(newsId: string) {
        return NewsDao.removeNewsById(newsId);
    }
}

export default new NewsService();