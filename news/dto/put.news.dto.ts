export interface PutNewsDto {
    version: string;
    game: string;
    messages: string[];
    colors: string[];
    newLines: boolean[];
}