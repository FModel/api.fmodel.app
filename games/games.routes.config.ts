import { CommonRoutesConfig } from "../common/common.routes.config";
import { PermissionFlag } from "../common/middleware/common.permissionflag.enum";
import { body } from "express-validator";
import GamesController from './controllers/games.controller';
import GamesMiddleware from './middleware/games.middleware';
import jwtMiddleware from '../auth/middleware/jwt.middleware';
import permissionMiddleware from '../common/middleware/common.permission.middleware';
import BodyValidationMiddleware from '../common/middleware/body.validation.middleware';
import express from "express";

export class GamesRoutes extends CommonRoutesConfig {
    constructor(app: express.Application) {
        super(app,  'GamesRoutes');
    }
    
    configureRoutes(): express.Application {
        this.app.get(`/v1/games/:gameName`, [ // get versions per game
            GamesController.listVersionsByGame
        ]);

        this.app.delete(`/v1/games/:gameId`, [ // delete game and all its versions
            jwtMiddleware.validAndUpToDateJWT,
            permissionMiddleware.permissionFlagRequired(PermissionFlag.ADMIN_PERMISSION),
            GamesMiddleware.validateGameExist,
            GamesController.removeGame
        ]);

        this.app.delete(`/v1/games/:gameName/versions`, [ // delete one of the game's versions
            jwtMiddleware.validAndUpToDateJWT,
            permissionMiddleware.permissionFlagRequired(PermissionFlag.ADMIN_PERMISSION),
            body('gameVersion').isString().notEmpty(),
            BodyValidationMiddleware.verifyBodyFieldsErrors,
            GamesMiddleware.validateGameExistByName,
            GamesMiddleware.validateVersionExist,
            GamesController.removeVersion
        ]);

        this.app.delete(`/v1/games/:gameName/versions/dict`, [ // oof, delete one of the custom versions or options of a versions of a game
            jwtMiddleware.validAndUpToDateJWT,
            permissionMiddleware.permissionFlagRequired(PermissionFlag.ADMIN_PERMISSION),
            body('gameVersion').isString().notEmpty(),
            body('fieldName').isString().notEmpty(),
            body('key').isString().notEmpty(),
            BodyValidationMiddleware.verifyBodyFieldsErrors,
            GamesMiddleware.validateGameExistByName,
            GamesMiddleware.validateVersionExist,
            GamesMiddleware.validateDictKeyExist,
            GamesController.removeDictKey
        ]);

        this.app.post(`/v1/games/register`, [ // add a new game with a set of versions
            jwtMiddleware.validAndUpToDateJWT,
            permissionMiddleware.permissionFlagRequired(PermissionFlag.ADMIN_PERMISSION),
            body('gameName').isString().notEmpty(),
            body('displayName').isString().notEmpty(),
            body('versions').exists(),
            BodyValidationMiddleware.verifyBodyFieldsErrors,
            GamesMiddleware.validateGameDoesntAlreadyExist,
            GamesController.createGameAndVersions
        ]);

        this.app.post(`/v1/games/:gameName/versions/register`, [ // add a new version to an already created game
            jwtMiddleware.validAndUpToDateJWT,
            permissionMiddleware.permissionFlagRequired(PermissionFlag.ADMIN_PERMISSION),
            body('gameVersion').isString().notEmpty(),
            body('gameEnum').isString().notEmpty(),
            body('ueVer').isNumeric(),
            body('customVersions').exists(),
            body('options').exists(),
            BodyValidationMiddleware.verifyBodyFieldsErrors,
            GamesMiddleware.validateGameExistByName,
            GamesMiddleware.validateVersionDoesntAlreadyExist,
            GamesController.createVersion
        ]);

        this.app.post(`/v1/games/:gameName/versions/dict/register`, [ // add a new custom version or option to an already created version of an already created game
            jwtMiddleware.validAndUpToDateJWT,
            permissionMiddleware.permissionFlagRequired(PermissionFlag.ADMIN_PERMISSION),
            body('gameVersion').isString().notEmpty(),
            body('fieldName').isString().notEmpty(),
            body('key').isString().notEmpty(),
            body('value').isString().notEmpty(),
            BodyValidationMiddleware.verifyBodyFieldsErrors,
            GamesMiddleware.validateGameExistByName,
            GamesMiddleware.validateVersionExist,
            GamesMiddleware.validateDictKeyDoesntAlreadyExist,
            GamesController.createDictKey
        ]);

        this.app.put(`/v1/games/:gameName/versions`, [ // edit one of the game's versions
            jwtMiddleware.validAndUpToDateJWT,
            permissionMiddleware.permissionFlagRequired(PermissionFlag.ADMIN_PERMISSION),
            body('gameVersion').isString().notEmpty(),
            body('gameEnum').isString().notEmpty(),
            body('ueVer').isNumeric(),
            BodyValidationMiddleware.verifyBodyFieldsErrors,
            GamesMiddleware.validateGameExistByName,
            GamesMiddleware.validateVersionExist,
            GamesController.editVersion
        ]);

        this.app.put(`/v1/games/:gameName/versions/dict`, [ // edit one of the game's custom versions or options
            jwtMiddleware.validAndUpToDateJWT,
            permissionMiddleware.permissionFlagRequired(PermissionFlag.ADMIN_PERMISSION),
            body('gameVersion').isString().notEmpty(),
            body('fieldName').isString().notEmpty(),
            body('key').isString().notEmpty(),
            body('value').isString().notEmpty(),
            BodyValidationMiddleware.verifyBodyFieldsErrors,
            GamesMiddleware.validateGameExistByName,
            GamesMiddleware.validateVersionExist,
            GamesMiddleware.validateDictKeyExist,
            GamesController.editDictKey
        ]);
        
        return this.app;
    }
}