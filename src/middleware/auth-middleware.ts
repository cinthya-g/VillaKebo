import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/genToken";
import { ResponseCodes } from "../utils/res-codes";

const middleware = (req: Request, res: Response, next: NextFunction) => {
    const token = req.query.token || req.body.token;
    if (token) {  
        const decoded = verifyToken(token);
        if (decoded) {
            req.body.user = decoded;
            //console.log("AuthMiddleware: req body user: ", req.body.user);
            next();
        }
        else {
            res.status(ResponseCodes.UNAUTHORIZED).send('Unauthorized');
        }
    }
    else {
        // TODO: Decide to either make a new route for this or to redirect to the owner-login page
        res.redirect('/auth/owner-login');
    }
}

export default middleware;