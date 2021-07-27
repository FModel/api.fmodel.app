import gamesUtils from "../games.utils";
import GamesDao from '../daos/games.dao';
import VersionsDao from '../daos/versions.dao';
import DictionariesDao from "../../common/daos/dictionaries.dao";
import { CRUD } from "../../common/interfaces/crud.interface";
import { CreateGameDto } from "../dto/create.game.dto";
import { PutGameDto } from "../dto/put.game.dto";
import { PatchGameDto } from "../dto/patch.game.dto";

class GamesService implements CRUD {
    async list() {
        const ret: { [key: string]: any; } = { };
        for (const game of await GamesDao.getGames()) {
            ret[game.gameName] = await this.listByGame(game.gameName);
        }
        return ret;
    }
    
    async listByGame(gameName: string) {
        const game = await GamesDao.getGameByName(gameName);
        if (!game) return undefined;

        const versions: { [key: string]: any; } = { };
        for (const version of await VersionsDao.getAllVersionsByJoinId(game._id)) {
            const customVersions: { [key: string]: number; } = { };
            for (const v of await DictionariesDao.getAllByJoinId(version._id + '_0')) {
                customVersions[v.key] = +v.value;
            }

            const options: { [key: string]: boolean; } = { };
            for (const v of await DictionariesDao.getAllByJoinId(version._id + '_1')) {
                options[v.key] = v.value === 'true';
            }
            
            versions[version.gameVersion] = {
                game: version.gameEnum,
                ueVer: version.ueVer,
                customVersions: customVersions,
                options: options
            };
        }

        const ret: { [key: string]: any; } = { };
        ret["displayName"] = game.displayName;
        ret["versions"] = versions;
        return ret;
    }

    async create(resource: CreateGameDto) {
        const gameId = await GamesDao.addGame(resource);
        for (const [key, val] of Object.entries(resource.versions)) {
            const versionId = await VersionsDao.addVersionFields(gameId, key, val);
            
            if (val.customVersions)
            {
                for (const [k, v] of Object.entries(val.customVersions)) {
                    await DictionariesDao.addDictionary(versionId + '_0', k, v as string);
                }
            }

            if (val.options)
            {
                for (const [k, v] of Object.entries(val.options)) {
                    await DictionariesDao.addDictionary(versionId + '_1', k, v as string);
                }
            }
        }
        return gameId;
    }

    async createVersion(gameName: string, resource: any) {
        const game = await GamesDao.getGameByName(gameName);
        const versionId = await VersionsDao.addVersion(game._id, resource.gameVersion, resource.gameEnum, resource.ueVer);
        
        if (resource.customVersions)
        {
            for (const [k, v] of Object.entries(resource.customVersions)) {
                await DictionariesDao.addDictionary(versionId + '_0', k, v as string);
            }
        }

        if (resource.options)
        {
            for (const [k, v] of Object.entries(resource.options)) {
                await DictionariesDao.addDictionary(versionId + '_1', k, v as string);
            }
        }
        return versionId;
    }

    async createDictKey(gameName: string, resource: any) {
        const game = await GamesDao.getGameByName(gameName);
        const versionId = await VersionsDao.getVersionByJoinIdAndVersionName(game._id, resource.gameVersion);
        return await DictionariesDao.addDictionary(`${versionId._id}_${gamesUtils.getFieldIndex(resource.fieldName)}`, resource.key, resource.value);
    }

    async getById(gameId: string) {
        return GamesDao.getGameById(gameId);
    }

    async getVersionsByJoinId(joinId: string) {
        return VersionsDao.getAllVersionsByJoinId(joinId);
    }
    
    async getByGameName(gameName: string) {
        return GamesDao.getGameByName(gameName);
    }

    async putById(gameId: string, resource: PutGameDto): Promise<any> {
        return GamesDao.updateGameById(gameId, resource);
    }

    async patchById(gameId: string, resource: PatchGameDto): Promise<any> {
        return GamesDao.updateGameById(gameId, resource);
    }

    async editVersion(gameName: string, resource: any) {
        const game = await GamesDao.getGameByName(gameName);
        return await VersionsDao.editVersionByJoinIdAndVersionName(game._id, resource.gameVersion, resource.gameEnum, resource.ueVer);
    }

    async editDictKey(gameName: string, resource: any) {
        const game = await GamesDao.getGameByName(gameName);
        const versionId = await VersionsDao.getVersionByJoinIdAndVersionName(game._id, resource.gameVersion);
        return await DictionariesDao.editByJoinIdAndKey( `${versionId._id}_${gamesUtils.getFieldIndex(resource.fieldName)}`, resource.key, resource.value);
    }

    async deleteById(gameId: string) {
        await GamesDao.removeGameById(gameId);
        
        for (const version of await VersionsDao.getAllVersionsByJoinId(gameId)) {
            await DictionariesDao.removeAllByJoinId(version._id);
        }

        return await VersionsDao.removeVersionsByJoinId(gameId);
    }

    async deleteVersion(gameName: string, gameVersion: string) {
        const game = await GamesDao.getGameByName(gameName);
        return await VersionsDao.removeVersionByJoinIdAndVersionName(game._id, gameVersion);
    }

    async deleteDictKey(gameName: string, resource: any) {
        const game = await GamesDao.getGameByName(gameName);
        const versionId = await VersionsDao.getVersionByJoinIdAndVersionName(game._id, resource.gameVersion);
        return await DictionariesDao.removeByJoinIdAndKey( `${versionId._id}_${gamesUtils.getFieldIndex(resource.fieldName)}`, resource.key);
    }
}

export default new GamesService();