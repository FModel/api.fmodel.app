const { client } = require('./client');
const { connectDatabase } = require('./database');
const {
    registerEvents,
    registerCommands,
    registerButtons,
    registerModals,
    reload,
    login,
} = require('./registers');

connectDatabase();
registerEvents(client);
registerCommands(client);
registerButtons(client);
registerModals(client);

reload(client, process.argv.includes('reload'));
login(client);