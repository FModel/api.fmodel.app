import { nanoid } from 'nanoid';
import debug from 'debug';
import mongooseService from '../../common/services/mongoose.service';

const log: debug.IDebugger = debug('app:typefaces-dao');

class TypefacesDao {
    Schema = mongooseService.getMongoose().Schema;

    typefaceSchema = new this.Schema({
        _id: String,
        joinId: String,
        language: String,
        path: String
    });

    Typeface = mongooseService.getMongoose().model('Typefaces', this.typefaceSchema);

    constructor() {
        log('Created new instance of TypefacesDao');
    }

    async addTypeface(joinId: string, key: string, path: any) {
        const typefaceId = nanoid();
        const typeface = new this.Typeface({
            _id: typefaceId,
            joinId: joinId,
            language: key,
            path: path
        });
        await typeface.save();
        return typefaceId;
    }

    async getAllTypefacesByJoinId(joinId: string) {
        return this.Typeface.find({ joinId: joinId }).select('-_id -__v -joinId').exec();
    }

    async removeTypefacesByJoinId(joinId: string) {
        return this.Typeface.deleteMany({ joinId: joinId }).exec();
    }
}

export default new TypefacesDao();