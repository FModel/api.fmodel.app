const InteractionError = require('../utils/interactionError');

const isAdmin = (interaction) => {
    if (!interaction.member.permissions.has('ADMINISTRATOR')) {
        throw new InteractionError('You do not have permission to use this command.');
    }
};

module.exports = {
    isAdmin,
};