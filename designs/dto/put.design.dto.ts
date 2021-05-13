import { FontDto } from "./font.dto";
import { TagDto } from "./tag.dto";
import { RarityDto } from "./rarity.dto";

export interface PutDesignDto {
    version: number;
    name: string;
    drawSource: boolean;
    drawSeason: boolean;
    drawSeasonShort: boolean;
    drawSet: boolean;
    drawSetShort: boolean;
    fonts: Map<string, FontDto>;
    gameplayTags: TagDto;
    rarities: Map<string, RarityDto>;
}