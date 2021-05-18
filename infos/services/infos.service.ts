import InfosDao from "../daos/infos.dao";
import { CRUD } from "../../common/interfaces/crud.interface";
import { CreateInfoDto } from '../dto/create.info.dto';
import { PatchInfoDto } from '../dto/patch.info.dto';
import { PutInfoDto } from '../dto/put.info.dto';

class InfosService implements CRUD {
    async list(limit: number, page: number) {
        return InfosDao.getInfos(limit, page);
    }

    async create(resource: CreateInfoDto) {
        return InfosDao.addInfo(resource);
    }

    async getById(infoId: string) {
        return InfosDao.getInfoById(infoId);
    }

    async putById(infoId: string, resource: PutInfoDto): Promise<any> {
        return InfosDao.updateInfoById(infoId, resource);
    }

    async patchById(infoId: string, resource: PatchInfoDto): Promise<any> {
        return InfosDao.updateInfoById(infoId, resource);
    }

    async deleteById(infoId: string) {
        return InfosDao.removeInfoById(infoId);
    }
}

export default new InfosService();