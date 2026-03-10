const logger = require('winston');
const { Events } = require('discord.js');
const { createPendingMapping } = require("#db/mapping");

const GAME_COMPATIBILITY_FORUM_ID = '1090586945412931734';

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.channel.parentId !== GAME_COMPATIBILITY_FORUM_ID) return;

        const usmap = message.attachments.find(attachment => attachment.name.endsWith('.usmap'));
        if (!usmap) return;
        
        await createPendingMapping(message.author.id, message.url, usmap);
    },
};