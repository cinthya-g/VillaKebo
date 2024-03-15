import { Request, Response, NextFunction } from "express";
import { ResponseCodes } from "../utils/res-codes";

const roleMiddleware = (allowedRoles: Array<string> | string) => {
    return (req: Request, res: Response, next: NextFunction) => {
        //console.log("RoleMiddleware (req body user): ", req.body.user);
        
        const user = req.body.user;

        if (typeof allowedRoles === 'string') {
            allowedRoles = [allowedRoles];
        }

        if (user && allowedRoles.includes(user.role)) {
            next();
        } else {
            res.status(ResponseCodes.UNAUTHORIZED).send("Not a valid role");
        }
    };
};

export default roleMiddleware;
