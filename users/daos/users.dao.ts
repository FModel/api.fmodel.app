import { CreateUserDto } from '../dto/create.user.dto';
import { PatchUserDto } from '../dto/patch.user.dto';
import { PutUserDto } from '../dto/put.user.dto';
import { PermissionFlag } from '../../common/middleware/common.permissionflag.enum';
import { nanoid } from 'nanoid';
import debug from 'debug';
import mongooseService from '../../common/services/mongoose.service';

const log: debug.IDebugger = debug('app:users-dao');

class UsersDao {
    Schema = mongooseService.getMongoose().Schema;

    userSchema = new this.Schema({
        _id: String,
        username: String,
        password: { type: String, select: false },
        permissionFlag: Number
    });

    User = mongooseService.getMongoose().model('Users', this.userSchema);

    constructor() {
        log('Created new instance of UsersDao');
    }

    async addUser(userFields: CreateUserDto) {
        const userId = nanoid();
        const user = new this.User({
            _id: userId,
            ...userFields,
            permissionFlag: PermissionFlag.NO_PERMISSION
        });
        await user.save();
        return userId;
    }

    async getUserById(userId: string) {
        return this.User.findOne({ _id: userId }).exec();
    }

    async getUserByUsername(username: string) {
        return this.User.findOne({ username: username }).exec();
    }

    async getUserMinimumInfoById(userId: string) {
        return this.User.findOne({ _id: userId }).select('_id username').exec();
    }

    async getUserByUsernameWithPassword(username: string) {
        return this.User.findOne({ username: username }).select('_id username permissionFlag +password').exec();
    }

    async getUsers(limit = 25, page = 0) {
        return this.User.find().limit(limit).skip(limit * page).exec();
    }

    async updateUserById(userId: string, userFields: PatchUserDto | PutUserDto) {
        return await this.User.findOneAndUpdate(
            { _id: userId },
            { $set: userFields },
            { new: true }
        ).exec();
    }

    async removeUserById(userId: string) {
        return this.User.deleteOne({ _id: userId }).exec();
    }
}

export default new UsersDao();