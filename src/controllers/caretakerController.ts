import { Request, Response } from "express";

import { comparePassword } from "../utils/passwordHash";
import { genToken } from "../utils/genToken";
import { ResponseCodes } from "../utils/res-codes";

import Caretaker from "../models/caretaker";




class CaretakerController{
 /**
 * @swagger
 * tags:
 *   name: Caretaker
 *   description: Caretaker related operations
 * 
 * /auth/caretaker-login:
 *   post:
 *     tags: [Caretaker]
 *     summary: Log in a caretaker
 *     description: Authenticates a caretaker and returns an auth token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Caretaker's email address
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Caretaker's password
 *     responses:
 *       200:
 *         description: Successful login
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: Authentication token
 *                 user:
 *                   $ref: '#/components/schemas/Caretaker'
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Caretaker not found or incorrect password
 *       500:
 *         description: Internal Server Error
 */   
    async loginCaretaker(req: Request, res: Response) {
        try {
            let { email, password } = req.body;

            if (!email || !password) {
                res.status(ResponseCodes.BAD_REQUEST).send("Missing required fields");
                return;
            }

            const caretaker = await Caretaker.findOne({ email: email.toLowerCase() });
            if (!caretaker || !comparePassword(password, caretaker.password)) {
                res.status(ResponseCodes.UNAUTHENTICATED).send("Caretaker not found or incorrect password");
                return;
            }
            
            const token = genToken(caretaker);
            res.status(ResponseCodes.SUCCESS).json(
                {
                    token: token,
                    user: caretaker
                }
            );
        }
        catch (error) {
            res.status(ResponseCodes.SERVER_ERROR).send("Internal Server Error");
        }
    }

}

export default new CaretakerController();