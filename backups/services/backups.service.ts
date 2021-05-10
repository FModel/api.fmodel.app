import BackupsDao from '../daos/backups.dao';
import { CRUD } from '../../common/interfaces/crud.interface';
import { CreateBackupDto } from '../dto/create.backup.dto';
import { PutBackupDto } from '../dto/put.backup.dto';
import { PatchBackupDto } from '../dto/patch.backup.dto';

class BackupsService implements CRUD {
    async list(limit: number, page: number) {
        return BackupsDao.getBackups(limit, page);
    }

    async listByGame(gameName: string, limit: number, page: number) {
        return BackupsDao.getBackupsByGame(gameName, limit, page);
    }

    async create(resource: CreateBackupDto) {
        return BackupsDao.addBackup(resource);
    }

    async getById(backupId: string) {
        return BackupsDao.getBackupById(backupId);
    }

    async getBackupByFileNameAndSize(fileName: string, fileSize: number) {
        return BackupsDao.getBackupByFileNameAndSize(fileName, fileSize);
    }

    async putById(backupId: string, resource: PutBackupDto): Promise<any> {
        return BackupsDao.updateBackupById(backupId, resource);
    }
    
    async patchById(backupId: string, resource: PatchBackupDto): Promise<any> {
        return BackupsDao.updateBackupById(backupId, resource);
    }

    async deleteById(backupId: string) {
        return BackupsDao.removeBackupById(backupId);
    }
}

export default new BackupsService();