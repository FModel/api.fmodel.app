import { CreateDesignDto } from '../dto/create.design.dto';
import { PatchDesignDto } from '../dto/patch.design.dto';
import { PutDesignDto } from '../dto/put.design.dto';
import { nanoid } from 'nanoid';
import debug from 'debug';
import mongooseService from '../../common/services/mongoose.service';

const log: debug.IDebugger = debug('app:designs-dao');

class DesignsDao {
    Schema = mongooseService.getMongoose().Schema;

    designSchema = new this.Schema({
        _id: String,
        version: Number,
        name: String,
        drawSource: Boolean,
        drawSeason: Boolean,
        drawSeasonShort: Boolean,
        drawSet: Boolean,
        drawSetShort: Boolean
    });

    Design = mongooseService.getMongoose().model('Designs', this.designSchema);
    
    constructor() {
        log('Created new instance of DesignsDao');
    }

    async addDesign(designFields: CreateDesignDto) {
        const designId = nanoid();
        const design = new this.Design({
            _id: designId,
            version: 1.0,
            name: designFields.name,
            drawSource: designFields.drawSource,
            drawSeason: designFields.drawSeason,
            drawSeasonShort: designFields.drawSeasonShort,
            drawSet : designFields.drawSet,
            drawSetShort : designFields.drawSetShort
        });
        await design.save();
        return designId;
    }

    async getDesignById(designId: string) {
        return this.Design.findOne({ _id: designId }).exec();
    }

    async getDesignByName(designName: string) {
        return this.Design.findOne({ name: designName }).select('-__v').exec();
    }

    async getDesigns() {
        return this.Design.find().exec();
    }

    async updateDesignById(designId: string, designFields: PatchDesignDto | PutDesignDto) {
        return await this.Design.findOneAndUpdate(
            { _id: designId },
            { $set: { version: designFields.version,
                    name: designFields.name,
                    drawSource: designFields.drawSource,
                    drawSeason: designFields.drawSeason,
                    drawSeasonShort: designFields.drawSeasonShort,
                    drawSet : designFields.drawSet,
                    drawSetShort : designFields.drawSetShort
            }},
            { new: true }
        ).exec();
    }

    async removeDesignById(designId: string) {
        return this.Design.deleteOne({ _id: designId }).exec();
    }
}

export default new DesignsDao();