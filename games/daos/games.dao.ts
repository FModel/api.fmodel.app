import { CreateGameDto } from '../dto/create.game.dto';
import { PatchGameDto } from '../dto/patch.game.dto';
import { PutGameDto } from '../dto/put.game.dto';
import { nanoid } from 'nanoid';
import debug from 'debug';
import mongooseService from "../../common/services/mongoose.service";

const log: debug.IDebugger = debug('app:games-dao');

class GamesDao {
    Schema = mongooseService.getMongoose().Schema;

    gameSchema = new this.Schema({
        _id: String,
        gameName: String,
        displayName: String
    });

    Game = mongooseService.getMongoose().model('Games', this.gameSchema);

    constructor() {
        log('Created new instance of GamesDao');
    }

    async addGame(gameFields: CreateGameDto) {
        const gameId = nanoid();
        const game = new this.Game({
            _id: gameId,
            gameName: gameFields.gameName,
            displayName: gameFields.displayName
        });
        await game.save();
        return gameId;
    }

    async getGameById(gameId: string) {
        return this.Game.findOne({ _id: gameId }).exec();
    }

    async getGameByName(gameName: string) {
        return this.Game.findOne({ gameName: gameName }).collation({ locale: 'en', strength: 2 }).select('-__v').exec();
    }

    async getGameByDisplayName(displayName: string) {
        return this.Game.findOne({ displayName: displayName }).select('-__v').exec();
    }

    async getGames() {
        return this.Game.find().exec();
    }

    async updateGameById(gameId: string, gameFields: PatchGameDto | PutGameDto) {
        return await this.Game.findOneAndUpdate(
            { _id: gameId },
            { $set: {
                        gameName: gameFields.gameName,
                        displayName: gameFields.displayName
                    }},
            { new: true }
        ).exec();
    }

    async removeGameById(gameId: string) {
        return this.Game.deleteOne({ _id: gameId }).exec();
    }
}

export default new GamesDao();