import { TagDto } from "../dto/tag.dto";
import { nanoid } from 'nanoid';
import debug from 'debug';
import mongooseService from '../../common/services/mongoose.service';

const log: debug.IDebugger = debug('app:tags-dao');

class TagsDao {
    Schema = mongooseService.getMongoose().Schema;

    tagSchema = new this.Schema({
        _id: String,
        joinId: String,
        x: Number,
        y: Number,
        drawCustomOnly: Boolean,
        custom: String
    });

    Tag = mongooseService.getMongoose().model('Tags', this.tagSchema);

    constructor() {
        log('Created new instance of TagsDao');
    }

    async addGameplayTags(joinId: string, tagFields: TagDto) {
        const tagId = nanoid();
        const tag = new this.Tag({
            _id: tagId,
            joinId: joinId,
            x: tagFields.x,
            y: tagFields.y,
            drawCustomOnly: tagFields.drawCustomOnly,
            custom: tagFields.custom
        });
        await tag.save();
        return tagId;
    }

    async getGameplayTagByJoinId(joinId: string) {
        return this.Tag.findOne({ joinId: joinId }).select('-__v -joinId').exec();
    }

    async removeTagsByJoinId(joinId: string) {
        return this.Tag.deleteMany({ joinId: joinId }).exec();
    }
}

export default new TagsDao();