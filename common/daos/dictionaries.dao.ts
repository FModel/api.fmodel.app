import { nanoid } from 'nanoid';
import debug from 'debug';
import mongooseService from '../../common/services/mongoose.service';

const log: debug.IDebugger = debug('app:dictionaries-dao');

class DictionariesDao {
    Schema = mongooseService.getMongoose().Schema;

    dictionarySchema = new this.Schema({
        _id: String,
        joinId: String,
        key: String,
        value: String
    });

    Dictionary = mongooseService.getMongoose().model('Dictionaries', this.dictionarySchema);

    constructor() {
        log('Created new instance of DictionariesDao');
    }

    async addDictionary(joinId: string, key: string, value: string) {
        const dictionaryId = nanoid();
        const dictionary = new this.Dictionary({
            _id: dictionaryId,
            joinId: joinId,
            key: key,
            value: value
        });
        await dictionary.save();
        return dictionaryId;
    }

    async getAllByJoinId(joinId: string) {
        return this.Dictionary.find({ joinId: joinId }).select('-_id -__v -joinId').exec();
    }

    async getByJoinIdAndKey(joinId: string, key: string) {
        return this.Dictionary.findOne({ joinId: joinId, key: key }).select('-_id -__v -joinId').exec();
    }

    async editByJoinIdAndKey(joinId: string, key: string, value: string) {
        return await this.Dictionary.findOneAndUpdate(
            { joinId: joinId, key: key },
            { $set: { value: value }},
            { new: true }
        ).exec();
    }

    async removeAllByJoinId(joinId: string) {
        return this.Dictionary.deleteMany({ joinId: joinId }).exec();
    }
    
    async removeByJoinIdAndKey(joinId: string, key: string) {
        return this.Dictionary.deleteMany({ joinId: joinId, key: key }).exec();
    }
}

export default new DictionariesDao();