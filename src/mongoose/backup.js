const mongoose = require('mongoose');
const logger = require('winston');
const { Schema } = mongoose;
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { client } = require('../client');
const { formatBytes } = require("../utils/formats");

const PendingBackup = mongoose.model('PendingBackup', new Schema(
    {
        userId: String,
        channelId: String,
        fileName: String,
        fileSize: { type: Number, default: 0 },
        downloadUrl: String,
        approved: { type: Boolean, default: false },
        reason: String,
    },
    {
        timestamps: true,
        virtuals: {
            projectName: {
                get() {
                    return this.fileName.split('_')[0].split('.')[0];
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
        logger.info(`User ${doc.userId} submitted backup ${doc.fileName} (${doc.formattedSize}).`);

        await client.channels.cache.get(process.env.DISCORD_ADMIN_CHANNEL_ID).send({
            embeds: [{
                color: 0xFAC11B,
                title: 'Backup Approval Request',
                description: `User <@${doc.userId}> has submitted a backup for approval. Please review the backup and take action.`,
                thumbnail: { url: 'https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678124-wrench-screwdriver-512.png' },
                fields: [
                    { name: 'Project', value: doc.projectName, inline: true },
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
                            .setCustomId(`approve:fbkp:${doc._id}`)
                            .setLabel('Approve')
                            .setStyle(ButtonStyle.Success),
                        new ButtonBuilder()
                            .setCustomId(`reject:fbkp:${doc._id}`)
                            .setLabel('Reject')
                            .setStyle(ButtonStyle.Danger),
                    ),
            ],
        });
        
        next();
    }));

module.exports = {
    async createPendingBackup(userId, channelId, file) {
        return await PendingBackup.create({
            userId,
            channelId,
            fileName: file.name,
            fileSize: file.size,
            downloadUrl: file.url,
        });
    },
    
    async getPendingBackup(id) {
        return PendingBackup.findById(id);
    },
    
    async updatePendingBackup(id, approved, reason) {
        return PendingBackup.updateOne({ _id: id }, { approved, reason });
    },
};