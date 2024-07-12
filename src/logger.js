const { config } = require('dotenv');
const logger = require('winston');

config();

const format = process.env.NODE_ENV === 'production' ?
    logger.format.combine(
        logger.format.timestamp({ format: 'MMM-DD-YYYY HH:mm:ss' }),
        logger.format.colorize(),
        logger.format.simple(),
        logger.format.printf(info => `[${info.level}] ${[info.timestamp]}: ${info.message}`),
    ) :
    logger.format.combine(
        logger.format.colorize(),
        logger.format.simple(),
    );

logger.add(new logger.transports.Console({ format }));

module.exports = logger;