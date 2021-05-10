import express from 'express';
import usersService from '../../users/services/users.service';
import * as argon2 from 'argon2';

class AuthMiddleware {
    async verifyUserPassword(req: express.Request, res: express.Response, next: express.NextFunction) {
        const user: any = await usersService.getUserByUsernameWithPassword(req.body.username);
        if (user) {
            const passwordHash = user.password;
            if (await argon2.verify(passwordHash, req.body.password)) {
                req.body = { userId: user._id, username: user.username, permissionFlag: user.permissionFlag };
                return next();
            }
        }
        res.status(400).send({ errors: ['Invalid username and/or password'] });
    }
}

export default new AuthMiddleware();