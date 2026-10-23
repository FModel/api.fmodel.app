const mongoose = require('mongoose');
const logger = require('winston');
const { Schema } = mongoose;
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { client } = require('../client');
const { formatBytes, parseEngineVersion } = require("../utils/formats");
const InteractionError = require('../utils/interactionError');

const PendingMapping = mongoose.model('PendingMapping', new Schema(
    {
        userId: String,
        messageUrl: String,
        fileName: String,
        fileSize: { type: Number, default: 0 },
        downloadUrl: String,
        approved: { type: Boolean, default: false },
        reason: String,
    },
    {
        timestamps: true,
        virtuals: {
            channelUrl: {
                get() {
                    return this.messageUrl.split('/').slice(0, -1).join('/');
                },
            },
            formattedSize: {
                get() {
                    return formatBytes(this.fileSize);
                },
            },
            engineVersion: {
                get() {
                    return parseEngineVersion(this.fileName);
                },
            },
            expiresAt: {
                get() {
                    return parseInt(new URL(this.downloadUrl).searchParams.get('ex'), 16) * 1000 || undefined;
                },
            },
            formattedExpiry: {
                get() {
                    return this.expiresAt ? `<t:${Math.floor(this.expiresAt / 1000)}:R>` : 'Unknown';
                },
            },
            freshUrl: {
                async get() {
                    if (this.expiresAt > Date.now() + 60_000) return this.downloadUrl;

                    const [channelId, messageId] = this.messageUrl.split('/').slice(-2);
                    const message = await client.channels.fetch(channelId)
                        .then(channel => channel.messages.fetch(messageId))
                        .catch(() => null);

                    const url = message?.attachments.find(a => a.name === this.fileName)?.url;
                    if (!url) throw new InteractionError(`The link to ${this.fileName} expired and the original message was deleted.`);

                    return url;
                },
            },
            buffer: {
                async get() {
                    const response = await fetch(await this.freshUrl);
                    if (!response.ok) {
                        throw new InteractionError(`Could not download ${this.fileName} (${response.status}), the original message may have been deleted.`);
                    }
                    return response.arrayBuffer();
                },
            },
            locked: {
                get() {
                    return !!this.reason;
                },
            }
        },
    },
)
    .post('save', async function(doc, next) {
        logger.info(`User ${doc.userId} submitted mapping ${doc.fileName} (${doc.formattedSize}).`);

        await client.channels.cache.get(process.env.DISCORD_ADMIN_CHANNEL_ID).send({
            embeds: [{
                color: 0xFAC11B,
                title: 'Mapping Approval Request',
                description: `User <@${doc.userId}> has submitted a mapping file for approval. Please review the mapping and take action.`,
                thumbnail: { url: 'https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678124-wrench-screwdriver-512.png' },
                fields: [
                    { name: 'Thread', value: doc.channelUrl, inline: true },
                    { name: 'File', value: doc.fileName, inline: true },
                    { name: 'Size', value: doc.formattedSize, inline: true },
                    { name: 'Engine', value: doc.engineVersion ? `UE${doc.engineVersion.split('.')[0]} - ${doc.engineVersion}` : 'Unknown', inline: true },
                    { name: 'Link Expires', value: doc.formattedExpiry, inline: true },
                ],
            }],
            components: [
                new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId(`download:usmap:${doc._id}`)
                            .setLabel('Download')
                            .setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder()
                            .setCustomId(`approve:usmap:${doc._id}`)
                            .setLabel('Approve')
                            .setStyle(ButtonStyle.Success),
                        new ButtonBuilder()
                            .setCustomId(`reject:usmap:${doc._id}`)
                            .setLabel('Reject')
                            .setStyle(ButtonStyle.Danger),
                    ),
            ],
        });
        
        next();
    }));

module.exports = {
    async createPendingMapping(userId, messageUrl, file) {
        return await PendingMapping.create({
            userId,
            messageUrl,
            fileName: file.name,
            fileSize: file.size,
            downloadUrl: file.url,
        });
    },
    
    async getPendingMapping(id) {
        return PendingMapping.findById(id);
    },
    
    async updatePendingMapping(id, approved, reason) {
        return PendingMapping.updateOne({ _id: id }, { approved, reason });
    },

    async updatePendingMappingUrl(id, downloadUrl) {
        return PendingMapping.updateOne({ _id: id }, { downloadUrl });
    },
};