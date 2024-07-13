const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const { isAdmin } = require('#db/middleware');
const { getPendingBackup } = require('#db/backup');
const { rejectBackup } = require("../utils/github");
const InteractionError = require('../utils/interactionError');

module.exports = {
    data: new ModalBuilder()
        .setCustomId('reason')
        .setTitle('Submit Reason')
        .addComponents(
            new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                    .setCustomId('reasonInput')
                    .setLabel('Reason')
                    .setPlaceholder('No reason provided.')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(false),
            ),
        ),
    owner: '',
    setOwner(owner) {
        this.owner = owner;
    },
    async execute(interaction) {
        isAdmin(interaction);
        
        const parts = this.owner.split(':');
        switch (parts[1]) {
            case 'fbkp':
                const reason = interaction.fields.getTextInputValue('reasonInput');
                const pending = await getPendingBackup(parts[2]);
                await rejectBackup(interaction, reason, pending);
                break;
            default:
                throw new InteractionError('Invalid approval type.');
        }
    }
}