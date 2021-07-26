import { VersionDto } from "./version.dto";

export interface CreateGameDto {
    gameName: string;
    displayName: string;
    versions: Map<string, VersionDto>;
}