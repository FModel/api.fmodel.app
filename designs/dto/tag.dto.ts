export interface TagDto {
    x: number;
    y: number;
    drawCustomOnly: boolean;
    custom: string;
    tags: Map<string, string>;
}