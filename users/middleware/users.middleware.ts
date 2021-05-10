import express from 'express';
import userService from '../services/users.service';

class UsersMiddleware {
    async validateUsernameAvailability(req: express.Request, res: express.Response, next: express.NextFunction) {
        const user = await userService.getUserByUsername(req.body.username);
        if (user) {
            res.status(400).send({ errors: ['Username already exists'] });
        } else {
            next();
        }
    }

    async validateSameUsernameBelongToSameUser(req: express.Request, res: express.Response, next: express.NextFunction) {
        const user = await userService.getUserByUsername(req.body.username);
        if (user && user._id === req.params.userId) {
            res.locals.user = user;
            next();
        } else {
            res.status(400).send({ errors: ['Invalid username'] });
        }
    }

    async validateUserExists(req: express.Request, res: express.Response, next: express.NextFunction) {
        const user = await userService.getById(req.params.userId);
        if (user) {
            next();
        } else {
            res.status(404).send({ errors: [`User ${req.params.userId} not found`] });
        }
    }
}

export default new UsersMiddleware();