import { CreateBackupDto } from "../dto/create.backup.dto";
import { PatchBackupDto } from "../dto/patch.backup.dto";
import { PutBackupDto } from "../dto/put.backup.dto";
import { nanoid } from 'nanoid';
import debug from 'debug';
import mongooseService from '../../common/services/mongoose.service';

const log: debug.IDebugger = debug('app:backups-dao');

class BackupsDao {
    Schema = mongooseService.getMongoose().Schema;

    backupSchema = new this.Schema({
        _id: String,
        gameName: String,
        fileName: String,
        downloadUrl: String,
        fileSize: Number
    });

    Backup = mongooseService.getMongoose().model('Backups', this.backupSchema);

    constructor() {
        log('Created new instance of BackupsDao');
    }

    async addBackup(backupFields: CreateBackupDto) {
        const backupId = nanoid();
        const backup = new this.Backup({
            _id: backupId,
            ...backupFields
        });
        await backup.save();
        return backupId;
    }

    async getBackupById(backupId: string) {
        return this.Backup.findOne({ _id: backupId }).exec();
    }

    async getBackupByFileNameAndSize(fileName: string, fileSize: number) {
        return this.Backup.findOne({ fileName: fileName, fileSize: fileSize }).exec();
    }

    async getBackups(limit = 5, page = 0) {
        return this.Backup.find().limit(limit).skip(limit * page).exec();
    }

    async getBackupsByGame(gameName: string, limit = 5, page = 0) {
        return this.Backup.find({ gameName: gameName }).limit(limit).skip(limit * page).select('-_id gameName fileName downloadUrl fileSize').exec();
    }

    async updateBackupById(backupId: string, backupFields: PatchBackupDto | PutBackupDto) {
        return await this.Backup.findOneAndUpdate(
            { _id: backupId },
            { $set: backupFields },
            { new: true }
        ).exec();
    }

    async removeBackupById(backupId: string) {
        return this.Backup.deleteOne({ _id: backupId }).exec();
    }
}

export default new BackupsDao();