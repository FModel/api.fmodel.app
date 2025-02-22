const { Client, GatewayIntentBits } = require('discord.js');
const { Mistral } = require('@mistralai/mistralai');

module.exports = {
    client: new Client({ intents: [GatewayIntentBits.Guilds] }),
    mistral: new Mistral({apiKey: process.env.GITHUB_OAUTH_TOKEN, serverURL: "https://models.inference.ai.azure.com"}),
};