import express from 'express';
import crypto from 'crypto';
import debug from 'debug';
import jwt from 'jsonwebtoken';

const log: debug.IDebugger = debug('app:auth-controllers');

// @ts-expect-error
const jwtSecret: string = process.env.JWT_SECRET;
const expirationSeconds = 3600 * 8;

class AuthController {
    async createJWT(req: express.Request, res: express.Response) {
        try {
            const refreshId = req.body.userId + jwtSecret;
            const salt = crypto.createSecretKey(crypto.randomBytes(16));
            const hash = crypto.createHmac('sha512', salt).update(refreshId).digest('base64');

            req.body.refreshKey = salt.export();
            const token = jwt.sign(req.body, jwtSecret, { expiresIn: expirationSeconds });
            const expirationDate = new Date();
            expirationDate.setSeconds(expirationDate.getSeconds() + expirationSeconds);
            
            return res.status(201).send(
                {
                    tokenType: 'Bearer',
                    expiresIn: expirationSeconds,
                    expiresAt: expirationDate,
                    accessToken: token,
                    refreshToken: hash
                });
        } catch (err) {
            log('JWT Error: %O', err);
            return res.status(500).send();
        }
    }
}

export default new AuthController();