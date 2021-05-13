import { CommonRoutesConfig } from "../common/common.routes.config";
import { PermissionFlag } from "../common/middleware/common.permissionflag.enum";
import { body } from "express-validator";
import DesignsController from './controllers/designs.controller';
import DesignsMiddleware from './middleware/designs.middleware';
import jwtMiddleware from "../auth/middleware/jwt.middleware";
import permissionMiddleware from "../common/middleware/common.permission.middleware";
import BodyValidationMiddleware from "../common/middleware/body.validation.middleware";
import express from "express";

export class DesignsRoutes extends CommonRoutesConfig {
    constructor(app: express.Application) {
        super(app,  'DesignsRoutes');
    }

    configureRoutes(): express.Application {
        this.app.get(`/v1/designs/:designName`, [
            DesignsController.getDesignByName
        ]);

        this.app.post(`/v1/designs/register`, [
            jwtMiddleware.validAndUpToDateJWT,
            permissionMiddleware.permissionFlagRequired(PermissionFlag.ADMIN_PERMISSION),
            body('name').isString().notEmpty(),
            body('drawSource').isBoolean(),
            body('drawSeason').isBoolean(),
            body('drawSeasonShort').isBoolean(),
            body('drawSet').isBoolean(),
            body('drawSetShort').isBoolean(),
            body('fonts').exists(),
            body('gameplayTags').exists(),
            body('rarities').exists(),
            BodyValidationMiddleware.verifyBodyFieldsErrors,
            DesignsMiddleware.validateDesignDoesntAlreadyExist,
            DesignsController.createDesign
        ]);

        this.app.delete(`/v1/designs/:designId`, [
            jwtMiddleware.validAndUpToDateJWT,
            permissionMiddleware.permissionFlagRequired(PermissionFlag.ADMIN_PERMISSION),
            DesignsMiddleware.validateDesignExists,
            DesignsController.removeDesign
        ]);

        return this.app;
    }
}