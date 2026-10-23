const { ModalBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const logger = require('winston');
const { isAdmin } = require('#db/middleware');
const { getPendingMapping, updatePendingMapping } = require('#db/mapping');
const { findGame, addVersion, MAPPING_FIELD } = require('../utils/uedb');
const InteractionError = require('../utils/interactionError');

const textField = (id, label, { value, placeholder, required = false } = {}) => {
    const input = new TextInputBuilder()
        .setCustomId(id)
        .setLabel(label)
        .setStyle(TextInputStyle.Short)
        .setRequired(required);
    if (value) input.setValue(value.slice(0, 4000));
    if (placeholder) input.setPlaceholder(placeholder.slice(0, 100));
    return new ActionRowBuilder().addComponents(input);
};

const formatAesKey = (key) => {
    if (!key) return undefined;
    const hex = key.replace(/^0x/i, '').toUpperCase();
    if (!/^[0-9A-F]{64}$/.test(hex)) throw new InteractionError('Main AES key must be 64 hex characters.');
    return `0x${hex}`;
};

module.exports = {
    data: new ModalBuilder().setCustomId('mappingApproval').setTitle('Mapping Approval'),
    build(pending, game) {
        const latest = [...(game.versions ?? [])].sort((a, b) => new Date(b.updated) - new Date(a.updated))[0];
        
        return new ModalBuilder()
            .setCustomId(`mappingApproval:${pending._id}`)
            .setTitle(`Update ${game.name}`.slice(0, 45))
            .addComponents(
                textField('gameName', 'Game Name', { value: game.name, required: true }),
                textField('versionString', 'Version String', {
                    placeholder: latest?.versionString ?? '++GameName+Release-1.0-CL-12345',
                    required: true,
                }),
                textField('engineVersion', 'Engine Version', {
                    value: pending.engineVersion,
                    placeholder: game.currentEngineVersion,
                    required: true,
                }),
                textField('mainAesKey', 'Main AES Key', { value: latest?.mainAesKey, placeholder: '0x...' }),
                textField('customVersion', 'Custom Version', { value: game.customVersion, placeholder: 'GAME_XXXXXXXXX' }),
            );
    },
    async execute(interaction) {
        isAdmin(interaction);

        const pending = await getPendingMapping(interaction.customId.split(':')[1]);
        if (!pending) throw new InteractionError('Mapping not found.');
        if (pending.locked) throw new InteractionError('Mapping is locked.');

        const field = (id) => interaction.fields.getTextInputValue(id).trim();
        const gameName = field('gameName');
        const versionString = field('versionString');
        const engineVersion = field('engineVersion');
        const mainAesKey = formatAesKey(field('mainAesKey'));
        const customVersion = field('customVersion') || undefined;

        if (!/^[3-9]\.\d+$/.test(engineVersion)) throw new InteractionError('Engine version must look like 5.6, 4.27 or 6.0.');

        await interaction.deferUpdate();

        const game = await findGame(gameName);
        if (!game) throw new InteractionError(`**${gameName}** is not on UEDB, check the name or create the game from the admin panel.`);
        if (game.versions?.some(v => v.versionString === versionString)) {
            throw new InteractionError(`**${game.name}** already has version \`${versionString}\` on UEDB, this is likely a duplicate.`);
        }

        await addVersion(game, {
            versions: [{
                versionString,
                updated: new Date().toISOString(),
                originMappingField: MAPPING_FIELD,
                ...(mainAesKey && { mainAesKey }),
            }],
            ...(engineVersion !== game.currentEngineVersion && { currentEngineVersion: engineVersion }),
            ...(customVersion && customVersion !== game.customVersion && { customVersion }),
        }, { name: pending.fileName, buffer: await pending.buffer });

        await updatePendingMapping(pending._id, true, `Approved by ${interaction.user.tag} (${interaction.user.id}).`);
        logger.info(`${interaction.user.tag} approved mapping ${pending.fileName} by ${pending.userId} (${pending._id}): ${game.name} ${versionString}.`);

        const [row] = interaction.message.components;
        await interaction.message.edit({
            embeds: [
                EmbedBuilder.from(interaction.message.embeds[0])
                    .setColor(0x43B581)
                    .setFooter({ text: `Approved by ${interaction.user.tag} · ${versionString}`, iconURL: interaction.user.displayAvatarURL() })
                    .setTimestamp(),
            ],
            components: [
                new ActionRowBuilder().addComponents(
                    ButtonBuilder.from(row.components[0]),
                    new ButtonBuilder()
                        .setLabel('View on UEDB')
                        .setStyle(ButtonStyle.Link)
                        .setURL(`https://uedb.dev/game/${game.slug}`),
                ),
            ],
        });
    },
};
