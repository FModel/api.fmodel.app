import { CommonRoutesConfig } from '../common/common.routes.config';
import { body } from 'express-validator';
import authController from './controllers/auth.controller';
import jwtMiddleware from './middleware/jwt.middleware';
import authMiddleware from './middleware/auth.middleware';
import BodyValidationMiddleware from '../common/middleware/body.validation.middleware';
import express from 'express';

export class AuthRoutes extends CommonRoutesConfig {
    constructor(app: express.Application) {
        super(app, 'AuthRoutes');
    }

    configureRoutes(): express.Application {
        this.app.post(`/v1/oauth/token`, [
            body('username').isString().notEmpty(),
            body('password').isString().notEmpty(),
            BodyValidationMiddleware.verifyBodyFieldsErrors,
            authMiddleware.verifyUserPassword,
            authController.createJWT
        ]);

        this.app.post(`/v1/oauth/refresh-token`, [
            jwtMiddleware.validAndUpToDateJWT,
            jwtMiddleware.verifyRefreshBodyField,
            jwtMiddleware.validRefreshToken,
            authController.createJWT
        ]);
        
        return this.app;
    }
}