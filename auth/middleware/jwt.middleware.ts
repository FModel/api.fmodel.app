import express from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

// @ts-expect-error
const jwtSecret: string = process.env.JWT_SECRET;

class JwtMiddleware {
    validAndUpToDateJWT(req: express.Request, res: express.Response, next: express.NextFunction) {
        if (req.headers['authorization']) {
            try {
                const authorization = req.headers['authorization'].split(' ');
                if (authorization[0] !== 'Bearer') {
                    return res.status(401).send();
                } else {
                    res.locals.jwt = jwt.verify(authorization[1], jwtSecret);
                    return next();
                }
            } catch (err) {
                return res.status(403).send();
            }
        } else {
            return res.status(401).send();
        }
    }

    validRefreshToken(req: express.Request, res: express.Response, next: express.NextFunction) {
        const salt = crypto.createSecretKey(Buffer.from(res.locals.jwt.refreshKey.data));
        const hash = crypto.createHmac('sha512', salt).update(res.locals.jwt.userId + jwtSecret).digest('base64');

        if (hash === req.body.refreshToken) {
            req.body = { userId: res.locals.jwt.userId, username: res.locals.jwt.username, permissionFlag: res.locals.jwt.permissionFlag };
            return next();
        } else {
            return res.status(400).send({ errors: ['Invalid refresh token'] });
        }
    }

    verifyRefreshBodyField(req: express.Request, res: express.Response, next: express.NextFunction) {
        if (req.body && req.body.refreshToken) {
            return next();
        } else {
            return res.status(400).send({ errors: ['Missing required field: refreshToken'] });
        }
    }
}

export default new JwtMiddleware();