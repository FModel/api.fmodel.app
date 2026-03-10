const mongoose = require('mongoose');
const logger = require('winston');
const { Schema } = mongoose;
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { client } = require('../client');
const { formatBytes } = require("../utils/formats");

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
            buffer: {
                async get() {
                    return fetch(this.downloadUrl).then(response => response.arrayBuffer());
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
                ],
            }],
            components: [
                new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setLabel('Download')
                            .setStyle(ButtonStyle.Link)
                            .setURL(doc.downloadUrl),
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
};