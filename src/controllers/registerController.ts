import { Request, Response } from "express";

import { hashPassword } from "../utils/passwordHash";
import { genToken } from "../utils/genToken";
import { ResponseCodes } from "../utils/res-codes";

import Owner from "../models/owner";
import Caretaker from "../models/caretaker";




class RegisterController {
    /**
 * @swagger
 * tags:
 *   name: Registration
 *   description: User registration operations
 * 
 * /auth/register:
 *   post:
 *     tags: [Registration]
 *     summary: Register a new user
 *     description: Registers a new user as either an owner or a caretaker based on the provided flag.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *               - isOwner
 *             properties:
 *               username:
 *                 type: string
 *                 description: Username for the new account
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address for the new account
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Password for the new account
 *               isOwner:
 *                 type: boolean
 *                 description: Flag to determine if the user is registering as an owner or caretaker
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/Owner'
 *                 token:
 *                   type: string
 *                   description: Authentication token for the user
 *       400:
 *         description: Missing required fields or email already registered
 *       500:
 *         description: Internal Server Error
 */

    async registerUser(req: Request, res: Response) {       
        //console.log('Registering user:', req.body);
        try {
            const data = {
                username: req.body.username,
                email: req.body.email.toLowerCase(),
                password: hashPassword(req.body.password),
                isOwner: req.body.isOwner
            }
            
            if(!data.username || !data.email || !data.password || data.isOwner === undefined) {
                res.status(ResponseCodes.BAD_REQUEST).send("Missing required fields");
                return;
            }
            
            let newUser;
            if(data.isOwner) {
                newUser = await Owner.create(data);
            } else {
                newUser = await Caretaker.create(data);
            }

            const token = genToken(newUser);
            res.status(ResponseCodes.CREATED).json(
                {
                    user: newUser,
                    token: token
                }
            );
        }
        catch (error) {
            console.log('ERROR:', error);
            if (error.code === 11000 && error.keyPattern.email) {
                return res.status(ResponseCodes.BAD_REQUEST).send({ error: "Email is already registered." });
            }

            res.status(ResponseCodes.SERVER_ERROR).send("Internal Server Error");
        }
    }
}

export default new RegisterController();