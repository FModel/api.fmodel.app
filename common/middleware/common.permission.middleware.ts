import { PermissionFlag } from './common.permissionflag.enum';
import express from 'express';
import debug from 'debug';

const log: debug.IDebugger = debug('app:common-permission-middleware');

class CommonPermissionMiddleware {
    permissionFlagRequired(requiredPermissionFlag: PermissionFlag) {
        return (req: express.Request, res: express.Response, next: express.NextFunction) => {
            try {
                const userPermissionFlag = parseInt(res.locals.jwt.permissionFlag);
                if (userPermissionFlag & requiredPermissionFlag) {
                    next();
                } else {
                    res.status(403).send();
                }
            } catch (e) {
                log(e);
            }
        };
    }

    async onlySameUserOrAdminCanDoThisAction(req: express.Request, res: express.Response, next: express.NextFunction) {
        if (req.params && req.params.userId && req.params.userId === res.locals.jwt.userId) {
            next();
        }
        
        const userPermissionFlag = parseInt(res.locals.jwt.permissionFlag);
        if (userPermissionFlag & PermissionFlag.ADMIN_PERMISSION) {
            next();
        }
        
        res.status(403).send();
    }
}

export default new CommonPermissionMiddleware();