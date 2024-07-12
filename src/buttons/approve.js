const { ButtonBuilder, ButtonStyle } = require('discord.js');
const { isAdmin } = require('#db/middleware');
const { getPendingBackup } = require('#db/backup');
const { approveBackup } = require("../utils/github");
const InteractionError = require('../utils/interactionError');

module.exports = {
    data: new ButtonBuilder()
        .setCustomId('approve')
        .setLabel('Approve Something')
        .setStyle(ButtonStyle.Success),
    async execute(interaction) {
        isAdmin(interaction);
        await interaction.deferReply();
        
        const parts = interaction.customId.split(':');
        switch (parts[1]) {
            case 'fbkp':
                const pending = await getPendingBackup(parts[2]);
                await approveBackup(interaction, pending);
                break;
            default:
                throw new InteractionError('Invalid approval type.');
        }
    },
};