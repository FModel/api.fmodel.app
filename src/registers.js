const fs = require('node:fs');
const path = require('node:path');
const logger = require('winston');
const { Collection, REST, Routes } = require('discord.js');

const register = (client, folderPath, registerFunction) => {
    if (typeof folderPath !== 'string') throw new TypeError('folderPath must be a string.');
    if (!fs.existsSync(folderPath)) throw new Error(`folderPath does not exist: ${folderPath}`);

    const folders = fs.readdirSync(folderPath);
    for (const folder of folders) {
        const filePath = path.join(folderPath, folder);
        if (fs.lstatSync(filePath).isDirectory()) {
            register(client, filePath, registerFunction);
            continue;
        }

        const file = require(filePath);
        if (('data' in file || 'name' in file) && 'execute' in file) {
            registerFunction(file);
        }
    }
};

module.exports = {
    registerEvents(client, folderPath = path.join(__dirname, 'events')) {
        register(client, folderPath, (event) => {
            if (event.once) {
                client.once(event.name, (...args) => event.execute(...args));
            } else {
                client.on(event.name, (...args) => event.execute(...args));
            }
            logger.info(`Registered event '${event.name}'.`);
        });
    },

    registerCommands(client, folderPath = path.join(__dirname, 'commands')) {
        if (!client.commands) client.commands = new Collection();
        register(client, folderPath, (command) => {
            client.commands.set(command.data.name, command);
            logger.info(`Registered application (/) command '${command.data.name}'.`);
        });
    },

    registerButtons(client, folderPath = path.join(__dirname, 'buttons')) {
        if (!client.buttons) client.buttons = new Collection();
        register(client, folderPath, (button) => {
            client.buttons.set(button.data.data.custom_id, button);
            logger.info(`Registered button '${button.data.data.custom_id}'.`);
        });
    },

    registerModals(client, folderPath = path.join(__dirname, 'modals')) {
        if (!client.modals) client.modals = new Collection();
        register(client, folderPath, (modal) => {
            client.modals.set(modal.data.data.custom_id, modal);
            logger.info(`Registered modal '${modal.data.data.custom_id}'.`);
        });
    },

    reload(client, reload = false) {
        if (!reload) return;
        (async () => {
            try {
                const rest = new REST().setToken(process.env.DISCORD_BOT_TOKEN);
                const data = await rest.put(Routes.applicationCommands(process.env.DISCORD_APPLICATION_ID),
                    { body: client.commands.map(command => command.data.toJSON()) },
                );
                logger.info(`Successfully reloaded ${data.length} application (/) commands.`);
            } catch (error) {
                logger.error(error);
            }
        })();
    },

    login(client) {
        client.login(process.env.DISCORD_BOT_TOKEN);
    },
};