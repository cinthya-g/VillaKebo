import { Request, Response } from "express";

import { comparePassword } from "../utils/passwordHash";
import { genToken } from "../utils/genToken";
import { ResponseCodes } from "../utils/res-codes";

import Caretaker from "../models/caretaker";

class CaretakerController{
    
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