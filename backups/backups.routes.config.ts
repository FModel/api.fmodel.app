import { CommonRoutesConfig } from '../common/common.routes.config';
import { PermissionFlag } from '../common/middleware/common.permissionflag.enum';
import { body } from "express-validator";
import BackupsController from './controllers/backups.controller';
import BackupsMiddleware from './middleware/backups.middleware';
import jwtMiddleware from '../auth/middleware/jwt.middleware';
import permissionMiddleware from '../common/middleware/common.permission.middleware';
import BodyValidationMiddleware from '../common/middleware/body.validation.middleware';
import express from "express";

export class BackupsRoutes extends CommonRoutesConfig {
    constructor(app: express.Application) {
        super(app, 'BackupsRoutes');
    }
    
    configureRoutes(): express.Application {
        this.app.get(`/v1/backups/:gameName`, [
            BackupsController.listBackupsByGame
        ]);
        
        this.app.post(`/v1/backups/register`, [
            jwtMiddleware.validAndUpToDateJWT,
            permissionMiddleware.permissionFlagRequired(PermissionFlag.ADMIN_PERMISSION),
            body('gameName').isString().notEmpty(),
            body('fileName').isString().notEmpty(),
            body('downloadUrl').isString().notEmpty(),
            body('fileSize').isNumeric(),
            BodyValidationMiddleware.verifyBodyFieldsErrors,
            BackupsMiddleware.validateBackupDoesntAlreadyExist,
            BackupsController.createBackup
        ]);

        this.app.patch(`/v1/backups/:backupId`, [
            jwtMiddleware.validAndUpToDateJWT,
            permissionMiddleware.permissionFlagRequired(PermissionFlag.ADMIN_PERMISSION),
            body('gameName').isString().notEmpty().optional(),
            body('fileName').isString().notEmpty().optional(),
            body('downloadUrl').isString().notEmpty().optional(),
            body('fileSize').isNumeric().optional(),
            BodyValidationMiddleware.verifyBodyFieldsErrors,
            BackupsMiddleware.validateBackupExist,
            BackupsController.patch
        ]);

        this.app.get(`/v1/backups`, [
            jwtMiddleware.validAndUpToDateJWT,
            permissionMiddleware.permissionFlagRequired(PermissionFlag.ADMIN_PERMISSION),
            BackupsController.listBackups
        ])
        
        return this.app;
    }
}