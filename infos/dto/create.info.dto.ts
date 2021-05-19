export interface CreateInfoDto {
    mode: string;
    version: string;
    downloadUrl: string;
    changelogUrl: string;
    communityDesign?: string;
    communityPreview?: string;
}