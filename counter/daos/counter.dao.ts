import { nanoid } from 'nanoid';
import debug from 'debug';
import mongooseService from '../../common/services/mongoose.service';

const log: debug.IDebugger = debug('app:counter-dao');

class CounterDao {
    Schema = mongooseService.getMongoose().Schema;

    counterSchema = new this.Schema({
        _id: String,
        key: String,
        value: Number
    });

    Counter = mongooseService.getMongoose().model('Counter', this.counterSchema);

    constructor() {
        log('Created new instance of CounterDao');
    }

    async increment(key: string) {
        let counter = await this.Counter.findOne({ key: key }).exec();
        if (!counter)
        {
            const counterId = nanoid();
            counter = new this.Counter({
                _id: counterId,
                key: key,
                value: 0
            });
            await counter.save();
        }

        return await this.Counter.findOneAndUpdate(
            { key: key },
            { $set: { value: counter.value += 1 }},
            { new: true }
        ).exec();
    }
}

export default new CounterDao();