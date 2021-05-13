import dotenv from 'dotenv';
const result = dotenv.config({ path: `.env.${process.env.DEBUG ? 'dev' : 'prod'}` });
if (result.error) {
    throw result.error;
}

import express from 'express';
import * as http from 'http';
import * as winston from 'winston';
import * as expressWinston from 'express-winston';
import cors from 'cors';
import { CommonRoutesConfig } from './common/common.routes.config';
import { AuthRoutes } from './auth/auth.routes.config';
import { UsersRoutes } from './users/users.routes.config';
import { NewsRoutes } from './news/news.routes.config';
import { BackupsRoutes } from './backups/backups.routes.config';
import { DesignsRoutes } from './designs/designs.routes.config';
import debug from 'debug';
import helmet from 'helmet';

const app: express.Application = express();
const server: http.Server = http.createServer(app);
const routes: Array<CommonRoutesConfig> = [];
const debugLog: debug.IDebugger = debug('app');

app.use(express.json({limit: '4MB'}));
app.use(cors());
app.use(helmet());

const loggerOptions: expressWinston.LoggerOptions = {
    transports: [new winston.transports.Console()],
    format: winston.format.combine(
        winston.format.json(),
        winston.format.prettyPrint(),
        winston.format.colorize({ all: true })
    ),
};

if (!process.env.DEBUG) {
    loggerOptions.meta = false; // when not debugging, make terse
}

app.use(expressWinston.logger(loggerOptions));

routes.push(new AuthRoutes(app));
routes.push(new UsersRoutes(app));
routes.push(new NewsRoutes(app));
routes.push(new BackupsRoutes(app));
routes.push(new DesignsRoutes(app));

export default server.listen(3000, '0.0.0.0', () => {
    debugLog(`Server running and listening on port 3000`);
    routes.forEach((route: CommonRoutesConfig) => {
        debugLog(`Routes configured for ${route.getName()}`);
    });
});