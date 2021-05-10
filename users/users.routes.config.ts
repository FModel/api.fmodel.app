import { CommonRoutesConfig } from '../common/common.routes.config';
import { PermissionFlag } from '../common/middleware/common.permissionflag.enum';
import { body } from 'express-validator';
import UsersController from './controllers/users.controller';
import UsersMiddleware from './middleware/users.middleware';
import jwtMiddleware from '../auth/middleware/jwt.middleware';
import permissionMiddleware from '../common/middleware/common.permission.middleware';
import BodyValidationMiddleware from '../common/middleware/body.validation.middleware';
import express from 'express';

export class UsersRoutes extends CommonRoutesConfig {
    constructor(app: express.Application) {
        super(app, 'UsersRoutes');
    }

    configureRoutes(): express.Application {
        this.app.post(`/v1/users/register`, [
            body('username').isString().notEmpty().withMessage('Username can\'t be empty'),
            body('password').isLength({ min: 5 }).isString().notEmpty().withMessage('Password must be 5+ characters long'),
            BodyValidationMiddleware.verifyBodyFieldsErrors,
            UsersMiddleware.validateUsernameAvailability,
            UsersController.createUser
        ]);

        this.app.get(`/v1/users`, [
            jwtMiddleware.validAndUpToDateJWT,
            permissionMiddleware.permissionFlagRequired(PermissionFlag.ADMIN_PERMISSION),
            UsersController.listUsers
        ]);

        this.app.get(`/v1/users/:userId`, [
            jwtMiddleware.validAndUpToDateJWT,
            permissionMiddleware.onlySameUserOrAdminCanDoThisAction,
            UsersMiddleware.validateUserExists,
            UsersController.getUserMinimumInfoById
        ]);

        return this.app;
    }
}