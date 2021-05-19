import { CommonRoutesConfig } from "../common/common.routes.config";
import { PermissionFlag } from "../common/middleware/common.permissionflag.enum";
import { body } from 'express-validator';
import NewsController from './controllers/news.controller';
import NewsMiddleware from './middleware/news.middleware';
import jwtMiddleware from '../auth/middleware/jwt.middleware';
import permissionMiddleware from '../common/middleware/common.permission.middleware';
import BodyValidationMiddleware from '../common/middleware/body.validation.middleware';
import express from "express";

export class NewsRoutes extends CommonRoutesConfig {
    constructor(app: express.Application) {
        super(app,  'NewsRoutes');
    }
    
    configureRoutes(): express.Application {
        this.app.get(`/v1/news/:version`, [
            NewsController.getNewsByVersion
        ]);
        
        this.app.post(`/v1/news/register`, [
            jwtMiddleware.validAndUpToDateJWT,
            permissionMiddleware.permissionFlagRequired(PermissionFlag.ADMIN_PERMISSION),
            body('version').isString().notEmpty(),
            body('messages').isArray().notEmpty(),
            body('colors').isArray().notEmpty(),
            body('newLines').isArray().notEmpty(),
            BodyValidationMiddleware.verifyBodyFieldsErrors,
            NewsMiddleware.validateNewsIsComplete,
            NewsMiddleware.validateVersionDoesntAlreadyExist,
            NewsController.createNews
        ]);
        
        this.app.put(`/v1/news/:version`, [
            jwtMiddleware.validAndUpToDateJWT,
            permissionMiddleware.permissionFlagRequired(PermissionFlag.ADMIN_PERMISSION),
            body('messages').isArray().notEmpty(),
            body('colors').isArray().notEmpty(),
            body('newLines').isArray().notEmpty(),
            BodyValidationMiddleware.verifyBodyFieldsErrors,
            NewsMiddleware.validateNewsIsComplete,
            NewsMiddleware.validateVersionExist,
            NewsController.putByVersion
        ]);

        this.app.get(`/v1/news`, [
            jwtMiddleware.validAndUpToDateJWT,
            permissionMiddleware.permissionFlagRequired(PermissionFlag.ADMIN_PERMISSION),
            NewsController.listNews
        ]);

        this.app.get(`/v1/versions`, [
            jwtMiddleware.validAndUpToDateJWT,
            permissionMiddleware.permissionFlagRequired(PermissionFlag.ADMIN_PERMISSION),
            NewsController.listVersions
        ]);
        
        return this.app;
    }
}