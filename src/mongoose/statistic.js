const mongoose = require('mongoose');
const logger = require('winston');
const { Schema } = mongoose;
const { client } = require('../client');
const { formatDate, formatNumber} = require("../utils/formats");

const Statistic = mongoose.model('Statistic', new Schema(
    {
        starCount: { type: Number, default: 0 },
        forkCount: { type: Number, default: 0 },
        downloadCount: { type: Number, default: 0 },
    },
    {
        timestamps: true,
    },
)
    .post('save', async function(doc, next) {
        const today = doc.createdAt;
        logger.info(`saved statistic for ${formatDate(today)}`);
        if (today.getDay() !== 1) return next();

        logger.info('Sending weekly statistics to admin channel');

        const current = await (await fetch('https://api.fmodel.app/v1/infos/Qa')).json();
        const lastWeek = await Statistic.find({ createdAt: { $gte: new Date(today).setDate(today.getDate() - 8), $lt: new Date(today) } });
        
        let downloads = '';
        let stars = '';
        let forks = '';
        for (let i = 1; i < lastWeek.length; i++) {
            const day = lastWeek[i];
            const previous = lastWeek[i - 1];

            const downloadDelta = day.downloadCount - previous.downloadCount;
            const starDelta = day.starCount - previous.starCount;
            const forkDelta = day.forkCount - previous.forkCount;

            downloads += `- ${formatDate(day.createdAt)}: ${formatNumber(day.downloadCount)} (${downloadDelta > 0 ? '+' : ''}${formatNumber(downloadDelta)})\n`;
            stars += `- ${formatNumber(day.starCount)} (${starDelta > 0 ? '+' : ''}${formatNumber(starDelta)})\n`;
            forks += `- ${formatNumber(day.forkCount)} (${forkDelta > 0 ? '+' : ''}${formatNumber(forkDelta)})\n`;
        }
        
        await client.channels.cache.get(process.env.DISCORD_ADMIN_CHANNEL_ID).send({
            content: `# Hello Team\nHere are the statistics for the past week (${formatDate(lastWeek[1].createdAt)} - ${formatDate(lastWeek[lastWeek.length - 1].createdAt)}).`,
            embeds: [{
                color: 0xFAC11B,
                fields: [
                    {
                        name: `Downloads`,
                        value: downloads,
                        inline: true,
                    },
                    {
                        name: `${client.emojis.cache.get('1342959734881259562')}`,
                        value: stars,
                        inline: true,
                    },
                    {
                        name: `${client.emojis.cache.get('1342960312843763812')}`,
                        value: forks,
                        inline: true,
                    },
                    {
                        name: `Current Version`,
                        value: `${current.version}`,
                        inline: true,
                    },
                ],
            }],
        });

        next();
    })
);

module.exports = {
    async createStatistic(starCount, forkCount, downloadCount) {
        return await Statistic.create({
            starCount,
            forkCount,
            downloadCount,
        });
    },

    async getPastWeek(date) {
        return Statistic.find({ createdAt: { $gte: new Date(date).setDate(date.getDate() - 8), $lt: date } });
    },
};