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
            body('gameName').isString().notEmpty().withMessage('Please specify a game for this backup file'),
            body('fileName').isString().notEmpty().withMessage('Please specify the backup file name'),
            body('downloadUrl').isString().notEmpty().withMessage('Please the backup file download url'),
            body('fileSize').isNumeric().withMessage('Please specify the backup file size'),
            BodyValidationMiddleware.verifyBodyFieldsErrors,
            BackupsMiddleware.validateBackupDoesntAlreadyExist,
            BackupsController.createBackup
        ]);

        this.app.patch(`/v1/backups/:backupId`, [
            jwtMiddleware.validAndUpToDateJWT,
            permissionMiddleware.permissionFlagRequired(PermissionFlag.ADMIN_PERMISSION),
            body('gameName').isString().notEmpty().withMessage('Please specify a game for this backup file').optional(),
            body('fileName').isString().notEmpty().withMessage('Please specify the backup file name').optional(),
            body('downloadUrl').isString().notEmpty().withMessage('Please the backup file download url').optional(),
            body('fileSize').isNumeric().withMessage('Please specify the backup file size').optional(),
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