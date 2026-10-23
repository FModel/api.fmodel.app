const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const logger = require('winston');
const { isAdmin } = require('#db/middleware');
const { getPendingBackup } = require('#db/backup');
const { getPendingMapping } = require('#db/mapping');
const { findGame, createGame } = require('../utils/uedb');
const { approveBackup } = require("../utils/github");
const InteractionError = require('../utils/interactionError');

const threadNameOf = async (client, pending) => {
    const thread = await client.channels.fetch(pending.channelUrl.split('/').pop()).catch(() => null);
    if (!thread) throw new InteractionError('The mapping thread no longer exists.');
    return thread.name;
};

module.exports = {
    data: new ButtonBuilder()
        .setCustomId('approve')
        .setLabel('Approve Something')
        .setStyle(ButtonStyle.Success),
    async execute(interaction) {
        isAdmin(interaction);
        
        const parts = interaction.customId.split(':');
        switch (parts[1]) {
            case 'fbkp': {
                await interaction.deferReply();
                const pending = await getPendingBackup(parts[2]);
                await approveBackup(interaction, pending);
                break;
            }
            case 'mistral': {
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
            }
            case 'usmap': {
                const pending = await getPendingMapping(parts[2]);
                if (!pending) throw new InteractionError('Mapping not found.');
                if (pending.locked) throw new InteractionError('Mapping is locked.');

                const name = await threadNameOf(interaction.client, pending);
                // showModal must happen within 3s of the click
                const game = await findGame(name, AbortSignal.timeout(1500)).catch(error => {
                    if (error.name === 'TimeoutError') throw new InteractionError('UEDB did not respond in time, try again.');
                    throw error;
                });

                if (!game) {
                    const { engineVersion } = pending;
                    const fix = 'If this is wrong, create the game from the admin panel, or rename the thread and reupload the file with a proper name.';
                    if (!engineVersion) {
                        throw new InteractionError(`**${name}** is not on UEDB and no engine version could be read from \`${pending.fileName}\`.\n${fix}`);
                    }

                    await interaction.reply({
                        content: `**${name}** is not on UEDB, create it?\n- Name: **${name}** (thread name)\n- Engine: **UE${engineVersion.split('.')[0]} - ${engineVersion}** (from \`${pending.fileName}\`)\n\n${fix}`,
                        components: [
                            new ActionRowBuilder().addComponents(
                                new ButtonBuilder()
                                    .setCustomId(`approve:game:${pending.id}`)
                                    .setLabel('Create Game')
                                    .setStyle(ButtonStyle.Success),
                            ),
                        ],
                        ephemeral: true,
                    });
                    break;
                }

                const modal = interaction.client.modals.get('mappingApproval');
                await interaction.showModal(modal.build(pending, game));
                break;
            }
            case 'game': {
                const pending = await getPendingMapping(parts[2]);
                if (!pending) throw new InteractionError('Mapping not found.');
                if (pending.locked) throw new InteractionError('Mapping is locked.');

                const name = await threadNameOf(interaction.client, pending);

                await interaction.deferUpdate();

                const game = await findGame(name);
                if (game) {
                    throw new InteractionError(`**${name}** already exists on UEDB.`);
                }

                const { engineVersion } = pending;
                await createGame({
                    name,
                    currentEngineVersion: engineVersion,
                    engineType: `UE${engineVersion.split('.')[0]}`,
                    developer: 'Unknown',
                    platforms: ['Win64'],
                });
                logger.info(`${interaction.user.tag} created game ${name} on UEDB from mapping ${pending.fileName} (${pending._id}).`);

                await interaction.editReply({
                    content: `Created **${name}**, click Approve on the request again to add the mapping.`,
                    components: [],
                });
                break;
            }
            default:
                throw new InteractionError('Invalid approval type.');
        }
    },
};