const { SlashCommandBuilder } = require('discord.js');
const { createPendingBackup } = require('#db/backup');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('fbkp')
        .setDescription('Manage backups.')
        // .addSubcommand(subcommand =>
        //     subcommand
        //         .setName('list')
        //         .setDescription('List all backups.'),
        // )
        .addSubcommand(subcommand =>
            subcommand
                .setName('upload')
                .setDescription('Upload a backup.')
                .addAttachmentOption(option =>
                    option
                        .setName('file')
                        .setDescription('The backup file to upload.')
                        .setRequired(true),
                ),
        ),
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        if (subcommand === 'upload') {
            const pending = await createPendingBackup(interaction.user.id, interaction.channelId, interaction.options.getAttachment('file'));
            await interaction.reply({
                embeds: [{
                    color: 0xFAC11B,
                    title: 'Your Backup Is Pending Approval',
                    description: 'Your backup has been submitted and is pending approval from an administrator.',
                    thumbnail: { url: 'https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678104-clock-512.png' },
                    fields: [
                        { name: 'Project', value: pending.projectName, inline: true },
                        { name: 'File', value: pending.fileName, inline: true },
                        { name: 'Size', value: pending.formattedSize, inline: true },
                    ],
                }],
            });
        }
    },
};