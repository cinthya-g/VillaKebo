import { Request, Response, NextFunction } from "express";
import jwt from 'jsonwebtoken';

const middleware = (req: Request, res: Response, next: NextFunction) => {
    const token = req.query.token || req.body.token;
    if (token && jwt.verify(token, process.env.TOKEN_KEY || 'sshhhhh')) {
        next();
    }
    else {
        res.redirect('/auth/login');
    }
}

export default middleware;