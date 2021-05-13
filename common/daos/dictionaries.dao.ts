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

    async removeAllByJoinId(joinId: string) {
        return this.Dictionary.deleteMany({ joinId: joinId }).exec();
    }
}

export default new DictionariesDao();