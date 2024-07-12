const logger = require('winston');
const express = require('express');

const app = express();
app.use((req, res, next) => {
    logger.info(`[${req.method}(${res.statusCode})] "${req.headers['cf-connecting-ip']}" requested "${req.url}"`);
    next();
});

module.exports = {
    connectServer() {
        const port = 3001;
        app.listen(port, () => {
            logger.info(`Server listening on port ${port}`);
        });
    },
};