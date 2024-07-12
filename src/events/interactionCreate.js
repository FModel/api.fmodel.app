const logger = require('winston');
const { Events } = require('discord.js');
const InteractionError = require('../utils/interactionError');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        let stateMachine;
        if (interaction.isChatInputCommand()) {
            stateMachine = interaction.client.commands.get(interaction.commandName);
        } else if (interaction.isButton()) {
            stateMachine = interaction.client.buttons.get(interaction.customId.split(':')[0]);
        } else if (interaction.isStringSelectMenu()) {
            return;
        } else if (interaction.isModalSubmit()) {
            stateMachine = interaction.client.modals.get(interaction.customId);
        }

        if (!stateMachine) {
            logger.error(`No interaction matching ${interaction.customId || interaction.commandName} was found.`);
            return;
        }

        try {
            await stateMachine.execute(interaction);
        } catch (error) {
            if (!(error instanceof InteractionError)) logger.error(error.message);

            const embeds = [{
                color: 0xf04a47,
                description: `:x: ${error instanceof InteractionError ? error.message.trim() : 'There was an error while executing this command!'}`,
            }];
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ embeds });
            } else {
                await interaction.reply({ embeds });
            }
        }
    },
};