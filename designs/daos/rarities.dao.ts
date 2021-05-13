import { RarityDto } from "../dto/rarity.dto";
import { nanoid } from 'nanoid';
import debug from 'debug';
import mongooseService from '../../common/services/mongoose.service';

const log: debug.IDebugger = debug('app:rarities-dao');

class RaritiesDao {
    Schema = mongooseService.getMongoose().Schema;

    raritySchema = new this.Schema({
        _id: String,
        joinId: String,
        name: String,
        background: String,
        upper: String,
        lower: String
    });

    Rarity = mongooseService.getMongoose().model('Rarities', this.raritySchema);

    constructor() {
        log('Created new instance of RaritiesDao');
    }

    async addRarity(joinId: string, key: string, rarityFields: RarityDto) {
        const rarityId = nanoid();
        const rarity = new this.Rarity({
            _id: rarityId,
            joinId: joinId,
            name: key,
            ...rarityFields
        });
        await rarity.save();
        return rarityId;
    }

    async getAllRaritiesByJoinId(joinId: string) {
        return this.Rarity.find({ joinId: joinId }).select('-_id -__v -joinId').exec();
    }

    async removeRaritiesByJoinId(joinId: string) {
        return this.Rarity.deleteMany({ joinId: joinId }).exec();
    }
}

export default new RaritiesDao();