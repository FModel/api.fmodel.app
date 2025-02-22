const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle} = require('discord.js');
const logger = require('winston');
const { mistral } = require('../client');
const { isAdmin } = require('#db/middleware');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('answer')
        .setDescription('Let Mistral answer a question.')
        .addStringOption(option => 
            option
                .setName('message_id')
                .setDescription('The message ID of the question to answer.')
                .setRequired(true),
        ),
    async execute(interaction) {
        isAdmin(interaction);
        await interaction.deferReply({ ephemeral: true });

        const modelName = "Mistral-small";
        const system = require('fs').readFileSync('mistral_sys.md', 'utf-8');
        
        const message_id = interaction.options.getString('message_id');
        const question = await interaction.channel.messages.fetch(message_id);

        const response = await mistral.chat.complete({
            model: modelName,
            messages: [
                { role:"system", content: system },
                { role:"user", content: question.content },
            ],
            temperature: 0.8,
            max_tokens: 2048,
            topP: 0.1,
        });

        logger.info(`User ${interaction.user.id} asked a question that costed ${JSON.stringify(response.usage)}.`);
        
        const admin_channel = interaction.client.channels.cache.get(process.env.DISCORD_ADMIN_CHANNEL_ID);
        await admin_channel.send({
            content: `${question.url} ${message_id}\n\n${response.choices[0].message.content}`,
            components: [
                new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId(`approve:mistral:${message_id}`)
                            .setLabel('Approve')
                            .setStyle(ButtonStyle.Success),
                        new ButtonBuilder()
                            .setCustomId(`reject:mistral:${message_id}`)
                            .setLabel('Reject')
                            .setStyle(ButtonStyle.Danger),
                    ),
            ],
        });
        
        await interaction.followUp({
            content: 'The answer has been sent to the admin channel for approval.',
        });
    },
};