import { validationResult } from 'express-validator';
import express from 'express';

class BodyValidationMiddleware {
    verifyBodyFieldsErrors(req: express.Request, res: express.Response, next: express.NextFunction) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).send({ errors: errors.array() });
        }
        return next();
    }
}

export default new BodyValidationMiddleware();