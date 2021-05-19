import { CommonRoutesConfig } from "../common/common.routes.config";
import { PermissionFlag } from "../common/middleware/common.permissionflag.enum";
import { body } from "express-validator";
import InfosController from './controllers/infos.controller';
import InfosMiddleware from './middleware/infos.middleware';
import jwtMiddleware from "../auth/middleware/jwt.middleware";
import permissionMiddleware from "../common/middleware/common.permission.middleware";
import BodyValidationMiddleware from "../common/middleware/body.validation.middleware";
import express from "express";

export class InfosRoutes extends CommonRoutesConfig {
    constructor(app: express.Application) {
        super(app,  'InfosRoutes');
    }

    configureRoutes(): express.Application {
        this.app.get(`/v1/infos/:updateMode`, [
            InfosController.getInfoByMode
        ]);

        this.app.post(`/v1/infos/register`, [
            jwtMiddleware.validAndUpToDateJWT,
            permissionMiddleware.permissionFlagRequired(PermissionFlag.ADMIN_PERMISSION),
            body('mode').isString().notEmpty(),
            body('version').isString().notEmpty(),
            body('downloadUrl').isString().notEmpty(),
            body('changelogUrl').isString().notEmpty(),
            BodyValidationMiddleware.verifyBodyFieldsErrors,
            InfosMiddleware.validateInfoDoesntAlreadyExist,
            InfosController.createInfo
        ]);

        this.app.patch(`/v1/infos/:infoId`, [
            jwtMiddleware.validAndUpToDateJWT,
            permissionMiddleware.permissionFlagRequired(PermissionFlag.ADMIN_PERMISSION),
            body('mode').isString().notEmpty().optional(),
            body('version').isString().notEmpty().optional(),
            body('downloadUrl').isString().notEmpty().optional(),
            body('changelogUrl').isString().notEmpty().optional(),
            body('communityDesign').isString().notEmpty().optional(),
            body('communityPreview').isString().notEmpty().optional(),
            BodyValidationMiddleware.verifyBodyFieldsErrors,
            InfosMiddleware.validateInfoExist,
            InfosController.patch
        ]);

        this.app.delete(`/v1/infos/:infoId`, [
            jwtMiddleware.validAndUpToDateJWT,
            permissionMiddleware.permissionFlagRequired(PermissionFlag.ADMIN_PERMISSION),
            BodyValidationMiddleware.verifyBodyFieldsErrors,
            InfosMiddleware.validateInfoExist,
            InfosController.removeInfo
        ]);

        return this.app;
    }
}