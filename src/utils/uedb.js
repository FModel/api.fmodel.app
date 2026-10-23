const InteractionError = require('./interactionError');

const UEDB_URL = 'https://uedb.dev';
const MAPPING_FIELD = 'mappingFile';

const send = async (method, path, gameInfo, file) => {
    const form = new FormData();
    form.append('gameInfo', JSON.stringify(gameInfo));
    if (file) form.append(MAPPING_FIELD, new Blob([file.buffer]), file.name);

    const response = await fetch(`${UEDB_URL}/${path}`, {
        method,
        headers: { 'Authorization': process.env.UEDB_API_KEY },
        body: form,
    });

    if (!response.ok) {
        throw new InteractionError(`UEDB ${method} ${path} failed (${response.status}): ${(await response.text()).slice(0, 1500)}`);
    }

    return response.json().catch(() => null);
};

module.exports = {
    MAPPING_FIELD,

    async findGame(name, signal) {
        const needle = name.toLowerCase();

        for (let page = 1; ; page++) {
            const response = await fetch(`${UEDB_URL}/api/games?q=${encodeURIComponent(name)}&limit=50&page=${page}`, { signal });
            if (!response.ok) {
                throw new InteractionError(`UEDB search failed (${response.status}).`);
            }

            const { games = [], hasNextPage } = await response.json();
            const game = games.find(g => [g.name, g.slug, g.alternateTitle].some(n => n?.toLowerCase() === needle));
            if (game) return game;
            if (!hasNextPage || !games.length) return null;
        }
    },

    async createGame(gameInfo) {
        return send('POST', 'svc/admin/games', gameInfo);
    },

    async addVersion(game, gameInfo, file) {
        return send('PATCH', `svc/admin/games/${game._id}`, gameInfo, file);
    },
};
