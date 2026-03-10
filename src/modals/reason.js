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

        const reason = interaction.fields.getTextInputValue('reasonInput');
        
        const parts = this.owner.split(':');
        switch (parts[1]) {
            case 'fbkp':
                const pending = await getPendingBackup(parts[2]);
                await rejectBackup(interaction, reason, pending);
                break;
            case 'mistral':
                await interaction.update({
                    content: `${interaction.message.content.split(` ${parts[2]}\n\n`)[0]}\n\nRejected by ${interaction.user.tag} (${interaction.user.id}) for ${reason}.`,
                    components: [],
                });
                break;
            default:
                throw new InteractionError('Invalid reject type.');
        }
    }
}