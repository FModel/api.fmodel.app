export interface VersionDto {
    game: string;
    ueVer: number;
    customVersions?: Map<string, number>;
    options: Map<string, boolean>;
}