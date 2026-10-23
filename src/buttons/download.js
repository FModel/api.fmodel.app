const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { isAdmin } = require('#db/middleware');
const { getPendingMapping, updatePendingMappingUrl } = require('#db/mapping');
const InteractionError = require('../utils/interactionError');

module.exports = {
    data: new ButtonBuilder()
        .setCustomId('download')
        .setLabel('Download Something')
        .setStyle(ButtonStyle.Secondary),
    async execute(interaction) {
        isAdmin(interaction);

        const parts = interaction.customId.split(':');
        switch (parts[1]) {
            case 'usmap': {
                const pending = await getPendingMapping(parts[2]);
                if (!pending) throw new InteractionError('Mapping not found.');

                const url = await pending.freshUrl;
                await interaction.reply({
                    components: [
                        new ActionRowBuilder().addComponents(
                            new ButtonBuilder()
                                .setLabel(pending.fileName.slice(0, 80))
                                .setStyle(ButtonStyle.Link)
                                .setURL(url),
                        ),
                    ],
                    ephemeral: true,
                });

                if (url !== pending.downloadUrl) {
                    pending.downloadUrl = url; // update the local copy so pending.formattedExpiry reflects the new URL's expiration
                    await updatePendingMappingUrl(pending._id, url);

                    const embed = EmbedBuilder.from(interaction.message.embeds[0]);
                    embed.setFields(embed.data.fields.map(f => f.name === 'Link Expires' ? { ...f, value: pending.formattedExpiry } : f));
                    await interaction.message.edit({ embeds: [embed] });
                }
                break;
            }
            default:
                throw new InteractionError('Invalid download type.');
        }
    },
};
