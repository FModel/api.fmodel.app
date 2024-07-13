const { ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new ButtonBuilder()
        .setCustomId('reject')
        .setLabel('Reject Something')
        .setStyle(ButtonStyle.Danger),
    async execute(interaction) {
        const modal = interaction.client.modals.get('reason');
        modal.setOwner(interaction.customId);
        await interaction.showModal(modal.data);
    },
};