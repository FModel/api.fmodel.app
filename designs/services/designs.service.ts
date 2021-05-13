import DesignsDao from '../daos/designs.dao';
import FontsDao from '../daos/fonts.dao';
import TypefacesDao from '../daos/typefaces.dao';
import TagsDao from '../daos/tags.dao';
import DictionariesDao from '../../common/daos/dictionaries.dao';
import RaritiesDao from '../daos/rarities.dao';
import { CRUD } from '../../common/interfaces/crud.interface';
import { CreateDesignDto } from '../dto/create.design.dto';
import { PutDesignDto } from '../dto/put.design.dto';
import { PatchDesignDto } from '../dto/patch.design.dto';

class DesignsService implements CRUD {
    async list() {
        return DesignsDao.getDesigns();
    }
    
    async create(resource: CreateDesignDto) {
        const designId = await DesignsDao.addDesign(resource);
        for (const [key, val] of Object.entries(resource.fonts)) {
            const fontId = await FontsDao.addFont(designId, key, val);
            for (const [k, v] of Object.entries(val.typeface)) {
                await TypefacesDao.addTypeface(fontId, k, v);
            }
        }
        
        const tagId = await TagsDao.addGameplayTags(designId, resource.gameplayTags);
        for (const [key, val] of Object.entries(resource.gameplayTags.tags)) {
            await DictionariesDao.addDictionary(tagId, key, val);
        }
        
        for (const [key, val] of Object.entries(resource.rarities)) {
            await RaritiesDao.addRarity(designId, key, val);
        }
        
        return designId;
    }
    
    async getById(designId: string) {
        return DesignsDao.getDesignById(designId);
    }

    async getDesignByName(designName: string) {
        const design = await DesignsDao.getDesignByName(designName);
        if (!design) return undefined;
        
        const fonts: { [key: string]: any; } = { };
        for (const font of await FontsDao.getAllFontsByJoinId(design._id)) {
            const typeface: { [key: string]: string; } = { };
            for (const v of await TypefacesDao.getAllTypefacesByJoinId(font._id)) {
                typeface[v.language] = v.path;
            }
            fonts[font.name] = {
                typeface: typeface,
                fontSize: font.fontSize,
                fontScale: font.fontScale,
                fontColor: font.fontColor,
                skewValue: font.skewValue,
                shadowValue: font.shadowValue,
                maxLineCount: font.maxLineCount,
                alignment: font.alignment,
                x: font.x,
                y: font.y
            };
        }

        const gameplayTags: { [key: string]: any; } = { };
        const tags: { [key: string]: string; } = { };
        const gameplayTag = await TagsDao.getGameplayTagByJoinId(design._id);
        for (const v of await DictionariesDao.getAllByJoinId(gameplayTag._id)) {
            tags[v.key] = v.value;
        }
        gameplayTags["x"] = gameplayTag.x;
        gameplayTags["y"] = gameplayTag.y;
        gameplayTags["drawCustomOnly"] = gameplayTag.drawCustomOnly;
        gameplayTags["custom"] = gameplayTag.custom;
        gameplayTags["tags"] = tags;

        const rarities: { [key: string]: any; } = { };
        for (const rarity of await RaritiesDao.getAllRaritiesByJoinId(design._id)) {
            rarities[rarity.name] = {
                background: rarity.background,
                upper: rarity.upper,
                lower: rarity.lower
            };
        }

        const ret: { [key: string]: any; } = { };
        ret["name"] = design.name;
        ret["drawSource"] = design.drawSource;
        ret["drawSeason"] = design.drawSeason;
        ret["drawSeasonShort"] = design.drawSeasonShort;
        ret["drawSet"] = design.drawSet;
        ret["drawSetShort"] = design.drawSetShort;
        ret["fonts"] = fonts;
        ret["gameplayTags"] = gameplayTags;
        ret["rarities"] = rarities;
        return ret;
    }
    
    async putById(designId: string, resource: PutDesignDto) : Promise<any> {
        return DesignsDao.updateDesignById(designId, resource);
    }
    
    async patchById(designId: string, resource: PatchDesignDto) : Promise<any> {
        return DesignsDao.updateDesignById(designId, resource);
    }
    
    async deleteById(designId: string) : Promise<any> {
        await RaritiesDao.removeRaritiesByJoinId(designId);
        
        const gameplayTag = await TagsDao.getGameplayTagByJoinId(designId);
        if (gameplayTag) {
            await DictionariesDao.removeAllByJoinId(gameplayTag._id);
            await TagsDao.removeTagsByJoinId(designId);
        }

        for (const font of await FontsDao.getAllFontsByJoinId(designId)) {
            await TypefacesDao.removeTypefacesByJoinId(font._id);
        }
        await FontsDao.removeFontsByJoinId(designId);

        return DesignsDao.removeDesignById(designId);
    }
}

export default new DesignsService();