import { FontDto } from '../dto/font.dto';
import { nanoid } from 'nanoid';
import debug from 'debug';
import mongooseService from '../../common/services/mongoose.service';

const log: debug.IDebugger = debug('app:fonts-dao');

class FontsDao {
    Schema = mongooseService.getMongoose().Schema;

    fontSchema = new this.Schema({
        _id: String,
        joinId: String,
        name: String,
        fontSize: Number,
        fontScale: Number,
        fontColor: String,
        skewValue: Number,
        shadowValue: Number,
        maxLineCount: Number,
        alignment: String,
        x: Number,
        y: Number
    });

    Font = mongooseService.getMongoose().model('Fonts', this.fontSchema);

    constructor() {
        log('Created new instance of FontsDao');
    }

    async addFont(joinId: string, key: string, fontFields: FontDto) {
        const fontId = nanoid();
        const font = new this.Font({
            _id: fontId,
            joinId: joinId,
            name: key,
            ...fontFields
        });
        await font.save();
        return fontId;
    }

    async getAllFontsByJoinId(joinId: string) {
        return this.Font.find({ joinId: joinId }).select('-__v -joinId').exec();
    }

    async removeFontsByJoinId(joinId: string) {
        return this.Font.deleteMany({ joinId: joinId }).exec();
    }
}

export default new FontsDao();