const cron = require('node-cron');
const { gatherStats } = require("./utils/github");

module.exports = {
    connectCron() {
        cron.schedule('0 0 * * *', gatherStats, {
            scheduled: true,
            timezone: 'UTC',
        });
    },
};