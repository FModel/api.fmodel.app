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
        
        const parts = interaction.customId.split(':');
        switch (parts[1]) {
            case 'fbkp':
                await interaction.deferReply();
                const pending = await getPendingBackup(parts[2]);
                await approveBackup(interaction, pending);
                break;
            case 'mistral':
                const messageParts = interaction.message.content.split(` ${parts[2]}\n\n`);

                // format: https://discord.com/channels/{server_id}/{channel_id}/{message_id}
                const messageUrl = messageParts[0].split('/').slice(-3);
                const message = await interaction.client.channels.cache.get(messageUrl[1]).messages.fetch(messageUrl[2]);
                const answer = await message.reply(messageParts[1]);
                
                await interaction.update({
                    content: `Approved by ${interaction.user.tag} (${interaction.user.id}) at ${answer.url}.`,
                    components: [],
                });
                break;
            default:
                throw new InteractionError('Invalid approval type.');
        }
    },
};