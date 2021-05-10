import mongoose from 'mongoose';
import debug from 'debug';

// @ts-expect-error
const mongoDbUrl: string = process.env.MONGO_DB_URL;
const log: debug.IDebugger = debug('app:mongoose-service');

class MongooseService {
    private count = 0;
    private mongooseOptions = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
        useFindAndModify: false,
    };

    constructor() {
        this.connectWithRetry();
    }

    getMongoose() {
        return mongoose;
    }

    connectWithRetry = () => {
        log('Attempting MongoDB connection (will retry if needed)');
        mongoose.connect(mongoDbUrl, this.mongooseOptions)
            .then(() => {
                log('MongoDB is connected');
            })
            .catch((err) => {
                const retrySeconds = 5;
                log(`MongoDB connection unsuccessful #${++this.count} (will retry in ${retrySeconds} seconds):`, err);
                setTimeout(this.connectWithRetry, retrySeconds * 1000);
            });
    };
}
export default new MongooseService();