import { CreateInfoDto } from '../dto/create.info.dto';
import { PatchInfoDto } from '../dto/patch.info.dto';
import { PutInfoDto } from '../dto/put.info.dto';
import { nanoid } from 'nanoid';
import debug from 'debug';
import mongooseService from '../../common/services/mongoose.service';

const log: debug.IDebugger = debug('app:infos-dao');

class InfosDao {
    Schema = mongooseService.getMongoose().Schema;

    infoSchema = new this.Schema({
        _id: String,
        mode: String,
        version: String,
        downloadUrl: String,
        changelogUrl: String,
        communityDesign: String,
        communityPreview: String
    });

    Info = mongooseService.getMongoose().model('Infos', this.infoSchema);
    
    constructor() {
        log('Created new instance of InfosDao');
    }

    async addInfo(infoFields: CreateInfoDto) {
        const infoId = nanoid();
        const info = new this.Info({
            _id: infoId,
            ...infoFields
        });
        await info.save();
        return infoId;
    }

    async getInfoById(infoId: string) {
        return this.Info.findOne({ _id: infoId }).exec();
    }

    async getInfoByMode(updateMode: string) {
        return this.Info.findOne({ mode: updateMode }).select('-_id -__v -mode').exec();
    }

    async getInfos(limit = 5, page = 0) {
        return this.Info.find().limit(limit).skip(limit * page).exec();
    }

    async updateInfoById(infoId: string, infoFields: PatchInfoDto | PutInfoDto) {
        return await this.Info.findOneAndUpdate(
            { _id: infoId },
            { $set: infoFields },
            { new: true }
        ).exec();
    }

    async removeInfoById(infoId: string) {
        return this.Info.deleteOne({ _id: infoId }).exec();
    }
}

export default new InfosDao();