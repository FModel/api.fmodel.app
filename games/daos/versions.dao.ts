import { VersionDto } from '../dto/version.dto';
import { nanoid } from 'nanoid';
import debug from 'debug';
import mongooseService from '../../common/services/mongoose.service';

const log: debug.IDebugger = debug('app:versions-dao');

class VersionsDao {
    Schema = mongooseService.getMongoose().Schema;

    versionSchema = new this.Schema({
        _id: String,
        joinId: String,
        gameVersion: String,
        gameEnum: String,
        ueVer: Number
    });

    Version = mongooseService.getMongoose().model('Versions', this.versionSchema);

    constructor() {
        log('Created new instance of VersionsDao');
    }

    addVersionFields(joinId: string, key: string, versionFields: VersionDto) {
        return this.addVersion(joinId, key, versionFields.game, versionFields.ueVer);
    }
    async addVersion(joinId: string, gameVersion: string, gameEnum: string, ueVer: number) {
        const versionId = nanoid();
        const version = new this.Version({
            _id: versionId,
            joinId: joinId,
            gameVersion: gameVersion,
            gameEnum: gameEnum,
            ueVer: ueVer
        });
        await version.save();
        return versionId;
    }

    async getAllVersionsByJoinId(joinId: string) {
        return this.Version.find({ joinId: joinId }).select('-__v -joinId').exec();
    }

    async getVersionByJoinIdAndVersionName(joinId: string, gameVersion: string) {
        return this.Version.findOne({ joinId: joinId, gameVersion: gameVersion }).select('-__v -joinId').exec();
    }
    
    async editVersionByJoinIdAndVersionName(joinId: string, gameVersion: string, gameEnum: string, ueVer: number) {
        return await this.Version.findOneAndUpdate(
            { joinId: joinId, gameVersion: gameVersion },
            { $set: { gameEnum: gameEnum, ueVer: ueVer }},
            { new: true }
        ).exec();
    }

    async removeVersionsByJoinId(joinId: string) {
        return this.Version.deleteMany({ joinId: joinId }).exec();
    }

    async removeVersionByJoinIdAndVersionName(joinId: string, gameVersion: string) {
        return this.Version.deleteOne({ joinId: joinId, gameVersion: gameVersion }).exec();
    }
}

export default new VersionsDao();