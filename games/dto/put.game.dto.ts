import { VersionDto } from "./version.dto";

export interface PutGameDto {
    gameName: string;
    displayName: string;
    versions: Map<string, VersionDto>;
}