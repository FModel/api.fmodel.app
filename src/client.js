const { Client, GatewayIntentBits } = require('discord.js');

module.exports = {
    client: new Client({ intents: [GatewayIntentBits.Guilds] }),
};