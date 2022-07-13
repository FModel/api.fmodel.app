export interface CreateNewsDto {
    version: string,
    game: string,
    messages: string[];
    colors: string[];
    newLines: boolean[];
}