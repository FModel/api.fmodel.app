const { ButtonBuilder, ButtonStyle } = require('discord.js');
const { isAdmin } = require('#db/middleware');
const { getPendingBackup } = require('#db/backup');
const { rejectBackup } = require("../utils/github");
const InteractionError = require('../utils/interactionError');

module.exports = {
    data: new ButtonBuilder()
        .setCustomId('reject')
        .setLabel('Reject Something')
        .setStyle(ButtonStyle.Danger),
    async execute(interaction) {
        isAdmin(interaction);

        const parts = interaction.customId.split(':');
        switch (parts[1]) {
            case 'fbkp':
                const pending = await getPendingBackup(parts[2]);
                await rejectBackup(interaction, pending);
                break;
            default:
                throw new InteractionError('Invalid approval type.');
        }
    },
};