import { Request, Response, NextFunction } from "express";
import { ResponseCodes } from "../utils/res-codes";

/**
 * @swagger
 * components:
 *  responses:
 *    UnauthorizedRoleError:
 *      description: User role is not authorized to perform this action
 */

/**
 * Middleware for role-based authorization.
 * It checks if the logged-in user's role matches any of the allowed roles provided to the middleware.
 * If the user's role is allowed, it proceeds to the next middleware function; otherwise, it returns an unauthorized status.
 *
 * @function roleMiddleware
 * @param {Array<string> | string} allowedRoles - A list of roles or a single role that is permitted to access the route.
 * @returns {Function} A middleware function that validates the user's role and either continues to the next middleware or sends an unauthorized response.
 */

const roleMiddleware = (allowedRoles: Array<string> | string) => {
    return (req: Request, res: Response, next: NextFunction) => {
        
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
