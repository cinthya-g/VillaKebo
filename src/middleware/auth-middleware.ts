import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/genToken";
import { ResponseCodes } from "../utils/res-codes";

/**
 * @swagger
 * components:
 *  securitySchemes:
 *    bearerAuth:
 *      type: http
 *      scheme: bearer
 *      bearerFormat: JWT
 *  responses:
 *    UnauthorizedError:
 *      description: Unauthorized access, invalid or missing token
 *    RedirectLogin:
 *      description: Redirect to the login page due to missing token
 */

/**
 * Middleware for user token authentication.
 * Verifies the token provided in the query or request body.
 * If the token is valid, allows to proceed to the next middleware.
 * Otherwise, responds with an unauthorized status or redirects to the login page.
 * 
 * @param {Request} req - The HTTP request
 * @param {Response} res - The HTTP response
 * @param {NextFunction} next - The next middleware function in the chain
 */


const middleware = (req: Request, res: Response, next: NextFunction) => {
    const bearerHeader = req.headers['authorization'];
    if (bearerHeader && typeof bearerHeader !== 'undefined') {
        const bearer = bearerHeader.split(' '); 
        const token = bearer[1]; 
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
        console.log("Middleware: invalid!")
        res.redirect('/auth/owner-login');
    }
}

export default middleware;