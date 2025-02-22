const logger = require('winston');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { client } = require('../client');
const { updatePendingBackup } = require('#db/backup');
const { createStatistic } = require('#db/statistic');
const InteractionError = require('./interactionError');

const countRecursive = async (url, count = 0) => {
    return fetch(url)
        .then(res => Promise.all([res.status, res.json(), res.headers.get('Link')]))
        .then(([status, releases, link]) => {
            if (status !== 200) return count;
            
            releases.forEach(release => {
                const asset = release.assets.find(a => a.name === 'FModel.zip' && a.state === 'uploaded');
                if (!asset) return;

                count += asset.download_count;
            });

            if (link) {
                const next = link.match(/<(.*?)>; *?rel="(.*?)"/gi).find(l => l.includes('; rel="next"'));
                if (next) {
                    return countRecursive(next.match(/<(.*?)>/)[1], count);
                }
            }
            
            return count;
        });
};

module.exports = {
    async approveBackup(interaction, pending) {
        if (!pending) throw new InteractionError('Backup not found.');
        if (pending.locked) throw new InteractionError('Backup is locked.');
        
        const { request } = await import('@octokit/request');
        const content = Buffer.from(await pending.buffer).toString('base64');
        const upload = await request('PUT /repos/{owner}/{repo}/contents/{path}', {
            headers: { authorization: `token ${process.env.GITHUB_OAUTH_TOKEN}` },
            owner: '4sval',
            repo: 'cdn.fmodel.app',
            path: `backups/${pending.projectName}/${pending.fileName}`,
            message: `[BOT] Upload ${pending.fileName}`,
            content: content,
        });

        if (upload.status !== 201) {
            throw new InteractionError('Failed to upload backup.');
        }

        const oauth = await fetch('https://api.fmodel.app/v1/oauth/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: process.env.API_USER, password: process.env.API_PWD })
        });

        if (oauth.status !== 201) {
            throw new InteractionError('Failed to authenticate to the API.');
        }

        const { accessToken } = await oauth.json();
        const fbkpUrl = `https://cdn.fmodel.app/${upload.data.content.path}`;
        const register = await fetch('https://api.fmodel.app/v1/backups/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
            body: JSON.stringify({
                gameName: pending.projectName,
                fileName: pending.fileName,
                downloadUrl: fbkpUrl,
                fileSize: pending.fileSize
            })
        });

        if (register.status !== 201) {
            throw new InteractionError('Failed to register backup.');
        }
        
        const reason = `Approved by ${interaction.user.tag} (${interaction.user.id}).`;
        await updatePendingBackup(pending._id, true, reason);
        logger.info(`${interaction.user.tag} approved the upload of backup: ${pending.fileName} by ${pending.userId} (${pending._id}).`);
        
        const message = await client.channels.cache.get(pending.channelId).send({
            content: `<@${pending.userId}>`,
            embeds: [{
                color: 0xFAC11B,
                title: 'Your Backup Has Been Uploaded',
                description: 'Your backup has been uploaded and registered successfully. You can now download it using the link below.',
                thumbnail: { url: 'https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678134-sign-check-512.png' },
                fields: [
                    { name: 'Project', value: pending.projectName, inline: true },
                    { name: 'File', value: pending.fileName, inline: true },
                    { name: 'Size', value: pending.formattedSize, inline: true },
                ],
            }],
            components: [
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setLabel('Download')
                        .setStyle(ButtonStyle.Link)
                        .setURL(fbkpUrl),
                ),
            ],
        });
        await interaction.followUp({ content: `[${reason}](${message.url})`, embeds: [], components: [] });
    },
    
    async rejectBackup(interaction, reason, pending) {
        if (!pending) throw new InteractionError('Backup not found.');
        if (pending.locked) throw new InteractionError('Backup is locked.');

        const rejectedBy = `Rejected by ${interaction.user.tag} (${interaction.user.id})`;
        await updatePendingBackup(pending._id, false, `${rejectedBy}${(reason && ` for '${reason}'`)}`);
        logger.info(`${interaction.user.tag} rejected the upload of backup: ${pending.fileName} by ${pending.userId} (${pending._id}).`);

        const message = await client.channels.cache.get(pending.channelId).send({
            content: `<@${pending.userId}>`,
            embeds: [{
                color: 0xFAC11B,
                title: 'Your Backup Has Been Rejected',
                description: 'Your backup has been rejected. Please review the reason and resubmit the backup if necessary.',
                thumbnail: { url: 'https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678069-sign-error-512.png' },
                fields: [
                    { name: 'Project', value: pending.projectName, inline: true },
                    { name: 'File', value: pending.fileName, inline: true },
                    { name: 'Size', value: pending.formattedSize, inline: true },
                    ...(reason ? [{ name: 'Reason', value: reason, inline: false }] : []),
                ],
            }]
        });
        await interaction.update({ content: `[${rejectedBy}](${message.url})`, embeds: [], components: [] });
    },
    
    gatherStats() {
        fetch('https://api.github.com/repos/4sval/FModel')
            .then(res => res.json())
            .then(async data => {
                const downloadCount = await countRecursive(data.releases_url.replace('{/id}', ''));
                await createStatistic(data.stargazers_count, data.forks_count, downloadCount);
            })
            .catch(err => {
                console.error(err);
            });
    },
}