export interface CreateUserDto {
    username: string;
    password: string;
    permissionFlag?: number;
}