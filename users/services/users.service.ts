import UsersDao from '../daos/users.dao';
import { CRUD } from '../../common/interfaces/crud.interface';
import { CreateUserDto } from '../dto/create.user.dto';
import { PutUserDto } from '../dto/put.user.dto';
import { PatchUserDto } from '../dto/patch.user.dto';

class UsersService implements CRUD {
    async list(limit: number, page: number) {
        return UsersDao.getUsers(limit, page);
    }
    
    async create(resource: CreateUserDto) {
        return UsersDao.addUser(resource);
    }

    async getById(userId: string) {
        return UsersDao.getUserById(userId);
    }

    async putById(userId: string, resource: PutUserDto): Promise<any> {
        return UsersDao.updateUserById(userId, resource);
    }

    async patchById(userId: string, resource: PatchUserDto): Promise<any> {
        return UsersDao.updateUserById(userId, resource);
    }

    async deleteById(userId: string) {
        return UsersDao.removeUserById(userId);
    }

    async getUserMinimumInfoById(userId: string) {
        return UsersDao.getUserMinimumInfoById(userId);
    }

    async getUserByUsername(username: string) {
        return UsersDao.getUserByUsername(username);
    }
    async getUserByUsernameWithPassword(username: string) {
        return UsersDao.getUserByUsernameWithPassword(username);
    }
}

export default new UsersService();