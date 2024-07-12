const { mongoose } = require('mongoose');
const logger = require('./logger');
const { connectServer } = require('./server');
const { connectCron } = require('./cron');

const connectDatabase = () => {
    mongoose.connect(process.env.MONGO_DB_URL)
        .catch(err => {
            const retrySeconds = 5;
            logger.warn(`MongoDB connection unsuccessful (will retry in ${retrySeconds} seconds):`, err);
            setTimeout(connectDatabase, retrySeconds * 1000);
        });

    mongoose.connection.on('connected', () => {
        logger.info('MongoDB is connected');
        // connectServer();
        // connectCron();
    });
    mongoose.connection.on('disconnected', () => logger.info('MongoDB is disconnected'));
    mongoose.connection.on('reconnected', () => logger.info('MongoDB is reconnected'));
    mongoose.connection.on('error', err => logger.error(err));
};

module.exports = {
    connectDatabase,
};