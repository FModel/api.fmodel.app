import { CreateNewsDto } from "../dto/create.news.dto";
import { PatchNewsDto } from "../dto/patch.news.dto";
import { PutNewsDto } from "../dto/put.news.dto";
import { nanoid } from 'nanoid';
import debug from 'debug';
import mongooseService from '../../common/services/mongoose.service';

const log: debug.IDebugger = debug('app:news-dao');

class NewsDao {
    Schema = mongooseService.getMongoose().Schema;

    newsSchema = new this.Schema({
        _id: String,
        version: String,
        game: String,
        messages: String,
        colors: String,
        newLines: String
    });

    News = mongooseService.getMongoose().model('News', this.newsSchema);

    constructor() {
        log('Created new instance of NewsDao');
    }

    async addNews(newsFields: CreateNewsDto) {
        const newsId = nanoid();
        const news = new this.News({
            _id: newsId,
            version: newsFields.version,
            game: newsFields.game,
            messages: newsFields.messages.join(';'),
            colors: newsFields.colors.join(';'),
            newLines: newsFields.newLines.join(';')
        });
        await news.save();
        return newsId;
    }

    async getNewsById(newsId: string) {
        return this.News.findOne({ _id: newsId }).exec();
    }

    async getNewsByVersion(version: string) {
        return this.News.findOne({ version: version }).select('-_id messages colors newLines').exec();
    }

    async getNewsByVersionAndGame(version: string, game: string) {
        return this.News.findOne({ version: version, game: game }).collation({ locale: 'en', strength: 2 }).select('-_id messages colors newLines').exec();
    }

    async getNews(limit = 5, page = 0) {
        return this.News.find().limit(limit).skip(limit * page).exec();
    }

    async getAllVersions() {
        return this.News.find().select('-_id version').exec();
    }

    async updateNewsById(newsId: string, newsFields: PatchNewsDto | PutNewsDto) {
        return await this.News.findOneAndUpdate(
            { _id: newsId },
            { $set: newsFields },
            { new: true }
        ).exec();
    }

    async updateNewsByVersion(version: string, newsFields: PatchNewsDto | PutNewsDto) {
        return await this.News.findOneAndUpdate(
            { version: version },
            { $set: {
                    game: newsFields.game,
                    messages: newsFields.messages?.join(';'),
                    colors: newsFields.colors?.join(';'),
                    newLines: newsFields.newLines?.join(';')
                }},
            { new: true }
        ).exec();
    }

    async removeNewsById(newsId: string) {
        return this.News.deleteOne({ _id: newsId }).exec();
    }
}

export default new NewsDao();