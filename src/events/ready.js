const logger = require('winston');
const { Events } = require('discord.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        logger.info(`Ready! Logged in as ${client.user.tag}.`);
    },
};